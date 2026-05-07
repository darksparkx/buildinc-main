import { Badge } from "@/components/base/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { cn } from "@/lib/functions/utils";
import { taskStatusBadgeVariant } from "@/lib/functions/taskStatusUi";
import { getProjectNameFromPhaseId } from "@/lib/functions/tasks";
import { getTaskMaterialsFromStore } from "@/lib/middleware/materials";
import { ITask } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Clock,
	Loader,
	Package,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const SECTION_META: Record<
	"active" | "reviewing" | "completed",
	{ icon: LucideIcon; headerIconClass: string }
> = {
	active: {
		icon: Loader,
		headerIconClass:
			"bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-400",
	},
	reviewing: {
		icon: AlertCircle,
		headerIconClass:
			"bg-blue-500/15 text-blue-800 ring-blue-500/25 dark:text-blue-300",
	},
	completed: {
		icon: CheckCircle2,
		headerIconClass:
			"bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400",
	},
};

const TaskTable = ({
	section,
	title,
	desc,
	taskList,
	emptyMessage,
}: {
	section: "active" | "reviewing" | "completed";
	title: string;
	desc: string;
	taskList: ITask[];
	emptyMessage: string;
}) => {
	const meta = SECTION_META[section];
	const Icon = meta.icon;

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 sm:pb-6">
				<div className="flex items-start gap-3">
					<span
						className={cn(
							"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
							meta.headerIconClass,
						)}
					>
						<Icon className="h-4 w-4" aria-hidden />
					</span>
					<div className="min-w-0">
						<CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
						<CardDescription>{desc}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pb-6 sm:px-6">
				{taskList.length > 0 ? (
					<ul className="grid grid-cols-1 gap-3 items-stretch md:grid-cols-2 xl:grid-cols-3">
						{taskList.map((task) => (
							<li key={task.id} className="flex min-h-0 min-w-0">
								<TaskCard task={task} section={section} />
							</li>
						))}
					</ul>
				) : (
					<div className="flex min-h-[8rem] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
						{emptyMessage}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

const TaskCard = ({
	task,
	section,
}: {
	task: ITask;
	section: "active" | "reviewing" | "completed";
}) => {
	const materials = getTaskMaterialsFromStore(task.id);
	const projectName = getProjectNameFromPhaseId(task.phaseId);

	const surface = {
		active:
			"border-sky-500/20 bg-sky-500/[0.06] hover:bg-sky-500/10 dark:bg-sky-950/25",
		reviewing:
			"border-blue-500/20 bg-blue-500/[0.06] hover:bg-blue-500/10 dark:bg-blue-950/25",
		completed:
			"border-emerald-500/20 bg-emerald-500/[0.06] hover:bg-emerald-500/10 dark:bg-emerald-950/25",
	}[section];

	return (
		<Link
			href={`/tasks/${task.id}`}
			className={cn(
				"flex w-full min-h-0 flex-1 flex-col rounded-xl border p-4 text-left shadow-sm transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				surface,
			)}
		>
			<div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 flex-1">
					<h3 className="font-semibold leading-snug">{task.name}</h3>
					{projectName ? (
						<p className="mt-0.5 truncate text-xs text-muted-foreground">
							{projectName}
						</p>
					) : null}
				</div>
				<Badge
					variant={taskStatusBadgeVariant(task.status)}
					className="w-fit shrink-0 capitalize"
				>
					{task.status}
				</Badge>
			</div>

			<div className="mt-2 min-h-0 flex-1">
				{task.description ? (
					<p className="line-clamp-2 text-sm text-muted-foreground">
						{task.description}
					</p>
				) : null}
			</div>

			<div className="mt-auto grid shrink-0 grid-cols-1 gap-2 pt-3 text-sm sm:grid-cols-2">
				<div className="flex items-center gap-2 text-muted-foreground">
					<Calendar className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
					<span>
						Due{" "}
						<span className="font-medium text-foreground">
							{task.endDate
								? new Date(task.endDate).toLocaleDateString()
								: "—"}
						</span>
					</span>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<Clock className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
					<span>
						<span className="font-medium tabular-nums text-foreground">
							{task.estimatedDuration ?? 0}
						</span>{" "}
						days est.
					</span>
				</div>
				{materials && materials.length > 0 && (
					<div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
						<Package className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
						<span>
							<span className="font-medium tabular-nums text-foreground">
								{materials.length}
							</span>{" "}
							material{materials.length !== 1 ? "s" : ""}
						</span>
					</div>
				)}
			</div>
		</Link>
	);
};

export default TaskTable;
