-- P4.8 — per-member budget visibility + masked read views for API/RLS

alter table public.project_members
  add column if not exists "canSeeBudget" boolean not null default false;

comment on column public.project_members."canSeeBudget" is
  'When true, this member may see project/phase/task/material financial fields. Org owner/admin and project owner always see budget.';

create or replace function public.can_view_project_financials(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = p_project_id
      and (
        p.owner = auth.uid()
        or (p."orgId" is not null and public.is_org_admin_or_owner(p."orgId"))
        or exists (
          select 1
          from public.project_members pm
          where pm."projectId" = p.id
            and pm."userId" = auth.uid()
            and pm."canSeeBudget" = true
        )
      )
  );
$$;

grant execute on function public.can_view_project_financials(uuid) to authenticated;

-- Read-only views: financial columns zeroed/null when caller lacks access
create or replace view public.projects_app
with (security_invoker = true)
as
select
  p.id,
  p.created_at,
  p.name,
  p.owner,
  p.description,
  p."orgId",
  p."startDate",
  p."endDate",
  case
    when public.can_view_project_financials(p.id) then p.budget
    else 0::numeric(14, 2)
  end as budget,
  case
    when public.can_view_project_financials(p.id) then p.spent
    else 0::numeric(14, 2)
  end as spent,
  p.location,
  p.status,
  p.category,
  p."projectTypeId",
  case
    when public.can_view_project_financials(p.id) then p."totalSqft"
    else null::numeric(14, 2)
  end as "totalSqft",
  case
    when public.can_view_project_financials(p.id) then p."budgetPerSqft"
    else null::numeric(14, 2)
  end as "budgetPerSqft",
  case
    when public.can_view_project_financials(p.id) then p."buildingSpecJson"
    else null::jsonb
  end as "buildingSpecJson"
from public.projects p;

create or replace view public.phases_app
with (security_invoker = true)
as
select
  ph.id,
  ph."projectId",
  ph.created_at,
  ph.name,
  ph.description,
  ph."startDate",
  ph."endDate",
  case
    when public.can_view_project_financials(ph."projectId") then ph.budget
    else 0::numeric(14, 2)
  end as budget,
  ph."order"
from public.phases ph;

create or replace view public.tasks_app
with (security_invoker = true)
as
select
  t.id,
  t.created_at,
  t."phaseId",
  t."projectId",
  t."projectName",
  t."assignedTo",
  t.name,
  t.status,
  case
    when public.can_view_project_financials(t."projectId") then t."plannedBudget"
    else 0::numeric(14, 2)
  end as "plannedBudget",
  t.description,
  t."startDate",
  t."endDate",
  t."completedDate",
  t."order",
  t."completionNotes",
  t."rejectionReason",
  case
    when public.can_view_project_financials(t."projectId") then t.spent
    else 0::numeric(14, 2)
  end as spent,
  t."estimatedDuration",
  t."approvedBy",
  t."paymentCompleted",
  t."materialsCompleted"
from public.tasks t;

create or replace view public.materials_app
with (security_invoker = true)
as
select
  m.id,
  m."taskId",
  m."materialId",
  m.name,
  m."plannedQuantity",
  m."usedQuantity",
  case
    when public.can_view_project_financials(t."projectId") then m."unitCost"
    else 0::numeric(14, 2)
  end as "unitCost",
  m.unit,
  m.requested,
  m.approved,
  m."deliveredQuantity",
  m."wasteQuantity"
from public.materials m
inner join public.tasks t on t.id = m."taskId";

grant select on public.projects_app to authenticated;
grant select on public.phases_app to authenticated;
grant select on public.tasks_app to authenticated;
grant select on public.materials_app to authenticated;
