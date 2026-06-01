import type { ITask } from "@/lib/types";
import {
	currentAndPreviousWindows,
	type PeriodWindow,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";

export function startOfToday(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toValidDate(
	d: Date | string | null | undefined,
): Date | null {
	if (d == null) return null;
	const x = d instanceof Date ? d : new Date(d);
	return Number.isFinite(x.getTime()) ? x : null;
}

export function isTaskOverdue(task: ITask, now: Date): boolean {
	if (task.status === "Completed" || task.status === "Inactive") return false;
	if (task.endDate == null) return false;
	const due =
		task.endDate instanceof Date ? task.endDate : new Date(task.endDate);
	if (!Number.isFinite(due.getTime())) return false;
	return due < startOfToday(now);
}

export function countCompletionsInWindow(
	tasks: ITask[],
	window: PeriodWindow,
	now: Date,
): number {
	let count = 0;
	for (const t of tasks) {
		if (t.status !== "Completed") continue;
		const done = toValidDate(t.completedDate);
		if (!done || done > now) continue;
		if (done >= window.start && done < window.end) count += 1;
	}
	return count;
}

export function countPeriodCompletions(
	tasks: ITask[],
	timeRange: StatisticsTimeRange,
	now: Date,
): { current: number; previous: number } {
	const { current, previous } = currentAndPreviousWindows(timeRange, now);
	if (!current || !previous) {
		return {
			current: tasks.filter((t) => t.status === "Completed").length,
			previous: 0,
		};
	}
	return {
		current: countCompletionsInWindow(tasks, current, now),
		previous: countCompletionsInWindow(tasks, previous, now),
	};
}

export function taskStatusBreakdown(tasks: ITask[], now: Date) {
	const inventory = tasks.filter((t) => t.status !== "Inactive");
	const completed = inventory.filter((t) => t.status === "Completed").length;
	const overdue = inventory.filter((t) => isTaskOverdue(t, now)).length;
	const inProgress = Math.max(0, inventory.length - completed - overdue);
	return { completed, inProgress, overdue, inventory: inventory.length };
}
