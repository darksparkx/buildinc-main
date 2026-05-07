-- Task comments + mention notifications (run after 01_schema / 04_rls_policies).
-- Enable Realtime for these tables in Supabase Dashboard → Database → Replication if you want live updates.

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  "taskId" uuid not null references public.tasks(id) on delete cascade,
  "authorId" uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  "mentionUserIds" uuid[] not null default '{}'::uuid[]
);

create index if not exists idx_task_comments_task_id on public.task_comments ("taskId");

create table if not exists public.comment_mention_notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  "recipientId" uuid not null references public.profiles(id) on delete cascade,
  "actorId" uuid not null references public.profiles(id) on delete cascade,
  "taskId" uuid not null references public.tasks(id) on delete cascade,
  "commentId" uuid not null references public.task_comments(id) on delete cascade,
  "readAt" timestamptz
);

create index if not exists idx_comment_mention_notifications_recipient
  on public.comment_mention_notifications ("recipientId");

create index if not exists idx_comment_mention_notifications_unread
  on public.comment_mention_notifications ("recipientId")
  where "readAt" is null;

alter table public.task_comments enable row level security;
alter table public.comment_mention_notifications enable row level security;

drop policy if exists task_comments_select_visible on public.task_comments;
create policy task_comments_select_visible on public.task_comments
for select to authenticated
using (
  exists (
    select 1
    from public.tasks t
    where t.id = "taskId"
      and public.can_access_project(t."projectId")
  )
);

drop policy if exists task_comments_insert_participant on public.task_comments;
create policy task_comments_insert_participant on public.task_comments
for insert to authenticated
with check (
  "authorId" = auth.uid()
  and exists (
    select 1
    from public.tasks t
    where t.id = "taskId"
      and public.can_access_project(t."projectId")
  )
);

drop policy if exists task_comments_delete_own on public.task_comments;
create policy task_comments_delete_own on public.task_comments
for delete to authenticated
using ("authorId" = auth.uid());

drop policy if exists cmn_select_recipient on public.comment_mention_notifications;
create policy cmn_select_recipient on public.comment_mention_notifications
for select to authenticated
using ("recipientId" = auth.uid());

drop policy if exists cmn_insert_actor on public.comment_mention_notifications;
create policy cmn_insert_actor on public.comment_mention_notifications
for insert to authenticated
with check (
  "actorId" = auth.uid()
  and "recipientId" <> auth.uid()
  and exists (
    select 1
    from public.tasks t
    where t.id = "taskId"
      and public.can_access_project(t."projectId")
  )
);

drop policy if exists cmn_update_recipient on public.comment_mention_notifications;
create policy cmn_update_recipient on public.comment_mention_notifications
for update to authenticated
using ("recipientId" = auth.uid());
