import { Avatar, AvatarFallback } from "@/components/base/ui/avatar";
import { Badge } from "@/components/base/ui/badge";
import { TabsContent } from "@/components/base/ui/tabs";
import { cn } from "@/lib/functions/utils";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { getTaskMaterialsFromStore } from "@/lib/middleware/materials";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { IPhase, ITask, status } from "@/lib/types";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Clock,
	LayoutGrid,
	Loader,
	Package,
	WatchIcon,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const STATUS_ORDER: status[] = [
	"Inactive",
	"Pending",
	"Active",
	"Reviewing",
	"Completed",
];

/** One strong hue per status so column name ↔ color is obvious at a glance. */
const COLUMN_META: Record<
	status,
	{
		title: string;
		icon: React.ComponentType<{ className?: string }>;
		headerClass: string;
		bodyClass: string;
		accent: string;
		badgeClass: string;
	}
> = {
	Inactive: {
		title: "Inactive",
		icon: Clock,
		/* Rose reads “paused / not started” without the harshness of pure error-red */
		headerClass:
			"border-b-2 border-rose-600 bg-rose-200 text-rose-950 dark:bg-rose-950 dark:text-rose-50 dark:border-rose-500",
		bodyClass: "bg-rose-50 dark:bg-rose-950/40",
		accent: "border-l-rose-300 dark:border-l-rose-500/45",
		badgeClass:
			"border-rose-900/30 bg-rose-950/15 text-rose-950 dark:border-rose-200/30 dark:bg-rose-100/15 dark:text-rose-50",
	},
	Pending: {
		title: "Pending",
		icon: Clock,
		headerClass:
			"border-b-2 border-orange-500 bg-orange-300 text-orange-950 dark:bg-orange-950 dark:text-orange-50 dark:border-orange-400",
		bodyClass: "bg-orange-50 dark:bg-orange-950/35",
		accent: "border-l-amber-200 dark:border-l-orange-400/40",
		badgeClass:
			"border-orange-900/25 bg-orange-950/15 text-orange-950 dark:border-orange-200/30 dark:bg-orange-100/15 dark:text-orange-50",
	},
	Active: {
		title: "Active",
		icon: Loader,
		headerClass:
			"border-b-2 border-blue-600 bg-blue-600 text-white dark:bg-blue-700 dark:border-blue-500",
		bodyClass: "bg-blue-50 dark:bg-blue-950/40",
		accent: "border-l-blue-300 dark:border-l-blue-500/45",
		badgeClass: "border-white/30 bg-white/20 text-white",
	},
	Reviewing: {
		title: "Reviewing",
		icon: WatchIcon,
		headerClass:
			"border-b-2 border-sky-600 bg-sky-600 text-white dark:bg-sky-800 dark:border-sky-500",
		bodyClass: "bg-sky-50 dark:bg-sky-950/40",
		accent: "border-l-sky-300 dark:border-l-sky-500/45",
		badgeClass: "border-white/30 bg-white/20 text-white",
	},
	Completed: {
		title: "Completed",
		icon: CheckCircle,
		headerClass:
			"border-b-2 border-blue-800 bg-blue-800 text-white dark:bg-blue-950 dark:border-blue-700",
		bodyClass: "bg-blue-100/90 dark:bg-blue-950/50",
		accent: "border-l-blue-400 dark:border-l-blue-600/45",
		badgeClass: "border-white/30 bg-white/20 text-white",
	},
};

export const PhaseBoard = ({
	projectId,
	setIsTaskDetailOpen,
	setSelectedTask,
}: {
	projectId: string;
	setIsTaskDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedTask: React.Dispatch<React.SetStateAction<ITask | null>>;
}) => {
	const allPhases = usePhaseStore((state) => state.phases);

	const phases = useMemo(() => {
		return Object.values(allPhases)
			.filter((p) => p.projectId === projectId)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	}, [allPhases, projectId]);

	/** When true, this phase+column row is collapsed (default: expanded). */
	const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>(
		{},
	);

	const togglePhase = (phaseId: string, columnStatus: status) => {
		const uniqueKey = `${phaseId}-${columnStatus}`;
		setCollapsedPhases((prev) => ({
			...prev,
			[uniqueKey]: !prev[uniqueKey],
		}));
	};

	const phasesByStatus: Record<status, IPhase[]> = {
		Inactive: [],
		Pending: [],
		Active: [],
		Reviewing: [],
		Completed: [],
	};

	phases.forEach((phase) => {
		const raw = phase.status;
		const phaseStatusArray: status[] = Array.isArray(raw)
			? [...raw]
			: typeof raw === "string"
				? [raw as status]
				: ["Inactive"];

		const normalized =
			phaseStatusArray.length > 0 ? phaseStatusArray : (["Inactive"] as status[]);

		const seen = new Set<status>();
		normalized.forEach((s) => {
			if (seen.has(s)) return;
			seen.add(s);
			if (phasesByStatus[s]) {
				phasesByStatus[s].push(phase);
			} else {
				phasesByStatus.Inactive.push(phase);
			}
		});
	});

	const totalPhaseCount = phases.length;

	return (
		<TabsContent value="kanban" className="mt-0 space-y-4">
			{totalPhaseCount === 0 ? (
				<div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
					<LayoutGrid className="h-10 w-10 text-muted-foreground/60" />
					<p className="text-sm font-medium text-foreground">No phases yet</p>
					<p className="max-w-sm text-sm text-muted-foreground">
						Add phases when creating the project or from project setup. Phases
						and tasks will appear here.
					</p>
				</div>
			) : (
				<div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-gutter:stable] sm:gap-4">
					{STATUS_ORDER.map((columnStatus) => (
						<KanbanColumn
							key={columnStatus}
							columnStatus={columnStatus}
							meta={COLUMN_META[columnStatus]}
							phases={phasesByStatus[columnStatus]}
							collapsedPhases={collapsedPhases}
							togglePhase={togglePhase}
							setIsTaskDetailOpen={setIsTaskDetailOpen}
							setSelectedTask={setSelectedTask}
						/>
					))}
				</div>
			)}
		</TabsContent>
	);
};

const KanbanColumn = ({
	columnStatus,
	meta,
	phases,
	collapsedPhases,
	togglePhase,
	setIsTaskDetailOpen,
	setSelectedTask,
}: {
	columnStatus: status;
	meta: (typeof COLUMN_META)[status];
	phases: IPhase[];
	collapsedPhases: Record<string, boolean>;
	togglePhase: (phaseId: string, status: status) => void;
	setIsTaskDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedTask: React.Dispatch<React.SetStateAction<ITask | null>>;
}) => {
	const tasks = useTaskStore((state) => state.tasks);
	const Icon = meta.icon;

	const totalTasks = phases.reduce((acc, phase) => {
		const forPhase = Object.values(tasks).filter(
			(t) => t.phaseId === phase.id && t.status === columnStatus,
		);
		return acc + forPhase.length;
	}, 0);

	return (
		<div
			className={cn(
				"flex min-h-0 w-[min(100%,20rem)] shrink-0 flex-col self-stretch overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/30",
				/* Full-column tint: fills to bottom of row (items-stretch) and when a column is tall */
				meta.bodyClass,
			)}
		>
			<div
				className={cn(
					"flex shrink-0 items-center gap-2 px-3 py-2.5 sm:px-4",
					meta.headerClass,
				)}
			>
				<Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
				<h3 className="min-w-0 flex-1 text-sm font-semibold tracking-tight">
					{meta.title}
				</h3>
				<Badge
					variant="secondary"
					className={cn(
						"shrink-0 border tabular-nums text-xs font-semibold shadow-sm",
						meta.badgeClass,
					)}
				>
					{totalTasks}
				</Badge>
			</div>
			<div className="flex min-h-[min(24rem,50vh)] flex-1 flex-col gap-2.5 p-2.5 sm:min-h-[26rem] sm:p-3">
				{phases.length === 0 ? (
					<p className="py-8 text-center text-xs text-muted-foreground">
						No phases in this stage
					</p>
				) : (
					phases.map((phase) => (
						<PhaseCard
							key={`${phase.id}-${columnStatus}`}
							columnStatus={columnStatus}
							phase={phase}
							collapsedPhases={collapsedPhases}
							togglePhase={togglePhase}
							setIsTaskDetailOpen={setIsTaskDetailOpen}
							setSelectedTask={setSelectedTask}
							accentClass={meta.accent}
						/>
					))
				)}
			</div>
		</div>
	);
};

const PhaseCard = ({
	columnStatus,
	phase,
	collapsedPhases,
	togglePhase,
	setIsTaskDetailOpen,
	setSelectedTask,
	accentClass,
}: {
	columnStatus: status;
	phase: IPhase;
	collapsedPhases: Record<string, boolean>;
	togglePhase: (phaseId: string, status: status) => void;
	setIsTaskDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedTask: React.Dispatch<React.SetStateAction<ITask | null>>;
	accentClass: string;
}) => {
	const taskDict = useTaskStore((state) => state.tasks);

	const phaseTasks = useMemo(
		() => Object.values(taskDict).filter((t) => t.phaseId === phase.id),
		[taskDict, phase.id],
	);

	const columnTasks = useMemo(
		() => phaseTasks.filter((task) => task.status === columnStatus),
		[phaseTasks, columnStatus],
	);

	const uniqueKey = `${phase.id}-${columnStatus}`;
	// Default: expanded (tasks visible). Collapsed only when user toggled this key on.
	const isCollapsed = collapsedPhases[uniqueKey] === true;

	return (
		<div
			className={cn(
				"overflow-hidden rounded-lg border border-border/60 bg-background/90 shadow-sm ring-1 ring-border/25 dark:bg-background/80",
				"border-l-2",
				accentClass,
			)}
		>
			<button
				type="button"
				className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
				onClick={() => togglePhase(phase.id, columnStatus)}
			>
				<div className="flex min-w-0 items-center gap-2">
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
					) : (
						<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
					)}
					<h4 className="truncate text-sm font-medium">{phase.name}</h4>
				</div>
				<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
					{columnTasks.length}
				</span>
			</button>

			{!isCollapsed && (
				<div className="space-y-2 border-t border-border/40 px-2 pb-2 pt-2">
					{columnTasks.length === 0 ? (
						<p className="px-1 py-2 text-center text-xs text-muted-foreground">
							No tasks in this stage
						</p>
					) : (
						columnTasks.map((task) => (
							<TaskCard
								key={task.id}
								task={task}
								setIsTaskDetailOpen={setIsTaskDetailOpen}
								setSelectedTask={setSelectedTask}
							/>
						))
					)}
				</div>
			)}
		</div>
	);
};

const TaskCard = ({
	task,
	setIsTaskDetailOpen,
	setSelectedTask,
}: {
	task: ITask;
	setIsTaskDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedTask: React.Dispatch<React.SetStateAction<ITask | null>>;
}) => {
	const getTaskSurface = (): string => {
		switch (task.status) {
			case "Inactive":
				return "border-rose-400/60 bg-rose-100 hover:bg-rose-200/90 dark:border-rose-600 dark:bg-rose-950/50 dark:hover:bg-rose-900/65";
			case "Pending":
				return "border-orange-400/60 bg-orange-100 hover:bg-orange-200/80 dark:border-orange-600 dark:bg-orange-950/50 dark:hover:bg-orange-900/60";
			case "Active":
				return "border-blue-400/70 bg-blue-100 hover:bg-blue-200/80 dark:border-blue-600 dark:bg-blue-950/50 dark:hover:bg-blue-900/60";
			case "Reviewing":
				return "border-sky-400/70 bg-sky-100 hover:bg-sky-200/80 dark:border-sky-600 dark:bg-sky-950/50 dark:hover:bg-sky-900/60";
			case "Completed":
				return "border-blue-700/60 bg-blue-200/90 hover:bg-blue-200 dark:border-blue-800 dark:bg-blue-950/55 dark:hover:bg-blue-900/65";
			default:
				return "border-border/60 bg-card hover:bg-muted/40";
		}
	};

	const materials = getTaskMaterialsFromStore(task.id);
	const assigneeDetails = getAllProfilesFromStore().find(
		(profile) => profile.id === task.assignedTo,
	);

	return (
		<div
			role="button"
			tabIndex={0}
			className={cn(
				"cursor-pointer rounded-lg border p-3 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				getTaskSurface(),
			)}
			onClick={() => {
				setSelectedTask(task);
				setIsTaskDetailOpen(true);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					setSelectedTask(task);
					setIsTaskDetailOpen(true);
				}
			}}
		>
			<div className="mb-1.5 flex items-start justify-between gap-2">
				<h4 className="line-clamp-2 text-sm font-medium leading-snug">
					{task.name}
				</h4>
				{task.estimatedDuration != null && (
					<span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
						{task.estimatedDuration}d
					</span>
				)}
			</div>

			{task.description ? (
				<p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
					{task.description}
				</p>
			) : null}

			<div className="space-y-1.5">
				{materials.length > 0 && (
					<div className="flex items-center gap-1 text-[11px] text-muted-foreground">
						<Package className="h-3 w-3 shrink-0" />
						{materials.length} material{materials.length !== 1 ? "s" : ""}
					</div>
				)}

				{task.assignedTo && (
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarFallback className="text-[10px]">
								{assigneeDetails?.name
									? assigneeDetails.name[0]
									: task.assignedTo[0]}
							</AvatarFallback>
						</Avatar>
						<span className="truncate text-xs text-muted-foreground">
							{assigneeDetails?.name || task.assignedTo}
						</span>
					</div>
				)}

				{task.status !== "Inactive" && task.status !== "Pending" && (
					<div className="flex items-center gap-1 text-[11px] text-muted-foreground">
						<Calendar className="h-3 w-3 shrink-0" />
						{task.estimatedDuration
							? formatCalendarDate(
									new Date(
										Date.now() +
											task.estimatedDuration * 24 * 60 * 60 * 1000,
									),
								)
							: "No due date"}
					</div>
				)}
			</div>
		</div>
	);
};
