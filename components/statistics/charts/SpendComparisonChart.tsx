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
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

const chartConfig = {
	spent: { label: "Spent", color: "hsl(var(--chart-1))" },
	budget: { label: "Budget / planned", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

type Props = {
	spent: number;
	budgetOrPlanned: number;
	title?: string;
	description?: string;
};

export default function SpendComparisonChart({
	spent,
	budgetOrPlanned,
	title = "Spend vs budget",
	description = "Recorded spend compared to budget or planned total",
}: Props) {
	const data = [
		{ key: "spent", name: "Spent", value: spent, fill: "var(--color-spent)" },
		{
			key: "budget",
			name: "Budget / planned",
			value: budgetOrPlanned,
			fill: "var(--color-budget)",
		},
	];

	const hasData = spent > 0 || budgetOrPlanned > 0;

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription className="text-xs">{description}</CardDescription>
			</CardHeader>
			<CardContent>
				{!hasData ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No spend data to chart yet.
					</p>
				) : (
					<ChartContainer config={chartConfig} className="aspect-[5/3] max-h-[220px] w-full">
						<BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
							<CartesianGrid horizontal={false} strokeDasharray="3 3" />
							<YAxis
								type="category"
								dataKey="name"
								tickLine={false}
								axisLine={false}
								width={88}
							/>
							<XAxis type="number" tickLine={false} axisLine={false} hide />
							<ChartTooltip content={<ChartTooltipContent hideLabel />} />
							<Bar dataKey="value" radius={[0, 4, 4, 0]}>
								{data.map((entry) => (
									<Cell key={entry.key} fill={entry.fill} />
								))}
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
