import { isTaskOverdue } from "@/lib/statistics/taskMetrics";
import { useTaskStore } from "@/lib/store/taskStore";
import type { IProject, ITask } from "@/lib/types";

export type ProjectTaskSummary = {
	total: number;
	completed: number;
	overdue: number;
	progress: number;
};

export function getProjectTasksFromStore(projectId: string): ITask[] {
	return Object.values(useTaskStore.getState().tasks).filter(
		(t) => t.projectId === projectId,
	);
}

export function summarizeProjectTasks(
	project: IProject,
	tasks: ITask[],
	now: Date = new Date(),
): ProjectTaskSummary {
	const total = project.totalTasks ?? tasks.filter((t) => t.status !== "Inactive").length;
	const completed =
		project.completedTasks ??
		tasks.filter(
			(t) => t.status === "Completed" || t.status === "Reviewing",
		).length;
	const overdue = tasks.filter((t) => isTaskOverdue(t, now)).length;
	const progress = Number.isFinite(project.progress) ? project.progress : 0;

	return {
		total,
		completed,
		overdue,
		progress: Math.round(progress),
	};
}

function dueSortKey(task: ITask): number {
	if (task.endDate == null) return Number.POSITIVE_INFINITY;
	const d = task.endDate instanceof Date ? task.endDate : new Date(task.endDate);
	return Number.isFinite(d.getTime()) ? d.getTime() : Number.POSITIVE_INFINITY;
}

/** Overdue and in-flight tasks first; fill with recently completed if needed. */
export function selectLinkedTasksPreview(
	tasks: ITask[],
	now: Date = new Date(),
	limit = 8,
): ITask[] {
	const inFlight = tasks.filter(
		(t) => t.status !== "Inactive" && t.status !== "Completed",
	);
	const overdue = inFlight.filter((t) => isTaskOverdue(t, now));
	const upcoming = inFlight.filter((t) => !isTaskOverdue(t, now));

	overdue.sort((a, b) => dueSortKey(a) - dueSortKey(b));
	upcoming.sort((a, b) => dueSortKey(a) - dueSortKey(b));

	const recentCompleted = tasks
		.filter((t) => t.status === "Completed")
		.sort((a, b) => {
			const ad = a.completedDate
				? new Date(a.completedDate).getTime()
				: 0;
			const bd = b.completedDate
				? new Date(b.completedDate).getTime()
				: 0;
			return bd - ad;
		});

	const combined = [...overdue, ...upcoming];
	if (combined.length >= limit) return combined.slice(0, limit);

	const remaining = limit - combined.length;
	return [...combined, ...recentCompleted.slice(0, remaining)];
}
