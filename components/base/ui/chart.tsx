"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/functions/utils";

export type ChartConfig = Record<
	string,
	{
		label?: React.ReactNode;
		icon?: React.ComponentType;
	} & (
		| { color?: string; theme?: never }
		| { color?: never; theme: Record<"light" | "dark", string> }
	)
>;

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChart() {
	const context = React.useContext(ChartContext);
	if (!context) {
		throw new Error("useChart must be used within a <ChartContainer />");
	}
	return context;
}

function ChartContainer({
	id,
	className,
	children,
	config,
	...props
}: React.ComponentProps<"div"> & {
	config: ChartConfig;
	children: React.ComponentProps<
		typeof RechartsPrimitive.ResponsiveContainer
	>["children"];
}) {
	const uniqueId = React.useId();
	const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

	return (
		<ChartContext.Provider value={config}>
			<div
				data-chart={chartId}
				className={cn(
					"flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
					className,
				)}
				{...props}
			>
				<ChartStyle id={chartId} config={config} />
				<RechartsPrimitive.ResponsiveContainer>
					{children}
				</RechartsPrimitive.ResponsiveContainer>
			</div>
		</ChartContext.Provider>
	);
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
	const colorConfig = Object.entries(config).filter(
		([, item]) => item.theme || item.color,
	);

	if (!colorConfig.length) return null;

	const vars = colorConfig
		.map(([key, item]) => {
			const color =
				item.theme?.light ??
				(item.color?.startsWith("hsl") ? item.color : `hsl(${item.color})`);
			return `--color-${key}: ${color}`;
		})
		.join("; ");

	return (
		<style
			dangerouslySetInnerHTML={{
				__html: `[data-chart="${id}"] { ${vars} }`,
			}}
		/>
	);
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
	active,
	payload,
	label,
	className,
	hideLabel = false,
	formatter,
}: React.ComponentProps<"div"> & {
	active?: boolean;
	payload?: Array<{
		name?: string;
		value?: number;
		dataKey?: string;
		color?: string;
		payload?: Record<string, unknown>;
	}>;
	label?: string;
	hideLabel?: boolean;
	formatter?: (
		value: number,
		name: string,
		item: NonNullable<typeof payload>[number],
	) => React.ReactNode;
}) {
	const chartConfig = useChart();

	if (!active || !payload?.length) return null;

	return (
		<div
			className={cn(
				"grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
				className,
			)}
		>
			{!hideLabel && label ? (
				<div className="font-medium">{label}</div>
			) : null}
			<div className="grid gap-1.5">
				{payload.map((item, index) => {
					const key = String(item.dataKey ?? item.name ?? index);
					const configItem = chartConfig[key];
					const labelText = configItem?.label ?? item.name ?? key;
					const value = Number(item.value ?? 0);
					return (
						<div
							key={key}
							className="flex w-full items-center justify-between gap-4"
						>
							<span className="text-muted-foreground">{labelText}</span>
							<span className="font-mono font-medium tabular-nums text-foreground">
								{formatter
									? formatter(value, key, item)
									: value.toLocaleString("en-IN")}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartStyle,
};
