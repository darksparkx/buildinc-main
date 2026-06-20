-- P4.2 — Subscriber estimator rate card (single source for generation)
-- Run after 11_project_building_spec.sql

create table if not exists public.estimator_rate_cards (
  subscriber_id uuid primary key references public.profiles(id) on delete cascade,
  card jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.estimator_rate_cards is
  'Estimator defaults per billing subscriber: material unit costs, ₹/sqft benchmarks, finish multipliers.';

alter table public.estimator_rate_cards enable row level security;

drop policy if exists estimator_rate_cards_select_own on public.estimator_rate_cards;
create policy estimator_rate_cards_select_own on public.estimator_rate_cards
for select to authenticated
using (subscriber_id = auth.uid());

drop policy if exists estimator_rate_cards_insert_own on public.estimator_rate_cards;
create policy estimator_rate_cards_insert_own on public.estimator_rate_cards
for insert to authenticated
with check (subscriber_id = auth.uid());

drop policy if exists estimator_rate_cards_update_own on public.estimator_rate_cards;
create policy estimator_rate_cards_update_own on public.estimator_rate_cards
for update to authenticated
using (subscriber_id = auth.uid())
with check (subscriber_id = auth.uid());
