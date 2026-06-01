"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import { formatPeriodComparison } from "@/lib/statistics/periodComparison";
import type { PhaseStatisticRow } from "@/lib/statistics/phaseSnapshot";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";

type Props = {
	rows: PhaseStatisticRow[];
	timeRange: StatisticsTimeRange;
};

export default function PhaseStatisticsTable({ rows, timeRange }: Props) {
	if (rows.length === 0) {
		return (
			<p className="rounded-xl border border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground ring-1 ring-border/40">
				No phases loaded for this project yet. Open the task board to sync phase
				data.
			</p>
		);
	}

	return (
		<div className="rounded-xl border border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm overflow-hidden">
			<div className="border-b border-border/50 px-4 py-3">
				<h3 className="text-base font-semibold tracking-tight">By phase</h3>
				<p className="mt-1 text-xs text-muted-foreground">
					Task and completion rollups for each project phase.
				</p>
			</div>
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead>Phase</TableHead>
						<TableHead className="text-right">Tasks</TableHead>
						<TableHead className="text-right hidden sm:table-cell">Overdue</TableHead>
						<TableHead className="text-right hidden md:table-cell">
							Completions
						</TableHead>
						<TableHead className="text-right hidden lg:table-cell">
							Task spend
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => {
						const taskLine =
							row.taskInventoryCount === 0 ? (
								"—"
							) : (
								<>
									{row.taskCompletedCount}/{row.taskInventoryCount}
									{row.completionRatePercent != null ? (
										<span className="text-muted-foreground">
											{" "}
											({row.completionRatePercent}%)
										</span>
									) : null}
								</>
							);

						return (
							<TableRow key={row.phaseId}>
								<TableCell className="font-medium">{row.name}</TableCell>
								<TableCell className="text-right tabular-nums">{taskLine}</TableCell>
								<TableCell className="text-right tabular-nums hidden sm:table-cell">
									{row.overdueCount}
								</TableCell>
								<TableCell className="text-right tabular-nums hidden md:table-cell">
									{timeRange === "all" ? (
										row.completionsInPeriod
									) : (
										<span className="inline-flex flex-col items-end gap-0.5">
											<span>{row.completionsInPeriod}</span>
											<span className="text-[11px] font-normal text-muted-foreground">
												{formatPeriodComparison(
													row.completionsInPeriod,
													row.completionsPreviousPeriod,
												)}
											</span>
										</span>
									)}
								</TableCell>
								<TableCell className="text-right tabular-nums hidden lg:table-cell">
									{row.taskSpentTotal.toLocaleString("en-IN")} ₹
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
