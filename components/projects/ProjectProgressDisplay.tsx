"use client";

import { Badge } from "@/components/base/ui/badge";
import { Progress } from "@/components/base/ui/progress";
import {
	getProjectTasksFromStore,
	summarizeProjectTasks,
} from "@/lib/projectTasks/snapshot";
import { useTaskStore } from "@/lib/store/taskStore";
import type { IProject } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/functions/utils";

type Props = {
	project: IProject;
	/** Compact row for table cells; default is suitable for mobile cards. */
	compact?: boolean;
	className?: string;
};

export function ProjectProgressDisplay({
	project,
	compact = false,
	className,
}: Props) {
	const [calendarDay, setCalendarDay] = useState(() =>
		new Date().toISOString().slice(0, 10),
	);
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;
		const syncCalendarDay = () => {
			const today = new Date().toISOString().slice(0, 10);
			setCalendarDay((prev) => (prev === today ? prev : today));
			const nextMidnight = new Date();
			nextMidnight.setHours(24, 0, 0, 0);
			timeoutId = setTimeout(syncCalendarDay, nextMidnight.getTime() - Date.now());
		};
		syncCalendarDay();
		return () => clearTimeout(timeoutId);
	}, []);

	const taskRevision = useTaskStore((s) =>
		Object.values(s.tasks)
			.filter((t) => t.projectId === project.id)
			.map((t) => `${t.id}:${t.status}:${t.endDate ?? ""}`)
			.join("|"),
	);

	const summary = useMemo(() => {
		const tasks = getProjectTasksFromStore(project.id);
		return summarizeProjectTasks(project, tasks, new Date());
	}, [project, taskRevision, calendarDay]);

	const { progress, completed, total, overdue } = summary;

	if (compact) {
		return (
			<div className={cn("space-y-1.5", className)}>
				<div className="flex items-center justify-center gap-2 text-sm tabular-nums">
					<span className="font-medium">{progress}%</span>
					<span className="text-muted-foreground">
						{completed}/{total}
					</span>
				</div>
				<Progress
					value={Math.min(100, Math.max(0, progress))}
					className="mx-auto h-1.5 max-w-[8rem] bg-muted"
				/>
				{overdue > 0 ? (
					<Badge
						variant="outline"
						className="mx-auto border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-900 dark:text-amber-100"
					>
						{overdue} overdue
					</Badge>
				) : null}
			</div>
		);
	}

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
				<span className="tabular-nums font-medium">{progress}%</span>
				<span className="text-muted-foreground tabular-nums">
					{completed} / {total} tasks
				</span>
				{overdue > 0 ? (
					<Badge
						variant="outline"
						className="border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-900 dark:text-amber-100"
					>
						{overdue} overdue
					</Badge>
				) : null}
			</div>
			<Progress
				value={Math.min(100, Math.max(0, progress))}
				className="h-2 bg-muted"
			/>
		</div>
	);
}
