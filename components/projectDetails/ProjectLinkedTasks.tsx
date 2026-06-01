"use client";

import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Badge } from "@/components/base/ui/badge";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { cn } from "@/lib/functions/utils";
import {
	getProjectTasksFromStore,
	selectLinkedTasksPreview,
	summarizeProjectTasks,
} from "@/lib/projectTasks/snapshot";
import { isTaskOverdue } from "@/lib/statistics/taskMetrics";
import { useTaskStore } from "@/lib/store/taskStore";
import type { IProject, ITask } from "@/lib/types";
import { AlertCircle, Calendar, ChevronRight, ListTodo } from "lucide-react";
import { useMemo } from "react";

function taskStatusLabel(task: ITask, now: Date): string {
	if (isTaskOverdue(task, now)) return "Overdue";
	return task.status;
}

function taskStatusClass(task: ITask, now: Date): string {
	if (isTaskOverdue(task, now)) {
		return "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100";
	}
	switch (task.status) {
		case "Active":
			return "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-100";
		case "Reviewing":
			return "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-100";
		case "Pending":
			return "border-orange-500/30 bg-orange-500/10 text-orange-900 dark:text-orange-100";
		case "Completed":
			return "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
		default:
			return "";
	}
}

type Props = {
	project: IProject;
	onSelectTask: (task: ITask) => void;
	onViewBoard: () => void;
};

export function ProjectLinkedTasks({
	project,
	onSelectTask,
	onViewBoard,
}: Props) {
	const taskRevision = useTaskStore((s) =>
		Object.values(s.tasks)
			.filter((t) => t.projectId === project.id)
			.map((t) => `${t.id}:${t.status}:${t.endDate ?? ""}`)
			.join("|"),
	);

	const { summary, preview, hasMore, now } = useMemo(() => {
		const now = new Date();
		const tasks = getProjectTasksFromStore(project.id);
		const summary = summarizeProjectTasks(project, tasks, now);
		const preview = selectLinkedTasksPreview(tasks, now, 8);
		const inFlight = tasks.filter(
			(t) => t.status !== "Inactive" && t.status !== "Completed",
		);
		return {
			summary,
			preview,
			hasMore: inFlight.length > preview.filter(
				(t) => t.status !== "Completed",
			).length,
			now,
		};
	}, [project, taskRevision]);

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="flex flex-col gap-3 space-y-0 pb-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-2">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
						<ListTodo className="h-4 w-4" aria-hidden />
					</span>
					<div className="min-w-0 space-y-1">
						<CardTitle className="text-lg sm:text-xl">Tasks</CardTitle>
						<CardDescription>
							{summary.completed} of {summary.total} complete
							{summary.overdue > 0
								? ` · ${summary.overdue} overdue`
								: ""}
						</CardDescription>
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-full shrink-0 sm:w-auto"
					onClick={onViewBoard}
				>
					View task board
					<ChevronRight className="ml-1 h-4 w-4" aria-hidden />
				</Button>
			</CardHeader>
			<CardContent className="space-y-2">
				{preview.length === 0 ? (
					<p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
						No tasks yet. Open the task board to add work items for this
						project.
					</p>
				) : (
					<ul className="divide-y divide-border/50 rounded-lg border border-border/60">
						{preview.map((task) => {
							const overdue = isTaskOverdue(task, now);
							const dueLabel =
								task.endDate != null
									? formatCalendarDate(task.endDate)
									: null;

							return (
								<li key={task.id}>
									<button
										type="button"
										className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
										onClick={() => onSelectTask(task)}
									>
										<div className="min-w-0 flex-1 space-y-1">
											<p className="line-clamp-2 text-sm font-medium leading-snug">
												{task.name}
											</p>
											{dueLabel ? (
												<p
													className={cn(
														"flex items-center gap-1 text-xs tabular-nums",
														overdue
															? "text-amber-700 dark:text-amber-300"
															: "text-muted-foreground",
													)}
												>
													{overdue ? (
														<AlertCircle
															className="h-3 w-3 shrink-0"
															aria-hidden
														/>
													) : (
														<Calendar
															className="h-3 w-3 shrink-0"
															aria-hidden
														/>
													)}
													Due {dueLabel}
												</p>
											) : null}
										</div>
										<Badge
											variant="outline"
											className={cn(
												"shrink-0 text-[11px]",
												taskStatusClass(task, now),
											)}
										>
											{taskStatusLabel(task, now)}
										</Badge>
									</button>
								</li>
							);
						})}
					</ul>
				)}
				{hasMore && preview.length > 0 ? (
					<p className="text-center text-xs text-muted-foreground">
						More active tasks on the board — use View task board for the full
						list.
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
