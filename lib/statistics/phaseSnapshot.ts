import type { IPhase, ITask } from "@/lib/types";
import {
	countPeriodCompletions,
	isTaskOverdue,
} from "@/lib/statistics/taskMetrics";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";

export type PhaseStatisticRow = {
	phaseId: string;
	name: string;
	projectId: string;
	order: number;
	taskInventoryCount: number;
	taskCompletedCount: number;
	completionRatePercent: number | null;
	overdueCount: number;
	budget: number;
	taskPlannedTotal: number;
	taskSpentTotal: number;
	completionsInPeriod: number;
	completionsPreviousPeriod: number;
};

export function computePhaseStatisticRows(
	phases: IPhase[],
	tasks: ITask[],
	timeRange: StatisticsTimeRange = "30d",
	now = new Date(),
): PhaseStatisticRow[] {
	const tasksByPhase = new Map<string, ITask[]>();
	for (const t of tasks) {
		const list = tasksByPhase.get(t.phaseId);
		if (list) list.push(t);
		else tasksByPhase.set(t.phaseId, [t]);
	}

	const rows: PhaseStatisticRow[] = [];

	for (const phase of phases) {
		const pt = tasksByPhase.get(phase.id) ?? [];
		const inventory = pt.filter((t) => t.status !== "Inactive");
		const comp = inventory.filter((t) => t.status === "Completed");
		const invCount = inventory.length;
		const compCount = comp.length;
		const completionRatePercent =
			invCount === 0 ? null : Math.round((compCount / invCount) * 100);

		let taskPlannedTotal = 0;
		let taskSpentTotal = 0;
		for (const t of inventory) {
			taskPlannedTotal += t.plannedBudget ?? 0;
			taskSpentTotal += t.spent ?? 0;
		}

		const { current: completionsInPeriod, previous: completionsPreviousPeriod } =
			countPeriodCompletions(pt, timeRange, now);

		rows.push({
			phaseId: phase.id,
			name: phase.name,
			projectId: phase.projectId,
			order: phase.order,
			taskInventoryCount: invCount,
			taskCompletedCount: compCount,
			completionRatePercent,
			overdueCount: pt.filter((t) => isTaskOverdue(t, now)).length,
			budget: phase.budget ?? 0,
			taskPlannedTotal,
			taskSpentTotal,
			completionsInPeriod,
			completionsPreviousPeriod,
		});
	}

	return rows.sort((a, b) => a.order - b.order);
}
