-- 6/6 — Billing entitlements (plan limits + payment provider). Run after 05_storage.sql.
-- Limits apply to the subscriber profile (paying account): count orgs/projects/members
-- in application logic. One external customer + subscription id pair; which provider
-- is set in the billing_provider column (e.g. payment, stripe, paddle, manual, …).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_plan_enum') then
    create type public.subscription_plan_enum as enum (
      'none',
      'starter',
      'professional',
      'enterprise',
      'custom'
    );
  end if;
end $$;

create table if not exists public.subscriber_entitlements (
  subscriber_id uuid primary key references public.profiles(id) on delete cascade,
  plan public.subscription_plan_enum not null default 'none',
  -- Lifecycle: trialing, active, past_due, canceled, paused, incomplete, etc.
  status text not null default 'inactive',
  billing_interval text,
  billing_provider text,
  billing_customer_id text,
  billing_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  -- Effective caps (set by webhooks). NULL = not entitled / use business rules in app.
  max_orgs integer,
  max_projects integer,
  max_users integer,
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriber_entitlements_billing_subscription
  on public.subscriber_entitlements (billing_subscription_id)
  where billing_subscription_id is not null;

comment on table public.subscriber_entitlements is
  'One row per billing subscriber (profile). Updated by server/webhooks only; clients read via RLS.';

comment on column public.subscriber_entitlements.billing_provider is
  'Payment stack for this row, e.g. payment, stripe, paddle, manual.';

comment on column public.subscriber_entitlements.billing_customer_id is
  'Provider customer id (whatever your gateway exposes; one active provider at a time).';

comment on column public.subscriber_entitlements.billing_subscription_id is
  'Provider subscription id.';

comment on column public.subscriber_entitlements.max_orgs is
  'Cap on organisations where profiles.id = subscriber_id as owner (typical counting rule).';

comment on column public.subscriber_entitlements.max_projects is
  'Cap on projects tied to subscriber scope (orgs they own + personal projects per product rules).';

comment on column public.subscriber_entitlements.max_users is
  'Cap on distinct member seats across subscriber scope (define in app: org members, project members, etc.).';

-- Auto-create entitlements row when a profile is created (idempotent).
create or replace function public.ensure_subscriber_entitlements()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  insert into public.subscriber_entitlements (subscriber_id) values (new.id)
  on conflict (subscriber_id) do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_entitlements_after_insert on public.profiles;
create trigger profiles_entitlements_after_insert
after insert on public.profiles
for each row execute function public.ensure_subscriber_entitlements();

insert into public.subscriber_entitlements (subscriber_id)
select p.id from public.profiles p
where not exists (
  select 1 from public.subscriber_entitlements e where e.subscriber_id = p.id
);

alter table public.subscriber_entitlements enable row level security;

drop policy if exists subscriber_entitlements_select_own on public.subscriber_entitlements;
create policy subscriber_entitlements_select_own on public.subscriber_entitlements
for select to authenticated
using (subscriber_id = auth.uid());

-- No insert/update/delete for authenticated — service role (webhooks) bypasses RLS.
