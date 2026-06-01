"use client";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/base/ui/chart";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { STATISTICS_TIME_RANGE_LABELS } from "@/lib/statistics/timeRange";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
	count: { label: "Completions", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

type Props = {
	timeRange: StatisticsTimeRange;
	current: number;
	previous: number;
};

export default function PeriodComparisonChart({
	timeRange,
	current,
	previous,
}: Props) {
	if (timeRange === "all") return null;

	const label = STATISTICS_TIME_RANGE_LABELS[timeRange].replace(/^Last /i, "");
	const data = [
		{ period: `Prior ${label}`, count: previous },
		{ period: `Current ${label}`, count: current },
	];

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Period comparison</CardTitle>
				<CardDescription className="text-xs">
					Task completions vs the previous {label.toLowerCase()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="aspect-[5/3] max-h-[220px] w-full">
					<BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
						<YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
