"use client";

import ApprovalSlaSection from "@/components/statistics/ApprovalSlaSection";
import MaterialUsageSection from "@/components/statistics/MaterialUsageSection";
import ProjectStatisticsTable from "@/components/statistics/ProjectStatisticsTable";
import StatisticsChartsSection from "@/components/statistics/StatisticsChartsSection";
import StatisticsDataToolbar from "@/components/statistics/StatisticsDataToolbar";
import StatisticsTimeRangeFilter from "@/components/statistics/StatisticsTimeRangeFilter";
import { buildOrganisationStatisticsCsv } from "@/lib/statistics/exportCsv";
import {
	computeApprovalSlaSnapshot,
	computeApprovalTypeSlaRows,
} from "@/lib/statistics/approvalSnapshot";
import {
	computeMaterialGroupRows,
	computeMaterialRollup,
	computeProjectMaterialRows,
	taskIdSetForTasks,
} from "@/lib/statistics/materialSnapshot";
import { SummaryCard } from "@/components/base/general/SummaryCard";
import { TabsContent } from "@/components/base/ui/tabs";
import {
	computeOwnerStatisticsSnapshot,
	computeProjectStatisticRows,
} from "@/lib/statistics/ownerSnapshot";
import {
	formatPeriodComparison,
	periodCompletionCaption,
} from "@/lib/statistics/periodComparison";
import {
	isStatisticsTimeRange,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";
import { useMaterialStore } from "@/lib/store/materialStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { useTaskStore } from "@/lib/store/taskStore";
import type { IOrganisation, IProject } from "@/lib/types";
import { useUrlQueryTab } from "@/lib/hooks/useUrlQueryTab";
import { CalendarClock, FolderOpen, TrendingUp } from "lucide-react";
import { useMemo } from "react";

const STATS_RANGES = ["7d", "30d", "90d", "all"] as const;

const shell =
	"border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm";

export default function OrganisationStatistics({
	organisation,
	projects,
}: {
	organisation: IOrganisation;
	projects: IProject[];
}) {
	const [timeRange, setTimeRange] = useUrlQueryTab(
		STATS_RANGES,
		"30d",
		"range",
	);

	const tasks = useTaskStore((s) => s.tasks);
	const requests = useRequestStore((s) => s.requests);
	const materialMap = useMaterialStore((s) => s.materials);

	const safeRange: StatisticsTimeRange = isStatisticsTimeRange(timeRange)
		? timeRange
		: "30d";

	const projectIds = useMemo(
		() => new Set(projects.map((p) => p.id)),
		[projects],
	);

	const orgTasks = useMemo(
		() => Object.values(tasks).filter((t) => projectIds.has(t.projectId)),
		[tasks, projectIds],
	);

	const orgRequests = useMemo(
		() =>
			Object.values(requests).filter(
				(r) => r.projectId != null && projectIds.has(r.projectId),
			),
		[requests, projectIds],
	);

	const snapshot = useMemo(
		() =>
			computeOwnerStatisticsSnapshot(
				projects,
				orgTasks,
				orgRequests,
				safeRange,
			),
		[projects, orgTasks, orgRequests, safeRange],
	);

	const projectRows = useMemo(
		() =>
			computeProjectStatisticRows(
				projects,
				orgTasks,
				orgRequests,
				safeRange,
			),
		[projects, orgTasks, orgRequests, safeRange],
	);

	const projectBreakdown = projectRows.map((p) => ({
		label: p.name,
		completions: p.completionsInPeriod,
	}));

	const materials = useMemo(
		() => Object.values(materialMap),
		[materialMap],
	);
	const orgTaskIds = useMemo(() => taskIdSetForTasks(orgTasks), [orgTasks]);
	const materialRollup = useMemo(
		() => computeMaterialRollup(materials, orgTaskIds),
		[materials, orgTaskIds],
	);
	const materialGroupRows = useMemo(
		() => computeMaterialGroupRows(materials, orgTaskIds),
		[materials, orgTaskIds],
	);
	const projectMaterialRows = useMemo(
		() => computeProjectMaterialRows(materials, projects, orgTasks),
		[materials, projects, orgTasks],
	);

	const approvalSla = useMemo(
		() => computeApprovalSlaSnapshot(orgRequests, safeRange),
		[orgRequests, safeRange],
	);
	const approvalTypeRows = useMemo(
		() => computeApprovalTypeSlaRows(orgRequests),
		[orgRequests],
	);

	const orgNameById = useMemo(
		() => ({ [organisation.id]: organisation.name }),
		[organisation.id, organisation.name],
	);

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
	} = snapshot;

	const showPeriodCompare = safeRange !== "all";

	return (
		<TabsContent value="statistics" className="mt-0 space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Organisation statistics
					</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Analytics across {organisation.name}&apos;s projects.
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<StatisticsDataToolbar
						onExport={() => ({
							filename: `buildinc-statistics-org-${organisation.id}-${safeRange}.csv`,
							csv: buildOrganisationStatisticsCsv(
								organisation.name,
								snapshot,
								projectRows,
								safeRange,
								{
									materialRollup,
									materialGroupRows,
									projectMaterialRows,
									approvalSla,
									approvalTypeRows,
								},
							),
						})}
						importProjectIds={projects.map((p) => p.id)}
					/>
					<StatisticsTimeRangeFilter
						value={safeRange}
						onChange={setTimeRange}
					/>
				</div>
			</div>

			<StatisticsChartsSection
				tasks={orgTasks}
				timeRange={safeRange}
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

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
							<span className="tabular-nums">
								{taskCompletedCount}/{taskInventoryCount}
								{completionRatePercent != null ? (
									<span className="text-lg font-semibold text-muted-foreground">
										{" "}
										({completionRatePercent}%)
									</span>
								) : null}
							</span>
							{showPeriodCompare ? (
								<p className="text-xs font-medium text-muted-foreground">
									<span className="tabular-nums text-foreground">
										{completionsInPeriod}
									</span>{" "}
									{periodCompletionCaption(safeRange)}
									<span className="block pt-0.5 tabular-nums text-foreground/90">
										{formatPeriodComparison(
											completionsInPeriod,
											completionsPreviousPeriod,
										)}
									</span>
								</p>
							) : null}
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
					content={
						<span className="tabular-nums">{overdueTaskCount}</span>
					}
					icon={
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300">
							<CalendarClock className="h-5 w-5" aria-hidden />
						</span>
					}
					className={shell}
				/>
			</div>

			<MaterialUsageSection
				rollup={materialRollup}
				groupRows={materialGroupRows}
			/>

			<ApprovalSlaSection
				snapshot={approvalSla}
				typeRows={approvalTypeRows}
				timeRange={safeRange}
			/>

			<ProjectStatisticsTable
				rows={projectRows}
				orgNameById={orgNameById}
				timeRange={safeRange}
			/>
		</TabsContent>
	);
}
