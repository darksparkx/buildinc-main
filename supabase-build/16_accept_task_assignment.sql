-- Run once: let assignees accept/reject TaskAssignment requests (RLS blocks direct task updates).
-- Safe to re-run.

create or replace function public.accept_task_assignment(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  r public.requests%rowtype;
  t public.tasks%rowtype;
  v_end_date timestamptz;
begin
  select * into r
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND' using message = 'Assignment request not found.';
  end if;

  if r.type <> 'TaskAssignment'::public.request_type_enum then
    raise exception 'INVALID_REQUEST' using message = 'Not a task assignment request.';
  end if;

  if r.status <> 'Pending'::public.approval_status_enum then
    raise exception 'REQUEST_NOT_PENDING' using message = 'This assignment is no longer pending.';
  end if;

  if r."requestedTo" <> auth.uid() then
    raise exception 'FORBIDDEN' using message = 'Only the assigned user can accept this task.';
  end if;

  if r."taskId" is null then
    raise exception 'INVALID_REQUEST' using message = 'Invalid task assignment request.';
  end if;

  select * into t
  from public.tasks
  where id = r."taskId"
  for update;

  if not found then
    raise exception 'TASK_NOT_FOUND' using message = 'Task not found.';
  end if;

  if not public.can_access_project(t."projectId") then
    raise exception 'FORBIDDEN' using message = 'You do not have access to this project.';
  end if;

  v_end_date := now() + coalesce(t."estimatedDuration", 0) * interval '1 day';

  update public.tasks
  set "assignedTo" = auth.uid(),
      status = 'Active'::public.status_enum,
      "startDate" = now(),
      "endDate" = v_end_date
  where id = t.id
  returning * into t;

  update public.requests
  set status = 'Approved'::public.approval_status_enum,
      "approvedBy" = auth.uid(),
      "approvedAt" = now()
  where id = p_request_id;

  return jsonb_build_object(
    'task', to_jsonb(t),
    'requestId', p_request_id
  );
end;
$$;

create or replace function public.reject_task_assignment(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  r public.requests%rowtype;
  t public.tasks%rowtype;
begin
  select * into r
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND' using message = 'Assignment request not found.';
  end if;

  if r.type <> 'TaskAssignment'::public.request_type_enum then
    raise exception 'INVALID_REQUEST' using message = 'Not a task assignment request.';
  end if;

  if r.status <> 'Pending'::public.approval_status_enum then
    raise exception 'REQUEST_NOT_PENDING' using message = 'This assignment is no longer pending.';
  end if;

  if r."requestedTo" <> auth.uid() then
    raise exception 'FORBIDDEN' using message = 'Only the assigned user can reject this task.';
  end if;

  if r."taskId" is null then
    raise exception 'INVALID_REQUEST' using message = 'Invalid task assignment request.';
  end if;

  select * into t
  from public.tasks
  where id = r."taskId"
  for update;

  if not found then
    raise exception 'TASK_NOT_FOUND' using message = 'Task not found.';
  end if;

  update public.tasks
  set "assignedTo" = null,
      status = 'Inactive'::public.status_enum,
      "startDate" = null,
      "endDate" = null
  where id = t.id
  returning * into t;

  update public.requests
  set status = 'Rejected'::public.approval_status_enum
  where id = p_request_id;

  return jsonb_build_object(
    'task', to_jsonb(t),
    'requestId', p_request_id
  );
end;
$$;

grant execute on function public.accept_task_assignment(uuid) to authenticated;
grant execute on function public.reject_task_assignment(uuid) to authenticated;

notify pgrst, 'reload schema';
