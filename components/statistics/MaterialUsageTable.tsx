"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import type { MaterialGroupRow } from "@/lib/statistics/materialSnapshot";
import { cn } from "@/lib/functions/utils";

function formatMoney(amount: number) {
	return amount.toLocaleString("en-IN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

type Props = {
	rows: MaterialGroupRow[];
	title?: string;
	description?: string;
	className?: string;
};

export default function MaterialUsageTable({
	rows,
	title = "Materials by item",
	description = "Planned vs used cost rolled up by material name and unit",
	className,
}: Props) {
	return (
		<div
			className={cn(
				"rounded-xl border border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm",
				className,
			)}
		>
			<div className="border-b border-border/50 px-4 py-3 sm:px-5">
				<h3 className="text-base font-semibold tracking-tight">{title}</h3>
				<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
			</div>
			{rows.length === 0 ? (
				<p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
					No material lines in this view yet.
				</p>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Material</TableHead>
								<TableHead className="text-right">Planned qty</TableHead>
								<TableHead className="text-right">Used qty</TableHead>
								<TableHead className="text-right">Planned cost</TableHead>
								<TableHead className="text-right">Used cost</TableHead>
								<TableHead className="text-right">Used vs planned</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={row.key}>
									<TableCell className="font-medium">
										{row.name}
										<span className="ml-1 text-xs font-normal text-muted-foreground">
											({row.unit})
										</span>
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{row.plannedQuantity.toLocaleString("en-IN")}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{row.usedQuantity.toLocaleString("en-IN")}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										₹{formatMoney(row.plannedCost)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										₹{formatMoney(row.usedCost)}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{row.usageVsPlannedPercent != null
											? `${row.usageVsPlannedPercent}%`
											: "—"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
