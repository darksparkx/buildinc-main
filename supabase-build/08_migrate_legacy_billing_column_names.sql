-- Optional one-time: if `subscriber_entitlements` still has legacy paddle_*, stripe_*, or older
-- provider-specific column names (`customer_id`, `subscription_id`, …), merge them into unified
-- `billing_*` columns — then drop legacy columns. Safe to run on databases that already
-- use unified billing columns (no-ops + IF EXISTS).

alter table public.subscriber_entitlements
  add column if not exists billing_provider text;
alter table public.subscriber_entitlements
  add column if not exists billing_customer_id text;
alter table public.subscriber_entitlements
  add column if not exists billing_subscription_id text;

-- Backfill from legacy column names when present
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriber_entitlements'
      and column_name = 'paddle_customer_id'
  ) then
    update public.subscriber_entitlements e
    set
      billing_customer_id = coalesce(e.billing_customer_id, e.paddle_customer_id),
      billing_subscription_id = coalesce(e.billing_subscription_id, e.paddle_subscription_id),
      billing_provider = coalesce(
        e.billing_provider,
        case when e.paddle_subscription_id is not null or e.paddle_customer_id is not null
          then 'paddle' else null end
      )
    where e.paddle_customer_id is not null or e.paddle_subscription_id is not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriber_entitlements'
      and column_name = 'razorpay_customer_id'
  ) then
    update public.subscriber_entitlements e
    set
      billing_customer_id = coalesce(e.billing_customer_id, e.razorpay_customer_id),
      billing_subscription_id = coalesce(e.billing_subscription_id, e.razorpay_subscription_id),
      billing_provider = coalesce(
        e.billing_provider,
        case when e.razorpay_subscription_id is not null or e.razorpay_customer_id is not null
          then 'payment' else null end
      )
    where e.razorpay_customer_id is not null or e.razorpay_subscription_id is not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriber_entitlements'
      and column_name = 'stripe_customer_id'
  ) then
    update public.subscriber_entitlements e
    set
      billing_customer_id = coalesce(e.billing_customer_id, e.stripe_customer_id),
      billing_subscription_id = coalesce(e.billing_subscription_id, e.stripe_subscription_id),
      billing_provider = coalesce(
        e.billing_provider,
        case when e.stripe_subscription_id is not null or e.stripe_customer_id is not null
          then 'stripe' else null end
      )
    where e.stripe_customer_id is not null or e.stripe_subscription_id is not null;
  end if;
end $$;

drop index if exists public.idx_subscriber_entitlements_paddle_subscription;
drop index if exists public.idx_subscriber_entitlements_razorpay_subscription;
drop index if exists public.idx_subscriber_entitlements_stripe_subscription;

alter table public.subscriber_entitlements drop column if exists paddle_customer_id;
alter table public.subscriber_entitlements drop column if exists paddle_subscription_id;
alter table public.subscriber_entitlements drop column if exists razorpay_customer_id;
alter table public.subscriber_entitlements drop column if exists razorpay_subscription_id;
alter table public.subscriber_entitlements drop column if exists stripe_customer_id;
alter table public.subscriber_entitlements drop column if exists stripe_subscription_id;

create index if not exists idx_subscriber_entitlements_billing_subscription
  on public.subscriber_entitlements (billing_subscription_id)
  where billing_subscription_id is not null;
