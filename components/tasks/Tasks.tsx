"use client";

import { SummaryCard } from "@/components/base/general/SummaryCard";
import { ITask } from "@/lib/types";
import { AlertCircle, CheckCircle2, ClipboardList, Loader } from "lucide-react";
import { useMemo } from "react";
import TaskTable from "./TaskTable";

export default function Tasks({ tasks }: { tasks: ITask[] }) {
	const inProgressTasks = useMemo(
		() => tasks.filter((task) => task.status === "Active"),
		[tasks],
	);
	const awaitingApprovalTasks = useMemo(
		() => tasks.filter((task) => task.status === "Reviewing"),
		[tasks],
	);
	const completedTasks = useMemo(
		() => tasks.filter((task) => task.status === "Completed"),
		[tasks],
	);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex items-start gap-3">
								<span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 lg:inline-flex">
									<ClipboardList className="h-5 w-5" aria-hidden />
								</span>
								<div className="min-w-0">
									<h1 className="hidden text-2xl font-semibold tracking-tight lg:block lg:text-3xl">
										Tasks
									</h1>
									<p className="max-w-xl text-sm text-muted-foreground lg:mt-1 sm:text-base">
										Work assigned to you — progress, review, and
										completion.
									</p>
								</div>
							</div>
						</div>
						<p className="text-sm text-muted-foreground tabular-nums sm:text-right">
							{tasks.length} total
						</p>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
						<SummaryCard
							className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							title="In progress"
							content={inProgressTasks.length.toLocaleString()}
							icon={
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/25 dark:text-sky-400">
									<Loader className="h-5 w-5" aria-hidden />
								</span>
							}
						/>
						<SummaryCard
							className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							title="Awaiting approval"
							content={awaitingApprovalTasks.length.toLocaleString()}
							icon={
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-800 ring-1 ring-blue-500/25 dark:text-blue-300">
									<AlertCircle className="h-5 w-5" aria-hidden />
								</span>
							}
						/>
						<SummaryCard
							className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							title="Completed"
							content={completedTasks.length.toLocaleString()}
							icon={
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-400">
									<CheckCircle2 className="h-5 w-5" aria-hidden />
								</span>
							}
						/>
					</div>
				</header>

				<TaskTable
					section="active"
					title="In progress"
					desc="Tasks you’re actively working on"
					taskList={inProgressTasks}
					emptyMessage="No tasks in progress"
				/>
				<TaskTable
					section="reviewing"
					title="Awaiting approval"
					desc="Submitted for manager review"
					taskList={awaitingApprovalTasks}
					emptyMessage="Nothing awaiting approval"
				/>
				<TaskTable
					section="completed"
					title="Completed"
					desc="Approved and finished"
					taskList={completedTasks}
					emptyMessage="No completed tasks yet"
				/>
			</div>
		</div>
	);
}
