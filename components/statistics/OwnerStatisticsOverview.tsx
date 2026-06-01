"use client";

import ApprovalSlaSection from "@/components/statistics/ApprovalSlaSection";
import MaterialUsageSection from "@/components/statistics/MaterialUsageSection";
import ProjectStatisticsTable from "@/components/statistics/ProjectStatisticsTable";
import StatisticsChartsSection from "@/components/statistics/StatisticsChartsSection";
import StatisticsDataToolbar from "@/components/statistics/StatisticsDataToolbar";
import StatisticsTimeRangeFilter from "@/components/statistics/StatisticsTimeRangeFilter";
import { buildPortfolioStatisticsCsv } from "@/lib/statistics/exportCsv";
import {
	computeApprovalSlaSnapshot,
	computeApprovalTypeSlaRows,
} from "@/lib/statistics/approvalSnapshot";
import {
	computeMaterialGroupRows,
	computeMaterialRollup,
	computeProjectMaterialRows,
} from "@/lib/statistics/materialSnapshot";
import { SummaryCard } from "@/components/base/general/SummaryCard";
import {
	formatPeriodComparison,
	periodCompletionCaption,
} from "@/lib/statistics/periodComparison";
import {
	computeOwnerStatisticsSnapshot,
	computeProjectStatisticRows,
} from "@/lib/statistics/ownerSnapshot";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";
import { useMaterialStore } from "@/lib/store/materialStore";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { CalendarClock, FolderOpen, Inbox, TrendingUp } from "lucide-react";
import { useMemo } from "react";

const shell =
	"border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm";

type Props = {
	timeRange: StatisticsTimeRange;
	onTimeRangeChange: (range: StatisticsTimeRange) => void;
};

export default function OwnerStatisticsOverview({
	timeRange,
	onTimeRangeChange,
}: Props) {
	const orgMap = useOrganisationStore((s) => s.organisations);
	const projectMap = useProjectStore((s) => s.projects);
	const taskMap = useTaskStore((s) => s.tasks);
	const requestMap = useRequestStore((s) => s.requests);
	const materialMap = useMaterialStore((s) => s.materials);

	const projects = useMemo(() => Object.values(projectMap), [projectMap]);
	const tasks = useMemo(() => Object.values(taskMap), [taskMap]);
	const requests = useMemo(() => Object.values(requestMap), [requestMap]);
	const materials = useMemo(
		() => Object.values(materialMap),
		[materialMap],
	);

	const snapshot = useMemo(
		() =>
			computeOwnerStatisticsSnapshot(
				projects,
				tasks,
				requests,
				timeRange,
			),
		[projects, tasks, requests, timeRange],
	);

	const projectRows = useMemo(
		() =>
			computeProjectStatisticRows(
				projects,
				tasks,
				requests,
				timeRange,
			),
		[projects, tasks, requests, timeRange],
	);

	const orgNameById = useMemo(() => {
		const m: Record<string, string> = {};
		for (const o of Object.values(orgMap)) m[o.id] = o.name;
		return m;
	}, [orgMap]);

	const {
		projectCount,
		activeProjectCount,
		taskInventoryCount,
		taskCompletedCount,
		completionRatePercent,
		completionsInPeriod,
		completionsPreviousPeriod,
		overdueTaskCount,
		totalProjectBudget,
		totalProjectSpent,
		totalTaskPlannedBudget,
		totalTaskSpent,
		pendingApprovalCount,
	} = snapshot;

	const taskCompletionLabel =
		taskInventoryCount === 0 ? (
			<span className="text-muted-foreground">—</span>
		) : (
			<span className="tabular-nums">
				{taskCompletedCount}/{taskInventoryCount}
				{completionRatePercent != null ? (
					<span className="text-lg font-semibold text-muted-foreground">
						{" "}
						({completionRatePercent}%)
					</span>
				) : null}
			</span>
		);

	const showPeriodCompare = timeRange !== "all";

	const projectBreakdown = projectRows.map((p) => ({
		label: p.name,
		completions: p.completionsInPeriod,
	}));

	const materialRollup = useMemo(
		() => computeMaterialRollup(materials),
		[materials],
	);
	const materialGroupRows = useMemo(
		() => computeMaterialGroupRows(materials),
		[materials],
	);
	const projectMaterialRows = useMemo(
		() => computeProjectMaterialRows(materials, projects, tasks),
		[materials, projects, tasks],
	);

	const approvalSla = useMemo(
		() => computeApprovalSlaSnapshot(requests, timeRange),
		[requests, timeRange],
	);
	const approvalTypeRows = useMemo(
		() => computeApprovalTypeSlaRows(requests),
		[requests],
	);

	return (
		<div className="flex flex-col gap-8">
			<section className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold tracking-tight">Overview</h2>
						<p className="mt-1 text-xs text-muted-foreground">
							Rolls up every project synced to this session.
						</p>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<StatisticsDataToolbar
							onExport={() => ({
								filename: `buildinc-statistics-portfolio-${timeRange}.csv`,
								csv: buildPortfolioStatisticsCsv(
									snapshot,
									projectRows,
									timeRange,
									{
										materialRollup,
										materialGroupRows,
										projectMaterialRows,
										approvalSla,
										approvalTypeRows,
									},
								),
							})}
						/>
						<StatisticsTimeRangeFilter
							value={timeRange}
							onChange={onTimeRangeChange}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
					<SummaryCard
						title="Projects (active)"
						content={
							<span className="tabular-nums">
								{activeProjectCount}
								<span className="text-lg font-semibold text-muted-foreground">
									{" "}
									/ {projectCount}
								</span>
							</span>
						}
						icon={
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
								<FolderOpen className="h-5 w-5" aria-hidden />
							</span>
						}
						className={shell}
					/>
					<SummaryCard
						title="Tasks completed"
						content={
							<div className="space-y-2 text-left">
								{taskCompletionLabel}
								{showPeriodCompare ? (
									<p className="text-xs font-medium text-muted-foreground">
										<span className="tabular-nums text-foreground">
											{completionsInPeriod}
										</span>{" "}
										{periodCompletionCaption(timeRange)}
										<span className="block pt-0.5 tabular-nums text-foreground/90">
											{formatPeriodComparison(
												completionsInPeriod,
												completionsPreviousPeriod,
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
						content={<span className="tabular-nums">{overdueTaskCount}</span>}
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
							<span className="tabular-nums">{pendingApprovalCount}</span>
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
					completionsInPeriod={completionsInPeriod}
					completionsPreviousPeriod={completionsPreviousPeriod}
					projectSpent={totalProjectSpent}
					projectBudget={totalProjectBudget}
					taskSpent={totalTaskSpent}
					taskPlanned={totalTaskPlannedBudget}
					completionBreakdown={projectBreakdown}
					completionChartTitle="Completions by project"
					completionChartDescription="Tasks completed in the selected period, grouped by project"
				/>
			</section>

			<MaterialUsageSection
				rollup={materialRollup}
				groupRows={materialGroupRows}
				projectRows={projectMaterialRows}
			/>

			<ApprovalSlaSection
				snapshot={approvalSla}
				typeRows={approvalTypeRows}
				timeRange={timeRange}
			/>

			<section>
				<ProjectStatisticsTable
					rows={projectRows}
					orgNameById={orgNameById}
					timeRange={timeRange}
				/>
			</section>
		</div>
	);
}
