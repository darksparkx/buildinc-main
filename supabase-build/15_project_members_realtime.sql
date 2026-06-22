-- Run once: live project member changes for admins and other project members.
-- Safe to re-run.

alter table public.project_members replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'project_members'
  ) then
    alter publication supabase_realtime add table public.project_members;
  end if;
end $$;

notify pgrst, 'reload schema';
