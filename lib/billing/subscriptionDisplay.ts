import { PLAN_OFFERS } from "@/lib/billing/planOffers";
import type { PublicTierId } from "@/lib/billing/tierLimits";
import type { SubscriptionPlan } from "@/lib/types";

export function subscriptionPlanLabel(plan: SubscriptionPlan): string {
	if (plan === "none") return "No paid plan";
	if (plan === "custom") return "Custom";
	const pub = plan as PublicTierId;
	if (pub in PLAN_OFFERS) return PLAN_OFFERS[pub].name;
	return plan;
}

/** Title-case lifecycle status for display. */
export function formatSubscriptionStatus(status: string | null | undefined): string {
	const s = (status ?? "").trim();
	if (!s) return "Unknown";
	return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function formatSubscriptionDate(value: Date | null): string | null {
	if (!value || !Number.isFinite(value.getTime())) return null;
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
	}).format(value);
}
