import type { ISubscriberEntitlementsDB, SubscriptionPlan } from "@/lib/types";

function parseTs(v: unknown): Date | null {
	if (v == null) return null;
	if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
	const d = new Date(String(v));
	return Number.isNaN(d.getTime()) ? null : d;
}

/** Normalizes a Supabase row (or RSC-serialized copy) into typed entitlements with real Dates. */
export function parseSubscriberEntitlementsRow(
	row: Record<string, unknown> | null | undefined,
): ISubscriberEntitlementsDB | null {
	if (!row || typeof row.subscriber_id !== "string") return null;

	const maxN = (v: unknown): number | null => {
		if (v == null) return null;
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	};

	const updated = parseTs(row.updated_at);

	return {
		subscriber_id: row.subscriber_id,
		plan: row.plan as SubscriptionPlan,
		status: String(row.status ?? ""),
		billing_interval:
			row.billing_interval != null ? String(row.billing_interval) : null,
		billing_provider:
			row.billing_provider != null ? String(row.billing_provider) : null,
		billing_customer_id:
			row.billing_customer_id != null
				? String(row.billing_customer_id)
				: null,
		billing_subscription_id:
			row.billing_subscription_id != null
				? String(row.billing_subscription_id)
				: null,
		current_period_start: parseTs(row.current_period_start),
		current_period_end: parseTs(row.current_period_end),
		trial_ends_at: parseTs(row.trial_ends_at),
		max_orgs: maxN(row.max_orgs),
		max_projects: maxN(row.max_projects),
		max_users: maxN(row.max_users),
		updated_at: updated ?? new Date(0),
	};
}
