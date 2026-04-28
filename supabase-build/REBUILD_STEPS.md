# Supabase: rebuild database from scratch

Run these **in order** in the Supabase SQL Editor (one file per run). Do not wrap in a single `begin`/`commit`.

| Step | File |
|------|------|
| 1 | `01_schema.sql` |
| 2 | `02_auth_trigger.sql` |
| 3 | `03_rls_functions.sql` |
| 4 | `04_rls_policies.sql` |
| 5 | `05_storage.sql` |
| 6 | `06_billing_subscriptions.sql` |
| 7+ | `08_migrate_legacy_billing_column_names.sql` (optional, only if upgrading an older DB) |

## After the core six steps

1. Set app env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_TEMPLATE_OWNER_ID` (shared template user UUID).
2. **Template owner (global + private templates):** After that user exists in `public.profiles`, replace `public.template_owner_id()` — either paste their UUID in `03_rls_functions.sql` and re-run only that function block, or run:

```sql
create or replace function public.template_owner_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where email = 'your-template-owner@email.com' limit 1;
$$;
```

3. `NEXT_PUBLIC_TEMPLATE_OWNER_ID` must match the same UUID as `template_owner_id()`.

## Optional: existing users without profiles

If `auth.users` had rows before `02_auth_trigger.sql` existed, run `backfill_profiles_from_auth.sql` once.

## If organisation create fails (or success toast but no org)

Run `fix_org_select_policy.sql` once (updates SELECT so owners always see their org row; needed for `insert().select()` after create).

## Folder contents

- `01_schema.sql` … `06_billing_subscriptions.sql` — required rebuild.
- `08_migrate_legacy_billing_column_names.sql` — optional; merge legacy `paddle_*`, `stripe_*`, or other prefixed provider columns into unified `billing_*` columns.
- `07_drop_stripe_columns_if_present.sql` — optional; only if you still have stripe-only columns from an old migration (subset of what `08` does).
- `backfill_profiles_from_auth.sql` — optional backfill only.
- `REBUILD_STEPS.md` — this file.
