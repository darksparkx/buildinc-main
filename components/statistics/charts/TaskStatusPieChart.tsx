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
import { Cell, Pie, PieChart } from "recharts";

const chartConfig = {
	completed: { label: "Completed", color: "hsl(var(--chart-1))" },
	inProgress: { label: "In progress", color: "hsl(var(--chart-2))" },
	overdue: { label: "Overdue", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

type Props = {
	completed: number;
	inProgress: number;
	overdue: number;
	title?: string;
	description?: string;
};

export default function TaskStatusPieChart({
	completed,
	inProgress,
	overdue,
	title = "Task status",
	description = "Share of active tasks by status",
}: Props) {
	const data = [
		{ key: "completed", name: "Completed", value: completed, fill: "var(--color-completed)" },
		{ key: "inProgress", name: "In progress", value: inProgress, fill: "var(--color-inProgress)" },
		{ key: "overdue", name: "Overdue", value: overdue, fill: "var(--color-overdue)" },
	].filter((d) => d.value > 0);

	const total = completed + inProgress + overdue;

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription className="text-xs">{description}</CardDescription>
			</CardHeader>
			<CardContent>
				{total === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No active tasks to chart.
					</p>
				) : (
					<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[240px]">
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent hideLabel />} />
							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								innerRadius={52}
								outerRadius={80}
								paddingAngle={2}
							>
								{data.map((entry) => (
									<Cell key={entry.key} fill={entry.fill} />
								))}
							</Pie>
						</PieChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
