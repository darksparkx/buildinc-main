-- P4.1 — Building spec snapshot + derived sqft metrics on projects
-- Run after 10_task_comments.sql (or latest schema migration).

alter table public.projects
  add column if not exists "projectTypeId" text,
  add column if not exists "totalSqft" numeric(14,2),
  add column if not exists "budgetPerSqft" numeric(14,2),
  add column if not exists "buildingSpecJson" jsonb;

comment on column public.projects."projectTypeId" is
  'P4 catalog id (e.g. R1, C1) from create-project questionnaire.';

comment on column public.projects."totalSqft" is
  'Built-up area (sqft) from questionnaire / generation.';

comment on column public.projects."budgetPerSqft" is
  'Planned budget ÷ totalSqft at generation time.';

comment on column public.projects."buildingSpecJson" is
  'Frozen questionnaire snapshot + labels for audit and regenerate.';

create index if not exists idx_projects_project_type_id
  on public.projects ("projectTypeId")
  where "projectTypeId" is not null;
