import type { SubscriptionPlan } from "@/lib/types";

export type StatisticsDataAccess = {
	canExport: boolean;
	canImport: boolean;
};

/**
 * Statistics CSV export/import by paid tier.
 * - Starter: view in-app statistics only
 * - Professional: export
 * - Enterprise / custom / platform admin: export + import
 */
export function statisticsDataAccessForPlan(
	plan: SubscriptionPlan | null | undefined,
	options?: { platformAdmin?: boolean },
): StatisticsDataAccess {
	if (options?.platformAdmin) {
		return { canExport: true, canImport: true };
	}
	switch (plan) {
		case "professional":
			return { canExport: true, canImport: false };
		case "enterprise":
		case "custom":
			return { canExport: true, canImport: true };
		default:
			return { canExport: false, canImport: false };
	}
}
