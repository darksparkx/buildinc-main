export const STATISTICS_TIME_RANGES = ["7d", "30d", "90d", "all"] as const;

export type StatisticsTimeRange = (typeof STATISTICS_TIME_RANGES)[number];

export const STATISTICS_TIME_RANGE_LABELS: Record<
	StatisticsTimeRange,
	string
> = {
	"7d": "Last 7 days",
	"30d": "Last 30 days",
	"90d": "Last 90 days",
	all: "All time",
};

export function isStatisticsTimeRange(v: string): v is StatisticsTimeRange {
	return (STATISTICS_TIME_RANGES as readonly string[]).includes(v);
}

/** Milliseconds for rolling window; `null` = all time (no window). */
export function statisticsRangeMs(range: StatisticsTimeRange): number | null {
	switch (range) {
		case "7d":
			return 7 * 24 * 60 * 60 * 1000;
		case "30d":
			return 30 * 24 * 60 * 60 * 1000;
		case "90d":
			return 90 * 24 * 60 * 60 * 1000;
		case "all":
			return null;
	}
}

export type PeriodWindow = { start: Date; end: Date };

export function currentAndPreviousWindows(
	range: StatisticsTimeRange,
	now = new Date(),
): { current: PeriodWindow | null; previous: PeriodWindow | null } {
	const ms = statisticsRangeMs(range);
	if (ms == null) return { current: null, previous: null };
	const end = now;
	const start = new Date(now.getTime() - ms);
	const previousEnd = start;
	const previousStart = new Date(now.getTime() - ms * 2);
	return {
		current: { start, end },
		previous: { start: previousStart, end: previousEnd },
	};
}
