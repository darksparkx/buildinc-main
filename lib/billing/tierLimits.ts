import type { SubscriptionPlan } from "@/lib/types";

export type PlanEntitlements = {
	plan: SubscriptionPlan;
	maxOrgs: number;
	maxProjects: number;
	maxUsers: number;
};

/** Canonical limits per public tier (subscriptions, dev unlock, checkout mapping). */
export const TIER_LIMITS = {
	starter: {
		plan: "starter",
		maxOrgs: 1,
		maxProjects: 3,
		maxUsers: 50,
	},
	professional: {
		plan: "professional",
		maxOrgs: 3,
		maxProjects: 10,
		maxUsers: 150,
	},
	enterprise: {
		plan: "enterprise",
		maxOrgs: 5,
		maxProjects: 25,
		maxUsers: 300,
	},
} as const satisfies Record<
	"starter" | "professional" | "enterprise",
	PlanEntitlements
>;

/** App tier slug for UI, APIs, and env-backed gateway plan ids (`PAYMENT_PLAN_ID_*`). */
export type PublicTierId = keyof typeof TIER_LIMITS;

/**
 * Parse a tier slug from the billing UI or API (`starter` | `professional` | `enterprise`).
 */
export function parsePublicTier(raw: unknown): PublicTierId | null {
	if (typeof raw !== "string") return null;
	const p = raw.trim().toLowerCase();
	if (p === "starter" || p === "professional" || p === "enterprise") return p;
	return null;
}

/** @deprecated use parsePublicTier — kept for compatibility */
export function parseUnlockPlan(
	raw: string | undefined,
): PublicTierId | null {
	return parsePublicTier(raw ?? "");
}
