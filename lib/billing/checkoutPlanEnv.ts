import type { PublicTierId } from "@/lib/billing/tierLimits";

/** Resolved subscription plan id from env for `/api/payment/checkout` (one id per tier in dashboard). */
export function checkoutPlanIdForTier(tier: PublicTierId): string | null {
	const key =
		tier === "starter"
			? "PAYMENT_PLAN_ID_STARTER"
			: tier === "professional"
				? "PAYMENT_PLAN_ID_PROFESSIONAL"
				: "PAYMENT_PLAN_ID_ENTERPRISE";
	return process.env[key]?.trim() || null;
}
