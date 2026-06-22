"use client";

import { getUserTasks } from "@/lib/middleware/tasks";
import { useTaskStore } from "@/lib/store/taskStore";
import { ITask } from "@/lib/types";
import { useEffect, useMemo } from "react";

const TASK_POLL_MS = 12_000;

/** Live list of tasks assigned to the current user. */
export function useUserTasks(userId: string | undefined): ITask[] {
	const taskMap = useTaskStore((state) => state.tasks);

	const tasks = useMemo(
		() =>
			userId
				? Object.values(taskMap).filter(
						(task) => task.assignedTo === userId,
					)
				: [],
		[taskMap, userId],
	);

	useEffect(() => {
		if (!userId) return;

		const refresh = () => {
			if (document.visibilityState !== "visible") return;
			void getUserTasks(userId).catch((error) => {
				console.error("Error syncing user tasks:", error);
			});
		};

		refresh();
		const interval = setInterval(refresh, TASK_POLL_MS);
		const onFocus = () => refresh();
		const onVisibility = () => {
			if (document.visibilityState === "visible") refresh();
		};

		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisibility);

		return () => {
			clearInterval(interval);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [userId]);

	return tasks;
}
