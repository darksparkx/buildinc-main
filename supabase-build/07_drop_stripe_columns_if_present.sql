-- Optional: run once on a database that had Stripe columns added, if you are removing Stripe.
drop index if exists public.idx_subscriber_entitlements_stripe_subscription;
alter table public.subscriber_entitlements drop column if exists stripe_customer_id;
alter table public.subscriber_entitlements drop column if exists stripe_subscription_id;
