import type { ISubscriberEntitlementsDB, SubscriptionPlan } from "@/lib/types";

/**
 * Subscription row statuses that grant full product access (case-insensitive).
 * Gateway providers may emit others (e.g. past_due) — gate policy can extend this.
 */
export const ACTIVE_SUBSCRIPTION_STATUSES = [
	"active",
	"trialing",
] as const;

export type ActiveSubscriptionStatus = (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number];

const ACTIVE_SET = new Set<string>(
	ACTIVE_SUBSCRIPTION_STATUSES.map((s) => s.toLowerCase()),
);

export function normalizeSubscriptionStatus(
	raw: string | null | undefined,
): string {
	return (raw ?? "").trim().toLowerCase();
}

export function isActiveSubscriptionStatus(
	status: string | null | undefined,
): boolean {
	return ACTIVE_SET.has(normalizeSubscriptionStatus(status));
}

/** Plan is something other than the default unpaid tier. */
export function isPaidPlan(plan: SubscriptionPlan | null | undefined): boolean {
	return !!plan && plan !== "none";
}

export type SubscriberGateInput = Pick<
	ISubscriberEntitlementsDB,
	"plan" | "status" | "current_period_end"
>;

/**
 * True when the row represents a subscriber who should get payer capabilities
 * (create org, limits, owner shell), subject to your route-level rules.
 *
 * Requires a non-`none` plan, an active lifecycle status, and if `current_period_end`
 * is set, it must not be in the past.
 */
export function isActiveSubscriber(
	row: SubscriberGateInput | null | undefined,
): boolean {
	if (!row || !isPaidPlan(row.plan)) return false;
	if (!isActiveSubscriptionStatus(row.status)) return false;
	if (row.current_period_end != null) {
		const end =
			row.current_period_end instanceof Date
				? row.current_period_end
				: new Date(row.current_period_end);
		if (Number.isFinite(end.getTime()) && end.getTime() < Date.now()) {
			return false;
		}
	}
	return true;
}

/**
 * How to interpret `max_*` when the DB value is null (schema: null = no cap recorded).
 * - `deny`: treat as 0 allowed (safest for new rows until unlock fills caps).
 * - `unlimited`: treat as no numeric ceiling (use only if you trust all active rows have explicit caps).
 */
export type NullCapMode = "deny" | "unlimited";

/**
 * Resolve a single limit column. Returns `null` when unlimited (only if mode is `unlimited` and raw is null).
 */
export function resolveMaxCap(
	raw: number | null | undefined,
	mode: NullCapMode,
): number | null {
	if (raw != null) return raw;
	if (mode === "unlimited") return null;
	return 0;
}
