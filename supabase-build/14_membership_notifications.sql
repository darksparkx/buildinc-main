-- Notify users when they are removed from an organisation or project.
-- Safe to re-run.

create table if not exists public.membership_notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  "recipientId" uuid not null references public.profiles(id) on delete cascade,
  "actorId" uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('removed_from_organisation', 'removed_from_project')),
  "orgId" uuid references public.organisations(id) on delete set null,
  "projectId" uuid references public.projects(id) on delete set null,
  "entityName" text not null,
  "readAt" timestamptz
);

create index if not exists idx_membership_notifications_recipient
  on public.membership_notifications ("recipientId");

create index if not exists idx_membership_notifications_unread
  on public.membership_notifications ("recipientId")
  where "readAt" is null;

alter table public.membership_notifications enable row level security;

drop policy if exists membership_notifications_select_recipient on public.membership_notifications;
create policy membership_notifications_select_recipient on public.membership_notifications
for select to authenticated
using ("recipientId" = auth.uid());

drop policy if exists membership_notifications_insert_actor on public.membership_notifications;
create policy membership_notifications_insert_actor on public.membership_notifications
for insert to authenticated
with check (
  "actorId" = auth.uid()
  and "recipientId" <> auth.uid()
  and (
    (
      kind = 'removed_from_organisation'
      and "orgId" is not null
      and public.is_org_admin_or_owner("orgId")
    )
    or (
      kind = 'removed_from_project'
      and "projectId" is not null
      and public.can_manage_project("projectId")
    )
  )
);

drop policy if exists membership_notifications_update_recipient on public.membership_notifications;
create policy membership_notifications_update_recipient on public.membership_notifications
for update to authenticated
using ("recipientId" = auth.uid());

alter table public.membership_notifications replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'membership_notifications'
  ) then
    alter publication supabase_realtime add table public.membership_notifications;
  end if;
end $$;

create or replace function public.notify_removed_from_organisation(
  p_recipient_id uuid,
  p_org_id uuid,
  p_entity_name text
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null or auth.uid() = p_recipient_id then
    return;
  end if;

  if not public.is_org_admin_or_owner(p_org_id) then
    raise exception 'FORBIDDEN'
      using message = 'You cannot send this organisation removal notification.';
  end if;

  insert into public.membership_notifications (
    "recipientId",
    "actorId",
    kind,
    "orgId",
    "projectId",
    "entityName"
  )
  values (
    p_recipient_id,
    auth.uid(),
    'removed_from_organisation',
    p_org_id,
    null,
    p_entity_name
  );
end;
$$;

create or replace function public.notify_removed_from_project(
  p_recipient_id uuid,
  p_project_id uuid,
  p_entity_name text
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null or auth.uid() = p_recipient_id then
    return;
  end if;

  if not public.can_manage_project(p_project_id) then
    raise exception 'FORBIDDEN'
      using message = 'You cannot send this project removal notification.';
  end if;

  insert into public.membership_notifications (
    "recipientId",
    "actorId",
    kind,
    "orgId",
    "projectId",
    "entityName"
  )
  values (
    p_recipient_id,
    auth.uid(),
    'removed_from_project',
    null,
    p_project_id,
    p_entity_name
  );
end;
$$;

grant execute on function public.notify_removed_from_organisation(uuid, uuid, text) to authenticated;
grant execute on function public.notify_removed_from_project(uuid, uuid, text) to authenticated;

notify pgrst, 'reload schema';
