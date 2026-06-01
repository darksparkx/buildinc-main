import type { IMaterial, IProject, ITask } from "@/lib/types";

export function materialPlannedCost(m: IMaterial): number {
	return (m.plannedQuantity ?? 0) * (m.unitCost ?? 0);
}

export function materialUsedCost(m: IMaterial): number {
	return (m.usedQuantity ?? 0) * (m.unitCost ?? 0);
}

export type MaterialRollupSnapshot = {
	lineCount: number;
	plannedCostTotal: number;
	usedCostTotal: number;
	usageVsPlannedPercent: number | null;
	linesOverPlan: number;
};

export type MaterialGroupRow = {
	key: string;
	name: string;
	unit: string;
	lineCount: number;
	plannedCost: number;
	usedCost: number;
	plannedQuantity: number;
	usedQuantity: number;
	usageVsPlannedPercent: number | null;
};

export type ProjectMaterialRow = {
	projectId: string;
	projectName: string;
	lineCount: number;
	plannedCostTotal: number;
	usedCostTotal: number;
	usageVsPlannedPercent: number | null;
};

function usagePercent(used: number, planned: number): number | null {
	if (planned <= 0) return null;
	return Math.min(999, Math.round((used / planned) * 100));
}

function filterMaterialsByTasks(
	materials: IMaterial[],
	taskIds: Set<string>,
): IMaterial[] {
	return materials.filter((m) => taskIds.has(m.taskId));
}

export function computeMaterialRollup(
	materials: IMaterial[],
	taskIds?: Set<string>,
): MaterialRollupSnapshot {
	const scoped = taskIds
		? filterMaterialsByTasks(materials, taskIds)
		: materials;

	let plannedCostTotal = 0;
	let usedCostTotal = 0;
	let linesOverPlan = 0;

	for (const m of scoped) {
		const planned = materialPlannedCost(m);
		const used = materialUsedCost(m);
		const plannedQty = m.plannedQuantity ?? 0;
		const usedQty = m.usedQuantity ?? 0;
		plannedCostTotal += planned;
		usedCostTotal += used;
		if (usedQty > plannedQty && plannedQty > 0) {
			linesOverPlan += 1;
		}
	}

	return {
		lineCount: scoped.length,
		plannedCostTotal,
		usedCostTotal,
		usageVsPlannedPercent: usagePercent(usedCostTotal, plannedCostTotal),
		linesOverPlan,
	};
}

export function computeMaterialGroupRows(
	materials: IMaterial[],
	taskIds?: Set<string>,
): MaterialGroupRow[] {
	const scoped = taskIds
		? filterMaterialsByTasks(materials, taskIds)
		: materials;

	const byKey = new Map<
		string,
		{
			name: string;
			unit: string;
			lineCount: number;
			plannedCost: number;
			usedCost: number;
			plannedQuantity: number;
			usedQuantity: number;
		}
	>();

	for (const m of scoped) {
		const unit = m.unit?.trim() || "—";
		const key = `${m.name.trim().toLowerCase()}|${unit.toLowerCase()}`;
		const planned = materialPlannedCost(m);
		const used = materialUsedCost(m);
		const existing = byKey.get(key);
		if (existing) {
			existing.lineCount += 1;
			existing.plannedCost += planned;
			existing.usedCost += used;
			existing.plannedQuantity += m.plannedQuantity ?? 0;
			existing.usedQuantity += m.usedQuantity ?? 0;
		} else {
			byKey.set(key, {
				name: m.name,
				unit,
				lineCount: 1,
				plannedCost: planned,
				usedCost: used,
				plannedQuantity: m.plannedQuantity ?? 0,
				usedQuantity: m.usedQuantity ?? 0,
			});
		}
	}

	return [...byKey.entries()]
		.map(([key, v]) => ({
			key,
			name: v.name,
			unit: v.unit,
			lineCount: v.lineCount,
			plannedCost: v.plannedCost,
			usedCost: v.usedCost,
			plannedQuantity: v.plannedQuantity,
			usedQuantity: v.usedQuantity,
			usageVsPlannedPercent: usagePercent(v.usedCost, v.plannedCost),
		}))
		.sort((a, b) => b.plannedCost - a.plannedCost);
}

export function computeProjectMaterialRows(
	materials: IMaterial[],
	projects: IProject[],
	tasks: ITask[],
): ProjectMaterialRow[] {
	const taskIdsByProject = new Map<string, Set<string>>();
	for (const t of tasks) {
		let set = taskIdsByProject.get(t.projectId);
		if (!set) {
			set = new Set();
			taskIdsByProject.set(t.projectId, set);
		}
		set.add(t.id);
	}

	const rows: ProjectMaterialRow[] = [];

	for (const p of projects) {
		const taskIds = taskIdsByProject.get(p.id);
		if (!taskIds || taskIds.size === 0) continue;
		const rollup = computeMaterialRollup(materials, taskIds);
		if (rollup.lineCount === 0) continue;
		rows.push({
			projectId: p.id,
			projectName: p.name,
			lineCount: rollup.lineCount,
			plannedCostTotal: rollup.plannedCostTotal,
			usedCostTotal: rollup.usedCostTotal,
			usageVsPlannedPercent: rollup.usageVsPlannedPercent,
		});
	}

	return rows.sort((a, b) =>
		a.projectName.localeCompare(b.projectName, undefined, {
			sensitivity: "base",
		}),
	);
}

export function taskIdSetForTasks(tasks: ITask[]): Set<string> {
	return new Set(tasks.map((t) => t.id));
}
