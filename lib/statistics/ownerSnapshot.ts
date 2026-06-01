import type { IProject, IRequest, ITask, status } from "@/lib/types";
import {
	countPeriodCompletions,
	isTaskOverdue,
} from "@/lib/statistics/taskMetrics";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";

export type OwnerStatisticsSnapshot = {
	projectCount: number;
	activeProjectCount: number;
	taskInventoryCount: number;
	taskCompletedCount: number;
	completionRatePercent: number | null;
	completionsInPeriod: number;
	completionsPreviousPeriod: number;
	overdueTaskCount: number;
	totalProjectBudget: number;
	totalProjectSpent: number;
	spendRatioPercent: number | null;
	totalTaskPlannedBudget: number;
	totalTaskSpent: number;
	taskSpendVsPlannedPercent: number | null;
	pendingApprovalCount: number;
	timeRange: StatisticsTimeRange;
};

export type ProjectStatisticRow = {
	projectId: string;
	name: string;
	status: status;
	orgId: string | null;
	taskInventoryCount: number;
	taskCompletedCount: number;
	completionRatePercent: number | null;
	overdueCount: number;
	budget: number;
	spent: number;
	projectSpendVsBudgetPercent: number | null;
	taskPlannedTotal: number;
	taskSpentTotal: number;
	taskSpendVsPlannedPercent: number | null;
	pendingApprovals: number;
	completionsInPeriod: number;
	completionsPreviousPeriod: number;
};

/** Snapshot KPIs from hydrated client stores (all-time, current session data). */
export function computeOwnerStatisticsSnapshot(
	projects: IProject[],
	tasks: ITask[],
	requests: IRequest[],
	timeRange: StatisticsTimeRange = "30d",
	now = new Date(),
): OwnerStatisticsSnapshot {
	const projectList = projects;
	const projectCount = projectList.length;
	const activeProjectCount = projectList.filter((p) => p.status === "Active")
		.length;

	const inventory = tasks.filter((t) => t.status !== "Inactive");
	const taskInventoryCount = inventory.length;
	const taskCompletedCount = inventory.filter((t) => t.status === "Completed")
		.length;
	const completionRatePercent =
		taskInventoryCount === 0
			? null
			: Math.round((taskCompletedCount / taskInventoryCount) * 100);

	const overdueTaskCount = tasks.filter((t) => isTaskOverdue(t, now)).length;
	const { current: completionsInPeriod, previous: completionsPreviousPeriod } =
		countPeriodCompletions(tasks, timeRange, now);

	let totalProjectBudget = 0;
	let totalProjectSpent = 0;
	for (const p of projectList) {
		totalProjectBudget += p.budget ?? 0;
		totalProjectSpent += p.spent ?? 0;
	}
	const spendRatioPercent =
		totalProjectBudget <= 0
			? null
			: Math.min(
					999,
					Math.round((totalProjectSpent / totalProjectBudget) * 100),
				);

	let totalTaskPlannedBudget = 0;
	let totalTaskSpent = 0;
	for (const t of inventory) {
		totalTaskPlannedBudget += t.plannedBudget ?? 0;
		totalTaskSpent += t.spent ?? 0;
	}
	const taskSpendVsPlannedPercent =
		totalTaskPlannedBudget <= 0
			? null
			: Math.min(
					999,
					Math.round((totalTaskSpent / totalTaskPlannedBudget) * 100),
				);

	const pendingApprovalCount = requests.filter((r) => r.status === "Pending")
		.length;

	return {
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
		spendRatioPercent,
		totalTaskPlannedBudget,
		totalTaskSpent,
		taskSpendVsPlannedPercent,
		pendingApprovalCount,
		timeRange,
	};
}

export function computeProjectStatisticRows(
	projects: IProject[],
	tasks: ITask[],
	requests: IRequest[],
	timeRange: StatisticsTimeRange = "30d",
	now = new Date(),
): ProjectStatisticRow[] {
	const tasksByProject = new Map<string, ITask[]>();
	for (const t of tasks) {
		const list = tasksByProject.get(t.projectId);
		if (list) list.push(t);
		else tasksByProject.set(t.projectId, [t]);
	}

	const pendingByProject = new Map<string, number>();
	for (const r of requests) {
		if (r.status !== "Pending" || r.projectId == null) continue;
		const pid = r.projectId;
		pendingByProject.set(pid, (pendingByProject.get(pid) ?? 0) + 1);
	}

	const rows: ProjectStatisticRow[] = [];

	for (const p of projects) {
		const pt = tasksByProject.get(p.id) ?? [];
		const inventory = pt.filter((t) => t.status !== "Inactive");
		const comp = inventory.filter((t) => t.status === "Completed");
		const invCount = inventory.length;
		const compCount = comp.length;
		const completionRatePercent =
			invCount === 0 ? null : Math.round((compCount / invCount) * 100);

		const overdueCount = pt.filter((t) => isTaskOverdue(t, now)).length;

		const budget = p.budget ?? 0;
		const spent = p.spent ?? 0;
		const projectSpendVsBudgetPercent =
			budget <= 0 ? null : Math.min(999, Math.round((spent / budget) * 100));

		let taskPlannedTotal = 0;
		let taskSpentTotal = 0;
		for (const t of inventory) {
			taskPlannedTotal += t.plannedBudget ?? 0;
			taskSpentTotal += t.spent ?? 0;
		}
		const taskSpendVsPlannedPercent =
			taskPlannedTotal <= 0
				? null
				: Math.min(
						999,
						Math.round((taskSpentTotal / taskPlannedTotal) * 100),
					);

		const { current: completionsInPeriod, previous: completionsPreviousPeriod } =
			countPeriodCompletions(pt, timeRange, now);

		rows.push({
			projectId: p.id,
			name: p.name,
			status: p.status,
			orgId: p.orgId,
			taskInventoryCount: invCount,
			taskCompletedCount: compCount,
			completionRatePercent,
			overdueCount,
			budget,
			spent,
			projectSpendVsBudgetPercent,
			taskPlannedTotal,
			taskSpentTotal,
			taskSpendVsPlannedPercent,
			pendingApprovals: pendingByProject.get(p.id) ?? 0,
			completionsInPeriod,
			completionsPreviousPeriod,
		});
	}

	return rows.sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
	);
}

export function computeProjectStatisticRow(
	project: IProject,
	tasks: ITask[],
	requests: IRequest[],
	timeRange: StatisticsTimeRange = "30d",
	now = new Date(),
): ProjectStatisticRow | null {
	const rows = computeProjectStatisticRows(
		[project],
		tasks,
		requests,
		timeRange,
		now,
	);
	return rows[0] ?? null;
}
