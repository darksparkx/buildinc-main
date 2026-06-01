"use client";

import { Button } from "@/components/base/ui/button";
import {
	STATISTICS_TIME_RANGE_LABELS,
	STATISTICS_TIME_RANGES,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";
import { cn } from "@/lib/functions/utils";

type Props = {
	value: StatisticsTimeRange;
	onChange: (value: StatisticsTimeRange) => void;
	className?: string;
};

export default function StatisticsTimeRangeFilter({
	value,
	onChange,
	className,
}: Props) {
	return (
		<div
			className={cn(
				"flex flex-wrap gap-2",
				className,
			)}
			role="group"
			aria-label="Statistics time range"
		>
			{STATISTICS_TIME_RANGES.map((range) => (
				<Button
					key={range}
					type="button"
					size="sm"
					variant={value === range ? "secondary" : "outline"}
					className={cn(
						"h-8 text-xs",
						value === range && "font-semibold",
					)}
					onClick={() => onChange(range)}
				>
					{STATISTICS_TIME_RANGE_LABELS[range]}
				</Button>
			))}
		</div>
	);
}
