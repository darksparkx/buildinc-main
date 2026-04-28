-- 9/9 — Subscription limits (orgs, projects, seats). Run after 06_billing_subscriptions.sql.
-- Uses SECURITY DEFINER so checks run as org owner’s subscriber even when a member performs the insert.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.subscription_entitlements_allow_writes(p_subscriber_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  r public.subscriber_entitlements%rowtype;
begin
  if exists (select 1 from public.profiles p where p.id = p_subscriber_id and p.admin = true) then
    return true;
  end if;
  select * into r from public.subscriber_entitlements where subscriber_id = p_subscriber_id;
  if not found then
    return false;
  end if;
  if r.plan = 'none'::public.subscription_plan_enum then
    return false;
  end if;
  if lower(trim(r.status)) not in ('active', 'trialing') then
    return false;
  end if;
  if r.current_period_end is not null and r.current_period_end < now() then
    return false;
  end if;
  return true;
end;
$$;

create or replace function public.subscriber_seat_count(p_subscriber_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  with owned_orgs as (
    select id from public.organisations where owner = p_subscriber_id
  ),
  scoped_projects as (
    select p.id
    from public.projects p
    where p."orgId" in (select id from owned_orgs)
      or (p."orgId" is null and p.owner = p_subscriber_id)
  )
  select coalesce(count(distinct uid), 0)::integer from (
    select om."userId" as uid
    from public.organisation_members om
    where om."orgId" in (select id from owned_orgs)
    union
    select pm."userId" as uid
    from public.project_members pm
    where pm."projectId" in (select id from scoped_projects)
  ) s;
$$;

create or replace function public.seat_user_in_subscriber_scope(p_subscriber_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  with owned_orgs as (
    select id from public.organisations where owner = p_subscriber_id
  ),
  scoped_projects as (
    select p.id
    from public.projects p
    where p."orgId" in (select id from owned_orgs)
      or (p."orgId" is null and p.owner = p_subscriber_id)
  )
  select exists (
    select 1
    from public.organisation_members om
    where om."orgId" in (select id from owned_orgs)
      and om."userId" = p_user_id
  )
  or exists (
    select 1
    from public.project_members pm
    where pm."projectId" in (select id from scoped_projects)
      and pm."userId" = p_user_id
  );
$$;

-- ---------------------------------------------------------------------------
-- Organisations: active plan + max_orgs (owned)
-- ---------------------------------------------------------------------------

create or replace function public.enforce_org_subscription_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_cnt integer;
  v_max integer;
begin
  if exists (select 1 from public.profiles p where p.id = new.owner and p.admin = true) then
    return new;
  end if;
  if not public.subscription_entitlements_allow_writes(new.owner) then
    raise exception 'SUBSCRIPTION_REQUIRED_ORG'
      using message = 'Active subscription required to create an organisation. Open Billing (/billing) to activate.';
  end if;
  select e.max_orgs into v_max
  from public.subscriber_entitlements e
  where e.subscriber_id = new.owner;
  if v_max is null then
    raise exception 'SUBSCRIPTION_LIMIT_ORG'
      using message = 'Organisation limit is not set for your plan. Contact support.';
  end if;
  select count(*)::integer into v_cnt from public.organisations where owner = new.owner;
  if v_cnt >= v_max then
    raise exception 'ORG_LIMIT_REACHED'
      using message = format('Organisation limit reached (%s) for your plan. Upgrade under Billing (/billing).', v_max);
  end if;
  return new;
end;
$$;

drop trigger if exists organisations_subscription_before_insert on public.organisations;
create trigger organisations_subscription_before_insert
before insert on public.organisations
for each row execute function public.enforce_org_subscription_before_insert();

-- ---------------------------------------------------------------------------
-- Projects: billing subscriber = org owner (or project owner if no org)
-- ---------------------------------------------------------------------------

create or replace function public.enforce_project_subscription_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_subscriber uuid;
  v_cnt integer;
  v_max integer;
begin
  if new."orgId" is not null then
    select o.owner into v_subscriber from public.organisations o where o.id = new."orgId";
    if v_subscriber is null then
      raise exception 'ORG_NOT_FOUND' using message = 'Organisation not found.';
    end if;
  else
    v_subscriber := new.owner;
  end if;

  if exists (select 1 from public.profiles p where p.id = v_subscriber and p.admin = true) then
    return new;
  end if;
  if not public.subscription_entitlements_allow_writes(v_subscriber) then
    raise exception 'SUBSCRIPTION_REQUIRED_PROJECT'
      using message = 'The organisation owner needs an active subscription to create projects.';
  end if;
  select e.max_projects into v_max
  from public.subscriber_entitlements e
  where e.subscriber_id = v_subscriber;
  if v_max is null then
    raise exception 'SUBSCRIPTION_LIMIT_PROJECT'
      using message = 'Project limit is not set for this subscription. Contact support.';
  end if;

  select count(*)::integer into v_cnt
  from public.projects p
  where (
      p."orgId" is not null
      and exists (select 1 from public.organisations o where o.id = p."orgId" and o.owner = v_subscriber)
    )
    or (p."orgId" is null and p.owner = v_subscriber);

  if v_cnt >= v_max then
    raise exception 'PROJECT_LIMIT_REACHED'
      using message = format('Project limit reached (%s) for this subscription. Upgrade under Billing (/billing).', v_max);
  end if;
  return new;
end;
$$;

drop trigger if exists projects_subscription_before_insert on public.projects;
create trigger projects_subscription_before_insert
before insert on public.projects
for each row execute function public.enforce_project_subscription_before_insert();

-- ---------------------------------------------------------------------------
-- Organisation / project members: distinct seats under subscriber scope
-- ---------------------------------------------------------------------------

create or replace function public.enforce_org_member_seat_limit_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_subscriber uuid;
  v_max integer;
  v_cnt integer;
begin
  select o.owner into v_subscriber from public.organisations o where o.id = new."orgId";
  if v_subscriber is null then
    raise exception 'ORG_NOT_FOUND' using message = 'Organisation not found.';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_subscriber and p.admin = true) then
    return new;
  end if;
  if not public.subscription_entitlements_allow_writes(v_subscriber) then
    raise exception 'SUBSCRIPTION_INACTIVE'
      using message = 'This organisation owner’s subscription is not active.';
  end if;
  select e.max_users into v_max
  from public.subscriber_entitlements e
  where e.subscriber_id = v_subscriber;
  if v_max is null then
    raise exception 'SUBSCRIPTION_LIMIT_SEATS'
      using message = 'Member limit is not set for this subscription. Contact support.';
  end if;

  if public.seat_user_in_subscriber_scope(v_subscriber, new."userId") then
    return new;
  end if;

  v_cnt := public.subscriber_seat_count(v_subscriber);
  if v_cnt >= v_max then
    raise exception 'SEAT_LIMIT_REACHED'
      using message = format('Member limit reached (%s seats) for this subscription. Upgrade under Billing (/billing).', v_max);
  end if;
  return new;
end;
$$;

drop trigger if exists organisation_members_subscription_before_insert on public.organisation_members;
create trigger organisation_members_subscription_before_insert
before insert on public.organisation_members
for each row execute function public.enforce_org_member_seat_limit_before_insert();

create or replace function public.enforce_project_member_seat_limit_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_subscriber uuid;
  v_max integer;
  v_cnt integer;
begin
  select coalesce(org.owner, p.owner) into v_subscriber
  from public.projects p
  left join public.organisations org on org.id = p."orgId"
  where p.id = new."projectId";

  if v_subscriber is null then
    raise exception 'PROJECT_NOT_FOUND' using message = 'Project not found.';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_subscriber and p.admin = true) then
    return new;
  end if;
  if not public.subscription_entitlements_allow_writes(v_subscriber) then
    raise exception 'SUBSCRIPTION_INACTIVE'
      using message = 'This organisation owner’s subscription is not active.';
  end if;
  select e.max_users into v_max
  from public.subscriber_entitlements e
  where e.subscriber_id = v_subscriber;
  if v_max is null then
    raise exception 'SUBSCRIPTION_LIMIT_SEATS'
      using message = 'Member limit is not set for this subscription. Contact support.';
  end if;

  if public.seat_user_in_subscriber_scope(v_subscriber, new."userId") then
    return new;
  end if;

  v_cnt := public.subscriber_seat_count(v_subscriber);
  if v_cnt >= v_max then
    raise exception 'SEAT_LIMIT_REACHED'
      using message = format('Member limit reached (%s seats) for this subscription. Upgrade under Billing (/billing).', v_max);
  end if;
  return new;
end;
$$;

drop trigger if exists project_members_subscription_before_insert on public.project_members;
create trigger project_members_subscription_before_insert
before insert on public.project_members
for each row execute function public.enforce_project_member_seat_limit_before_insert();
