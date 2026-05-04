import type { PublicTierId } from "@/lib/billing/tierLimits";

export type PlanOffer = {
	name: string;
	priceLabel: string;
	/** Short line under the price */
	tagline: string;
	/** Bullets shown on the billing page (limits + product + support). */
	features: readonly string[];
};

export const PLAN_OFFERS: Record<PublicTierId, PlanOffer> = {
	starter: {
		name: "Starter",
		priceLabel: "₹9,999 / mo",
		tagline: "Small teams piloting BuildInc on one account.",
		features: [
			"1 organisation",
			"Up to 3 projects",
			"Up to 50 members across your workspaces",
			"Realtime updates & notifications (in-app)",
			"Basic statistics",
			"Email support",
		],
	},
	professional: {
		name: "Professional",
		priceLabel: "₹14,999 / mo",
		tagline: "Growing operators with more sites and people.",
		features: [
			"Up to 3 organisations",
			"Up to 10 projects",
			"Up to 150 members across your workspaces",
			"Realtime updates & notifications (in-app)",
			"Advanced statistics",
			"Priority email support",
		],
	},
	enterprise: {
		name: "Enterprise",
		priceLabel: "₹24,999 / mo",
		tagline: "Higher caps and a closer support path for scale.",
		features: [
			"Up to 5 organisations",
			"Up to 25 projects",
			"Up to 300 members across your workspaces",
			"Realtime updates & notifications (in-app)",
			"Full statistics",
			"Priority support",
		],
	},
};

export const PUBLIC_TIER_IDS: PublicTierId[] = [
	"starter",
	"professional",
	"enterprise",
];
