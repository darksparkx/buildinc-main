"use client";

import ProjectStatisticsPanel from "@/components/statistics/ProjectStatisticsPanel";
import {
	computeApprovalSlaSnapshot,
	computeApprovalTypeSlaRows,
} from "@/lib/statistics/approvalSnapshot";
import {
	computeMaterialGroupRows,
	computeMaterialRollup,
	taskIdSetForTasks,
} from "@/lib/statistics/materialSnapshot";
import { useMaterialStore } from "@/lib/store/materialStore";
import StatisticsDataToolbar from "@/components/statistics/StatisticsDataToolbar";
import StatisticsTimeRangeFilter from "@/components/statistics/StatisticsTimeRangeFilter";
import { buildProjectStatisticsCsv } from "@/lib/statistics/exportCsv";
import { TabsContent } from "@/components/base/ui/tabs";
import { computeProjectStatisticRow } from "@/lib/statistics/ownerSnapshot";
import { computePhaseStatisticRows } from "@/lib/statistics/phaseSnapshot";
import {
	isStatisticsTimeRange,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { useTaskStore } from "@/lib/store/taskStore";
import type { IProject } from "@/lib/types";
import { useUrlQueryTab } from "@/lib/hooks/useUrlQueryTab";
import { useMemo } from "react";

const STATS_RANGES = ["7d", "30d", "90d", "all"] as const;

export function ProjectStatistics({ projectData }: { projectData: IProject }) {
	const [timeRange, setTimeRange] = useUrlQueryTab(
		STATS_RANGES,
		"30d",
		"range",
	);

	const tasks = useTaskStore((s) => s.tasks);
	const phases = usePhaseStore((s) => s.phases);
	const requests = useRequestStore((s) => s.requests);
	const materialMap = useMaterialStore((s) => s.materials);

	const projectTasks = useMemo(
		() => Object.values(tasks).filter((t) => t.projectId === projectData.id),
		[tasks, projectData.id],
	);

	const projectPhases = useMemo(
		() =>
			Object.values(phases)
				.filter((p) => p.projectId === projectData.id)
				.sort((a, b) => a.order - b.order),
		[phases, projectData.id],
	);

	const projectRequests = useMemo(
		() =>
			Object.values(requests).filter((r) => r.projectId === projectData.id),
		[requests, projectData.id],
	);

	const safeRange: StatisticsTimeRange = isStatisticsTimeRange(timeRange)
		? timeRange
		: "30d";

	const row = useMemo(
		() =>
			computeProjectStatisticRow(
				projectData,
				projectTasks,
				projectRequests,
				safeRange,
			),
		[projectData, projectTasks, projectRequests, safeRange],
	);

	const phaseRows = useMemo(
		() => computePhaseStatisticRows(projectPhases, projectTasks, safeRange),
		[projectPhases, projectTasks, safeRange],
	);

	const materials = useMemo(
		() => Object.values(materialMap),
		[materialMap],
	);
	const projectTaskIds = useMemo(
		() => taskIdSetForTasks(projectTasks),
		[projectTasks],
	);
	const materialRollup = useMemo(
		() => computeMaterialRollup(materials, projectTaskIds),
		[materials, projectTaskIds],
	);
	const materialGroupRows = useMemo(
		() => computeMaterialGroupRows(materials, projectTaskIds),
		[materials, projectTaskIds],
	);

	const approvalSla = useMemo(
		() => computeApprovalSlaSnapshot(projectRequests, safeRange),
		[projectRequests, safeRange],
	);
	const approvalTypeRows = useMemo(
		() => computeApprovalTypeSlaRows(projectRequests),
		[projectRequests],
	);

	return (
		<TabsContent value="statistics" className="mt-0 space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Project statistics
					</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Charts and rollups for this project from synced task data.
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					{row ? (
						<StatisticsDataToolbar
							onExport={() => ({
								filename: `buildinc-statistics-project-${projectData.id}-${safeRange}.csv`,
								csv: buildProjectStatisticsCsv(
									projectData.name,
									row,
									phaseRows,
									safeRange,
									{
										materialRollup,
										materialGroupRows,
										approvalSla,
										approvalTypeRows,
									},
								),
							})}
							importProjectIds={[projectData.id]}
						/>
					) : null}
					<StatisticsTimeRangeFilter
						value={safeRange}
						onChange={setTimeRange}
					/>
				</div>
			</div>
			{row ? (
				<ProjectStatisticsPanel
					row={row}
					tasks={projectTasks}
					phaseRows={phaseRows}
					timeRange={safeRange}
					materialRollup={materialRollup}
					materialGroupRows={materialGroupRows}
					approvalSla={approvalSla}
					approvalTypeRows={approvalTypeRows}
				/>
			) : (
				<p className="rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-border/40">
					No statistics available for this project yet.
				</p>
			)}
		</TabsContent>
	);
}
