"use client";

import OwnerStatisticsOverview from "@/components/statistics/OwnerStatisticsOverview";
import { useProfileStore } from "@/lib/store/profileStore";
import {
	isStatisticsTimeRange,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";
import { useUrlQueryTab } from "@/lib/hooks/useUrlQueryTab";
import { GalleryHorizontal } from "lucide-react";
import { Suspense } from "react";

const STATS_RANGES = ["7d", "30d", "90d", "all"] as const;

function StatisticsPageContent({
	entitlementsUnavailable = false,
}: {
	entitlementsUnavailable?: boolean;
}) {
	const profile = useProfileStore((s) => s.profile);
	const [rangeParam, setRangeParam] = useUrlQueryTab(
		STATS_RANGES,
		"30d",
		"range",
	);

	const timeRange: StatisticsTimeRange = isStatisticsTimeRange(rangeParam)
		? rangeParam
		: "30d";

	if (!profile) {
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	return (
		<div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-6">
			<header className="flex items-center gap-3">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
					<GalleryHorizontal className="h-5 w-5" aria-hidden />
				</span>
				<h1 className="min-w-0 text-2xl font-semibold tracking-tight">
					Statistics
				</h1>
			</header>

			{entitlementsUnavailable ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
				>
					<p className="font-medium text-destructive">
						Subscription status unavailable
					</p>
					<p className="mt-1 text-pretty text-destructive/90">
						We could not verify your plan right now. Statistics are shown using
						your session data; tier limits may not apply until billing status
						loads again. Refresh the page or try again shortly.
					</p>
				</div>
			) : null}

			<OwnerStatisticsOverview
				timeRange={timeRange}
				onTimeRangeChange={setRangeParam}
			/>
		</div>
	);
}

export default function StatisticsPageClient({
	entitlementsUnavailable = false,
}: {
	entitlementsUnavailable?: boolean;
}) {
	return (
		<Suspense fallback={null}>
			<StatisticsPageContent
				entitlementsUnavailable={entitlementsUnavailable}
			/>
		</Suspense>
	);
}
