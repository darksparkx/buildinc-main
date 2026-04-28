import type { PublicTierId } from "@/lib/billing/tierLimits";
export const PLAN_OFFERS: Record<
	PublicTierId,
	{ name: string; priceLabel: string; blurb: string }
> = {
	starter: {
		name: "Starter",
		priceLabel: "₹9,999 / mo",
		blurb: "1 org · 3 projects · up to 50 users",
	},
	professional: {
		name: "Professional",
		priceLabel: "₹14,999 / mo",
		blurb: "3 orgs · 10 projects · up to 150 users",
	},
	enterprise: {
		name: "Enterprise",
		priceLabel: "₹24,999 / mo",
		blurb: "5 orgs · 25 projects · up to 300 users",
	},
};

export const PUBLIC_TIER_IDS: PublicTierId[] = [
	"starter",
	"professional",
	"enterprise",
];
