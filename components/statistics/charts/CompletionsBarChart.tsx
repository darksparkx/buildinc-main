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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
	completions: {
		label: "Completions",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig;

type Item = { label: string; completions: number };

type Props = {
	items: Item[];
	title?: string;
	description?: string;
};

export default function CompletionsBarChart({
	items,
	title = "Completions",
	description = "Tasks completed in the selected period",
}: Props) {
	const data = items
		.filter((i) => i.completions > 0)
		.map((i) => {
			const short =
				i.label.length > 14 ? `${i.label.slice(0, 12)}…` : i.label;
			return {
				label: short,
				completions: i.completions,
				tooltipLabel: i.label,
			};
		});

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription className="text-xs">{description}</CardDescription>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No completions in this period.
					</p>
				) : (
					<ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[280px] w-full">
						<BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis
								dataKey="label"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								interval={0}
								angle={data.length > 4 ? -25 : 0}
								textAnchor={data.length > 4 ? "end" : "middle"}
								height={data.length > 4 ? 56 : 32}
							/>
							<YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value, _name, item) => (
											<>
												<span className="block text-muted-foreground">
													{String(item.payload?.tooltipLabel ?? "")}
												</span>
												<span>{value.toLocaleString("en-IN")}</span>
											</>
										)}
									/>
								}
							/>
							<Bar
								dataKey="completions"
								fill="var(--color-completions)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
