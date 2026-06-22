-- Run once: let assignees submit tasks for review (RLS blocks direct task updates).
-- Safe to re-run.

create or replace function public.submit_task_for_review(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  t public.tasks%rowtype;
begin
  select * into t
  from public.tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception 'TASK_NOT_FOUND' using message = 'Task not found.';
  end if;

  if t."assignedTo" is null or t."assignedTo" <> auth.uid() then
    raise exception 'FORBIDDEN' using message = 'Only the assigned user can submit this task for review.';
  end if;

  if not public.can_access_project(t."projectId") then
    raise exception 'FORBIDDEN' using message = 'You do not have access to this project.';
  end if;

  if t.status not in (
    'Active'::public.status_enum,
    'Pending'::public.status_enum
  ) then
    raise exception 'INVALID_STATUS' using message = 'This task cannot be submitted for review in its current state.';
  end if;

  update public.tasks
  set status = 'Reviewing'::public.status_enum
  where id = p_task_id
  returning * into t;

  return jsonb_build_object('task', to_jsonb(t));
end;
$$;

grant execute on function public.submit_task_for_review(uuid) to authenticated;

notify pgrst, 'reload schema';
