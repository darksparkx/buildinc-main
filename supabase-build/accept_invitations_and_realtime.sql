-- Run once: accept org/project invites reliably + deliver invite requests in realtime.
-- Safe to re-run.

-- Filtered realtime on requests.requestedTo requires full row replica identity.
alter table public.requests replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'requests'
  ) then
    alter publication supabase_realtime add table public.requests;
  end if;
end $$;

alter table public.organisation_members replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'organisation_members'
  ) then
    alter publication supabase_realtime add table public.organisation_members;
  end if;
end $$;

create or replace function public.accept_organisation_invitation(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  r public.requests%rowtype;
  v_org_id uuid;
  v_member public.organisation_members%rowtype;
begin
  select * into r
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND' using message = 'Invitation not found.';
  end if;

  if r.type <> 'JoinOrganisation'::public.request_type_enum then
    raise exception 'INVALID_REQUEST' using message = 'Not an organisation invitation.';
  end if;

  if r.status <> 'Pending'::public.approval_status_enum then
    raise exception 'REQUEST_NOT_PENDING' using message = 'This invitation is no longer pending.';
  end if;

  if r."requestedTo" <> auth.uid() then
    raise exception 'FORBIDDEN' using message = 'Only the invited user can accept this invitation.';
  end if;

  v_org_id := (r."requestData"->>'organisationId')::uuid;
  if v_org_id is null then
    raise exception 'INVALID_REQUEST' using message = 'Invalid organisation invitation.';
  end if;

  insert into public.organisation_members (id, "orgId", "userId", role, "joinedAt")
  values (gen_random_uuid(), v_org_id, auth.uid(), 'Employee', now())
  on conflict ("orgId", "userId") do update
    set role = excluded.role
  returning * into v_member;

  update public.requests
  set status = 'Approved',
      "approvedBy" = auth.uid(),
      "approvedAt" = now()
  where id = p_request_id;

  return jsonb_build_object(
    'member', to_jsonb(v_member),
    'orgId', v_org_id,
    'requestId', p_request_id
  );
end;
$$;

create or replace function public.accept_project_invitation(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  r public.requests%rowtype;
  v_project_id uuid;
  v_member public.project_members%rowtype;
begin
  select * into r
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND' using message = 'Invitation not found.';
  end if;

  if r.type <> 'JoinProject'::public.request_type_enum then
    raise exception 'INVALID_REQUEST' using message = 'Not a project invitation.';
  end if;

  if r.status <> 'Pending'::public.approval_status_enum then
    raise exception 'REQUEST_NOT_PENDING' using message = 'This invitation is no longer pending.';
  end if;

  if r."requestedTo" <> auth.uid() then
    raise exception 'FORBIDDEN' using message = 'Only the invited user can accept this invitation.';
  end if;

  v_project_id := (r."requestData"->>'projectId')::uuid;
  if v_project_id is null then
    raise exception 'INVALID_REQUEST' using message = 'Invalid project invitation.';
  end if;

  insert into public.project_members (id, "projectId", "userId", role, "joinedAt")
  values (gen_random_uuid(), v_project_id, auth.uid(), 'Employee', now())
  on conflict ("projectId", "userId") do update
    set role = excluded.role
  returning * into v_member;

  update public.requests
  set status = 'Approved',
      "approvedBy" = auth.uid(),
      "approvedAt" = now()
  where id = p_request_id;

  return jsonb_build_object(
    'member', to_jsonb(v_member),
    'projectId', v_project_id,
    'requestId', p_request_id
  );
end;
$$;

grant execute on function public.accept_organisation_invitation(uuid) to authenticated;
grant execute on function public.accept_project_invitation(uuid) to authenticated;

notify pgrst, 'reload schema';
