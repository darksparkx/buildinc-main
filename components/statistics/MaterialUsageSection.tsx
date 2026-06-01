"use client";

import MaterialUsageTable from "@/components/statistics/MaterialUsageTable";
import SpendComparisonChart from "@/components/statistics/charts/SpendComparisonChart";
import { SummaryCard } from "@/components/base/general/SummaryCard";
import type {
	MaterialGroupRow,
	MaterialRollupSnapshot,
	ProjectMaterialRow,
} from "@/lib/statistics/materialSnapshot";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import { Package } from "lucide-react";
import Link from "next/link";

const shell =
	"border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm";

function formatMoney(amount: number) {
	return amount.toLocaleString("en-IN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

type Props = {
	rollup: MaterialRollupSnapshot;
	groupRows: MaterialGroupRow[];
	projectRows?: ProjectMaterialRow[];
	projectTableTitle?: string;
};

export default function MaterialUsageSection({
	rollup,
	groupRows,
	projectRows,
	projectTableTitle = "Materials by project",
}: Props) {
	const costLabel =
		rollup.lineCount === 0 ? (
			<span className="text-muted-foreground">—</span>
		) : (
			<div className="space-y-1 text-left">
				<span className="tabular-nums">
					₹{formatMoney(rollup.usedCostTotal)}
					<span className="text-lg font-semibold text-muted-foreground">
						{" "}
						/ ₹{formatMoney(rollup.plannedCostTotal)}
					</span>
				</span>
				{rollup.usageVsPlannedPercent != null ? (
					<p className="text-xs font-medium text-muted-foreground">
						<span className="tabular-nums text-foreground">
							{rollup.usageVsPlannedPercent}%
						</span>{" "}
						of planned material cost used
						{rollup.linesOverPlan > 0 ? (
							<span className="block pt-0.5 text-amber-700 dark:text-amber-300">
								{rollup.linesOverPlan} line
								{rollup.linesOverPlan !== 1 ? "s" : ""} over planned quantity
							</span>
						) : null}
					</p>
				) : (
					<p className="text-xs text-muted-foreground">
						{rollup.lineCount} material line
						{rollup.lineCount !== 1 ? "s" : ""}
					</p>
				)}
			</div>
		);

	if (rollup.lineCount === 0 && groupRows.length === 0) {
		return (
			<section className="space-y-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Materials</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Usage and cost vs planned quantities from task material lines.
					</p>
				</div>
				<p className="rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-border/40">
					No materials logged on tasks in this view yet.
				</p>
			</section>
		);
	}

	const topGroups = groupRows.slice(0, 12);

	return (
		<section className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold tracking-tight">Materials</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					Planned vs used quantities and cost from synced task materials.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<SummaryCard
					title="Material cost (used / planned)"
					content={costLabel}
					icon={
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-800 ring-1 ring-violet-500/25 dark:text-violet-300">
							<Package className="h-5 w-5" aria-hidden />
						</span>
					}
					className={shell}
				/>
				<SpendComparisonChart
					spent={rollup.usedCostTotal}
					budgetOrPlanned={rollup.plannedCostTotal}
					title="Material cost vs planned"
					description="Used quantity × unit cost vs planned quantity × unit cost"
				/>
			</div>

			{projectRows && projectRows.length > 0 ? (
				<div className="rounded-xl border border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
					<div className="border-b border-border/50 px-4 py-3 sm:px-5">
						<h3 className="text-base font-semibold tracking-tight">
							{projectTableTitle}
						</h3>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Project</TableHead>
									<TableHead className="text-right">Lines</TableHead>
									<TableHead className="text-right">Planned</TableHead>
									<TableHead className="text-right">Used</TableHead>
									<TableHead className="text-right">Used vs planned</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{projectRows.map((row) => (
									<TableRow key={row.projectId}>
										<TableCell className="font-medium">
											<Link
												href={`/projects/${row.projectId}?tab=statistics`}
												className="text-primary hover:underline"
											>
												{row.projectName}
											</Link>
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{row.lineCount}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											₹{formatMoney(row.plannedCostTotal)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											₹{formatMoney(row.usedCostTotal)}
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
				</div>
			) : null}

			<MaterialUsageTable rows={topGroups} />
		</section>
	);
}
