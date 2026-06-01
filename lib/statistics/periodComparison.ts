import {
	STATISTICS_TIME_RANGE_LABELS,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";

export function formatPeriodComparison(
	current: number,
	previous: number,
	options?: { formatDelta?: (delta: number) => string },
): string {
	const delta = current - previous;
	if (delta === 0) return "Same as prior period";
	const sign = delta > 0 ? "+" : "";
	const formatted = options?.formatDelta
		? options.formatDelta(delta)
		: String(delta);
	return `${sign}${formatted} vs prior period`;
}

export function periodCompletionCaption(timeRange: StatisticsTimeRange): string {
	if (timeRange === "all") return "All-time completion totals above";
	return `Completed in ${STATISTICS_TIME_RANGE_LABELS[timeRange].toLowerCase()}`;
}
