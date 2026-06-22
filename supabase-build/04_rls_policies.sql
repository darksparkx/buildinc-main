-- 4/5 — Enable RLS + policies

alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.projects enable row level security;
alter table public.phases enable row level security;
alter table public.tasks enable row level security;
alter table public.materials enable row level security;
alter table public.material_pricing enable row level security;
alter table public.project_templates enable row level security;
alter table public.organisation_members enable row level security;
alter table public.project_members enable row level security;
alter table public.requests enable row level security;
alter table public.request_photos enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated on public.profiles
for select to authenticated
using (true);

drop policy if exists profiles_update_own on public.profiles;
-- Authenticated users may not change their own admin flag (use service role / SQL as trusted operator).
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and admin = (select p.admin from public.profiles p where p.id = auth.uid())
);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (id = auth.uid() and admin = false);

-- Owner must match directly so INSERT ... RETURNING works for new orgs (before member row exists).
drop policy if exists org_select_visible on public.organisations;
create policy org_select_visible on public.organisations
for select to authenticated
using (
  owner = auth.uid()
  OR exists (
    select 1 from public.organisation_members om
    where om."orgId" = organisations.id
      and om."userId" = auth.uid()
  )
);

drop policy if exists org_insert_owner on public.organisations;
create policy org_insert_owner on public.organisations
for insert to authenticated
with check (owner = auth.uid());

drop policy if exists org_update_owner on public.organisations;
create policy org_update_owner on public.organisations
for update to authenticated
using (owner = auth.uid())
with check (owner = auth.uid());

drop policy if exists org_delete_owner on public.organisations;
create policy org_delete_owner on public.organisations
for delete to authenticated
using (owner = auth.uid());

drop policy if exists org_member_select on public.organisation_members;
create policy org_member_select on public.organisation_members
for select to authenticated
using (public.is_org_member("orgId"));

drop policy if exists org_member_insert_admin on public.organisation_members;
create policy org_member_insert_admin on public.organisation_members
for insert to authenticated
with check (public.is_org_admin_or_owner("orgId"));

drop policy if exists org_member_insert_self_invite on public.organisation_members;
create policy org_member_insert_self_invite on public.organisation_members
for insert to authenticated
with check (
  "userId" = auth.uid()
  and public.has_pending_join_org_invite("orgId")
);

drop policy if exists org_member_update_admin on public.organisation_members;
create policy org_member_update_admin on public.organisation_members
for update to authenticated
using (public.is_org_admin_or_owner("orgId"))
with check (public.is_org_admin_or_owner("orgId"));

drop policy if exists org_member_delete_admin on public.organisation_members;
create policy org_member_delete_admin on public.organisation_members
for delete to authenticated
using (public.is_org_admin_or_owner("orgId"));

drop policy if exists projects_select_visible on public.projects;
create policy projects_select_visible on public.projects
for select to authenticated
using (public.can_access_project(id));

-- owner checked as invoker. Org/membership via is_org_member() (SECURITY DEFINER,
-- row_security off) so the check does not depend on SELECT RLS on organisations /
-- organisation_members during INSERT WITH CHECK (members were failing with inline EXISTS).
drop policy if exists projects_insert_owner on public.projects;
create policy projects_insert_owner on public.projects
for insert to authenticated
with check (
  owner = auth.uid()
  and (
    "orgId" is null
    or public.is_org_member("orgId")
  )
);

drop policy if exists projects_update_manage on public.projects;
create policy projects_update_manage on public.projects
for update to authenticated
using (public.can_manage_project(id))
with check (public.can_manage_project(id));

drop policy if exists projects_delete_manage on public.projects;
create policy projects_delete_manage on public.projects
for delete to authenticated
using (public.can_manage_project(id));

drop policy if exists project_members_select on public.project_members;
create policy project_members_select on public.project_members
for select to authenticated
using (public.can_access_project("projectId"));

drop policy if exists project_members_insert_manage on public.project_members;
create policy project_members_insert_manage on public.project_members
for insert to authenticated
with check (public.can_manage_project("projectId"));

drop policy if exists project_members_insert_self_invite on public.project_members;
create policy project_members_insert_self_invite on public.project_members
for insert to authenticated
with check (
  "userId" = auth.uid()
  and public.has_pending_join_project_invite("projectId")
);

drop policy if exists project_members_update_manage on public.project_members;
create policy project_members_update_manage on public.project_members
for update to authenticated
using (public.can_manage_project("projectId"))
with check (public.can_manage_project("projectId"));

drop policy if exists project_members_delete_manage on public.project_members;
create policy project_members_delete_manage on public.project_members
for delete to authenticated
using (public.can_manage_project("projectId"));

drop policy if exists phases_select_visible on public.phases;
create policy phases_select_visible on public.phases
for select to authenticated
using (public.can_access_project("projectId"));

drop policy if exists phases_write_manage on public.phases;
create policy phases_write_manage on public.phases
for all to authenticated
using (public.can_manage_project("projectId"))
with check (public.can_manage_project("projectId"));

drop policy if exists tasks_select_visible on public.tasks;
create policy tasks_select_visible on public.tasks
for select to authenticated
using (public.can_access_project("projectId"));

drop policy if exists tasks_write_manage on public.tasks;
create policy tasks_write_manage on public.tasks
for all to authenticated
using (public.can_manage_project("projectId"))
with check (public.can_manage_project("projectId"));

drop policy if exists materials_select_visible on public.materials;
create policy materials_select_visible on public.materials
for select to authenticated
using (
  exists (
    select 1
    from public.tasks t
    where t.id = "taskId"
      and public.can_access_project(t."projectId")
  )
);

drop policy if exists materials_write_manage on public.materials;
create policy materials_write_manage on public.materials
for all to authenticated
using (
  exists (
    select 1
    from public.tasks t
    where t.id = "taskId"
      and public.can_manage_project(t."projectId")
  )
)
with check (
  exists (
    select 1
    from public.tasks t
    where t.id = "taskId"
      and public.can_manage_project(t."projectId")
  )
);

drop policy if exists material_pricing_select_own on public.material_pricing;
create policy material_pricing_select_own on public.material_pricing
for select to authenticated
using ("user" = auth.uid());

drop policy if exists material_pricing_write_own on public.material_pricing;
create policy material_pricing_write_own on public.material_pricing
for all to authenticated
using ("user" = auth.uid())
with check ("user" = auth.uid());

drop policy if exists templates_select_authenticated on public.project_templates;
create policy templates_select_authenticated on public.project_templates
for select to authenticated
using (
  owner = auth.uid()
  or owner = public.template_owner_id()
);

drop policy if exists templates_write_owner on public.project_templates;
create policy templates_write_owner on public.project_templates
for all to authenticated
using (owner = auth.uid())
with check (owner = auth.uid());

drop policy if exists requests_select_visible on public.requests;
create policy requests_select_visible on public.requests
for select to authenticated
using (
  "requestedBy" = auth.uid()
  or "requestedTo" = auth.uid()
  or ("projectId" is not null and public.can_access_project("projectId"))
);

drop policy if exists requests_insert_requester on public.requests;
create policy requests_insert_requester on public.requests
for insert to authenticated
with check (
  "requestedBy" = auth.uid()
  and (
    "projectId" is null
    or public.can_access_project("projectId")
  )
);

drop policy if exists requests_update_visible on public.requests;
create policy requests_update_visible on public.requests
for update to authenticated
using (
  "requestedTo" = auth.uid()
  or "requestedBy" = auth.uid()
  or ("projectId" is not null and public.can_manage_project("projectId"))
)
with check (
  "requestedTo" = auth.uid()
  or "requestedBy" = auth.uid()
  or ("projectId" is not null and public.can_manage_project("projectId"))
);

drop policy if exists requests_delete_manage on public.requests;
create policy requests_delete_manage on public.requests
for delete to authenticated
using (
  "requestedBy" = auth.uid()
  or ("projectId" is not null and public.can_manage_project("projectId"))
);

drop policy if exists request_photos_select_visible on public.request_photos;
create policy request_photos_select_visible on public.request_photos
for select to authenticated
using (
  exists (
    select 1
    from public.requests r
    where r.id = request_id
      and (
        r."requestedBy" = auth.uid()
        or r."requestedTo" = auth.uid()
        or (r."projectId" is not null and public.can_access_project(r."projectId"))
      )
  )
);

drop policy if exists request_photos_insert_visible on public.request_photos;
create policy request_photos_insert_visible on public.request_photos
for insert to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1
    from public.requests r
    where r.id = request_id
      and (
        r."requestedBy" = auth.uid()
        or r."requestedTo" = auth.uid()
        or (r."projectId" is not null and public.can_access_project(r."projectId"))
      )
  )
);

drop policy if exists request_photos_delete_uploader on public.request_photos;
create policy request_photos_delete_uploader on public.request_photos
for delete to authenticated
using (uploaded_by = auth.uid());
