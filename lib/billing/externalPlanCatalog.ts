import type { SubscriptionPlan } from "@/lib/types";
import { TIER_LIMITS } from "@/lib/billing/tierLimits";

export type TierEntitlements = {
	plan: SubscriptionPlan;
	maxOrgs: number;
	maxProjects: number;
	maxUsers: number;
};

function registerPlanIdFromEnv(
	m: Record<string, TierEntitlements>,
	envKey: string,
	tier: keyof typeof TIER_LIMITS,
) {
	const id = process.env[envKey]?.trim();
	if (id) m[id] = TIER_LIMITS[tier];
}

/** Map gateway subscription `plan_id` (from dashboard) → tier limits. Set `PAYMENT_PLAN_ID_*` per tier in env. */
export function buildExternalSubscriptionPlanIndex(): Record<
	string,
	TierEntitlements
> {
	const m: Record<string, TierEntitlements> = {};
	registerPlanIdFromEnv(m, "PAYMENT_PLAN_ID_STARTER", "starter");
	registerPlanIdFromEnv(m, "PAYMENT_PLAN_ID_PROFESSIONAL", "professional");
	registerPlanIdFromEnv(m, "PAYMENT_PLAN_ID_ENTERPRISE", "enterprise");
	return m;
}

let cache: Record<string, TierEntitlements> | null = null;

export function entitlementsForExternalPlanId(
	externalPlanId: string,
): TierEntitlements | null {
	if (!cache) cache = buildExternalSubscriptionPlanIndex();
	return cache[externalPlanId] ?? null;
}
