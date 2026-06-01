"use client";

import ApprovalSlaSection from "@/components/statistics/ApprovalSlaSection";
import MaterialUsageSection from "@/components/statistics/MaterialUsageSection";
import type {
	ApprovalSlaSnapshot,
	ApprovalTypeSlaRow,
} from "@/lib/statistics/approvalSnapshot";
import PhaseStatisticsTable from "@/components/statistics/PhaseStatisticsTable";
import StatisticsChartsSection from "@/components/statistics/StatisticsChartsSection";
import type {
	MaterialGroupRow,
	MaterialRollupSnapshot,
} from "@/lib/statistics/materialSnapshot";
import { SummaryCard } from "@/components/base/general/SummaryCard";
import type { PhaseStatisticRow } from "@/lib/statistics/phaseSnapshot";
import type { ProjectStatisticRow } from "@/lib/statistics/ownerSnapshot";
import {
	formatPeriodComparison,
	periodCompletionCaption,
} from "@/lib/statistics/periodComparison";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";
import type { ITask } from "@/lib/types";
import { CalendarClock, Inbox, TrendingUp } from "lucide-react";

const shell =
	"border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm";

type Props = {
	row: ProjectStatisticRow;
	tasks: ITask[];
	phaseRows: PhaseStatisticRow[];
	timeRange: StatisticsTimeRange;
	materialRollup: MaterialRollupSnapshot;
	materialGroupRows: MaterialGroupRow[];
	approvalSla: ApprovalSlaSnapshot;
	approvalTypeRows: ApprovalTypeSlaRow[];
};

export default function ProjectStatisticsPanel({
	row,
	tasks,
	phaseRows,
	timeRange,
	materialRollup,
	materialGroupRows,
	approvalSla,
	approvalTypeRows,
}: Props) {
	const taskCompletionLabel =
		row.taskInventoryCount === 0 ? (
			<span className="text-muted-foreground">—</span>
		) : (
			<span className="tabular-nums">
				{row.taskCompletedCount}/{row.taskInventoryCount}
				{row.completionRatePercent != null ? (
					<span className="text-lg font-semibold text-muted-foreground">
						{" "}
						({row.completionRatePercent}%)
					</span>
				) : null}
			</span>
		);

	const showPeriodCompare = timeRange !== "all";
	const phaseBreakdown = phaseRows.map((p) => ({
		label: p.name,
		completions: p.completionsInPeriod,
	}));

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
				<SummaryCard
					title="Tasks completed"
					content={
						<div className="space-y-2 text-left">
							{taskCompletionLabel}
							{showPeriodCompare ? (
								<p className="text-xs font-medium text-muted-foreground">
									<span className="tabular-nums text-foreground">
										{row.completionsInPeriod}
									</span>{" "}
									{periodCompletionCaption(timeRange)}
									<span className="block pt-0.5 tabular-nums text-foreground/90">
										{formatPeriodComparison(
											row.completionsInPeriod,
											row.completionsPreviousPeriod,
										)}
									</span>
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									{periodCompletionCaption(timeRange)}
								</p>
							)}
						</div>
					}
					icon={
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400">
							<TrendingUp className="h-5 w-5" aria-hidden />
						</span>
					}
					className={shell}
				/>
				<SummaryCard
					title="Overdue tasks"
					content={<span className="tabular-nums">{row.overdueCount}</span>}
					icon={
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300">
							<CalendarClock className="h-5 w-5" aria-hidden />
						</span>
					}
					className={shell}
				/>
				<SummaryCard
					title="Open approval requests"
					content={
						<span className="tabular-nums">{row.pendingApprovals}</span>
					}
					icon={
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-300">
							<Inbox className="h-5 w-5" aria-hidden />
						</span>
					}
					className={shell}
				/>
			</div>

			<StatisticsChartsSection
				tasks={tasks}
				timeRange={timeRange}
				completionsInPeriod={row.completionsInPeriod}
				completionsPreviousPeriod={row.completionsPreviousPeriod}
				projectSpent={row.spent}
				projectBudget={row.budget}
				taskSpent={row.taskSpentTotal}
				taskPlanned={row.taskPlannedTotal}
				completionBreakdown={phaseBreakdown}
				completionChartTitle="Completions by phase"
				completionChartDescription="Tasks completed in the selected period, grouped by phase"
			/>

			<PhaseStatisticsTable rows={phaseRows} timeRange={timeRange} />

			<MaterialUsageSection
				rollup={materialRollup}
				groupRows={materialGroupRows}
			/>

			<ApprovalSlaSection
				snapshot={approvalSla}
				typeRows={approvalTypeRows}
				timeRange={timeRange}
			/>
		</div>
	);
}
