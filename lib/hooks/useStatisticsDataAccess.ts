"use client";

import { statisticsDataAccessForPlan } from "@/lib/statistics/statisticsTierAccess";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";
import { useProfileStore } from "@/lib/store/profileStore";

export function useStatisticsDataAccess() {
	const plan = useEntitlementsStore((s) => s.entitlements?.plan);
	const isPlatformAdmin = useProfileStore((s) => s.profile?.admin ?? false);
	return statisticsDataAccessForPlan(plan, { platformAdmin: isPlatformAdmin });
}
