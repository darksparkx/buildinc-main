"use client";

import { PageBreadcrumbs } from "@/components/base/general/PageBreadcrumbs";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import AssignTaskModal from "@/components/projectDetails/Modals/AssignTaskModal";
import { Badge } from "@/components/base/ui/badge";
import { Button } from "@/components/base/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/base/ui/tabs";
import { taskStatusBadgeVariant } from "@/lib/functions/taskStatusUi";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { RupeeIcon, cn } from "@/lib/functions/utils";
import { markMentionNotificationsReadForTask } from "@/lib/middleware/commentMentions";
import {
	getTaskMaterials,
	getTaskMaterialsFromStore,
} from "@/lib/middleware/materials";
import { getPhase } from "@/lib/middleware/phases";
import { getProjectMembersByProjectId } from "@/lib/middleware/projectMembers";
import { getProject } from "@/lib/middleware/projects";
import { getTask } from "@/lib/middleware/tasks";
import { useUrlQueryTab } from "@/lib/hooks/useUrlQueryTab";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useProfileStore } from "@/lib/store/profileStore";
import { useprojectDetailStore } from "@/lib/store/projectDetailStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { IProject, IProjectProfile, ITask } from "@/lib/types";
import {
	ArrowLeft,
	Banknote,
	Calendar,
	CheckCircle,
	ChevronRight,
	CircleDot,
	Package,
	FolderKanban,
	LayoutList,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import CompleteModal from "./modals/CompleteModal";
import MaterialModal from "./modals/MaterialModal";
import PaymentModal from "./modals/PaymentModal";
import { TaskCommentsSection } from "./TaskCommentsSection";
import TaskDetails from "./TaskDetails";
import TaskMaterials from "./TaskMaterials";

const panel =
	"rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_0_0_hsl(var(--border)_/_0.35)] backdrop-blur-sm dark:border-border dark:bg-card/85 dark:shadow-[0_1px_0_0_hsl(var(--border)_/_0.2)]";

const kicker =
	"text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export default function TaskPageClient() {
	return (
		<Suspense fallback={<LoadingSpinner />}>
			<TaskPageContent />
		</Suspense>
	);
}

function TaskPageContent() {
	const params = useParams();
	const router = useRouter();
	const taskId = typeof params.taskId === "string" ? params.taskId : "";

	const profile = useProfileStore((s) => s.profile);
	const ownerShell = useUsesOwnerShell(profile);
	const updateprojectDetails = useprojectDetailStore(
		(s) => s.updateprojectDetails,
	);

	const task = useTaskStore((s) => (taskId ? s.tasks[taskId] : undefined));

	const [ready, setReady] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [project, setProject] = useState<IProject | null>(null);
	const [members, setMembers] = useState<IProjectProfile[]>([]);
	const [phaseName, setPhaseName] = useState<string>("");

	const [isAssignOpen, setIsAssignOpen] = useState(false);
	const [isPaymentOpen, setIsPaymentOpen] = useState(false);
	const [isMaterialOpen, setIsMaterialOpen] = useState(false);
	const [isCompleteOpen, setIsCompleteOpen] = useState(false);

	useEffect(() => {
		if (!taskId || !profile?.id) return;

		let cancelled = false;
		(async () => {
			setLoadError(null);
			setReady(false);
			try {
				const t = await getTask(taskId);
				if (cancelled) return;
				const [phase, proj, mem, _loadedMaterials] = await Promise.all([
					getPhase(t.phaseId),
					getProject(t.projectId),
					getProjectMembersByProjectId(t.projectId),
					getTaskMaterials(taskId),
				]);
				if (cancelled) return;
				setPhaseName(phase?.name?.trim() ?? "");
				setProject(proj);
				setMembers(mem);
				try {
					await markMentionNotificationsReadForTask(profile.id, taskId);
				} catch (e) {
					console.warn("[TaskPage] mark mentions read:", e);
				}
			} catch (e) {
				console.error(e);
				if (!cancelled) setLoadError("We could not load this task.");
			} finally {
				if (!cancelled) setReady(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [taskId, profile?.id]);

	const materials = useMemo(
		() => (taskId ? getTaskMaterialsFromStore(taskId) : []),
		[taskId, ready],
	);

	const [urlOverviewTab, setOverviewTab] = useUrlQueryTab(
		["details", "materials"] as const,
		"details",
	);
	const overviewTab =
		urlOverviewTab === "materials" && materials.length === 0
			? "details"
			: urlOverviewTab;

	const selectedTask: ITask | undefined = task;

	const crumbItems = useMemo(() => {
		if (!selectedTask || !project) {
			return [] as { label: string; href?: string }[];
		}
		const projLabel =
			project.name?.trim() ||
			selectedTask.projectName?.trim() ||
			"Project";
		const list: { label: string; href?: string }[] = ownerShell
			? [
					{ label: "Projects", href: "/projects" },
					{
						label: projLabel,
						href: `/projects/${selectedTask.projectId}`,
					},
				]
			: [
					{ label: "Workspace", href: "/workspace" },
					{ label: projLabel },
				];
		if (phaseName) list.push({ label: phaseName });
		list.push({ label: selectedTask.name });
		return list;
	}, [selectedTask, project, phaseName, ownerShell]);

	if (!profile?.id) {
		return <LoadingSpinner />;
	}

	if (loadError || (ready && !selectedTask)) {
		return (
			<div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-5 px-4 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/30">
					<LayoutList className="h-7 w-7 text-muted-foreground" aria-hidden />
				</div>
				<p className="text-muted-foreground">
					{loadError ?? "Task not found or you do not have access."}
				</p>
				<Button type="button" variant="secondary" className="rounded-xl" asChild>
					<Link href="/tasks">Back to tasks</Link>
				</Button>
			</div>
		);
	}

	if (!ready || !selectedTask || !project) {
		return <LoadingSpinner />;
	}

	const projectHref = ownerShell
		? `/projects/${selectedTask.projectId}`
		: undefined;
	const startLabel = selectedTask.startDate
		? formatCalendarDate(selectedTask.startDate)
		: null;
	const dueLabel = selectedTask.endDate
		? formatCalendarDate(selectedTask.endDate)
		: null;

	const tabListClass =
		"flex h-auto w-full gap-2 rounded-xl border border-border/60 bg-muted/35 p-2 dark:bg-muted/20";
	const tabTriggerClass =
		"min-w-0 flex-1 justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border/60 dark:data-[state=active]:bg-secondary dark:data-[state=active]:ring-border/50";

	const estDays = selectedTask.estimatedDuration ?? 0;
	const planned = (selectedTask.plannedBudget ?? 0).toFixed(2);
	const spent = (selectedTask.spent ?? 0).toFixed(2);
	const displayProjectName =
		project.name?.trim() ||
		selectedTask.projectName?.trim() ||
		"Project";

	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden bg-background">
			<div
				className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_-15%,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(ellipse_70%_45%_at_100%_0%,hsl(var(--primary)/0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_100%_55%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_50%),radial-gradient(ellipse_55%_40%_at_100%_-5%,hsl(var(--primary)/0.06),transparent_45%)]"
				aria-hidden
			/>

			<div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-5 sm:px-6 sm:pb-24 sm:pt-7 lg:px-10">
				<div className="mb-4 space-y-3 sm:mb-6">
					<button
						type="button"
						onClick={() => router.push("/tasks")}
						className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-border hover:text-foreground"
					>
						<ArrowLeft
							className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
							aria-hidden
						/>
						Tasks
					</button>
					<PageBreadcrumbs
						items={crumbItems}
						listClassName="!text-xs sm:!text-sm"
					/>
				</div>

				<header
					className={cn(
						panel,
						"relative mb-10 overflow-hidden",
					)}
				>
					<div
						className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary/25 via-primary to-primary/40"
						aria-hidden
					/>
					<div className="relative space-y-6 p-6 sm:p-8 lg:p-10">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
							<div className="min-w-0 flex-1 space-y-4">
								<div className="flex flex-wrap items-center gap-2">
									<Badge
										variant={taskStatusBadgeVariant(selectedTask.status)}
										className="rounded-lg px-2.5 py-0.5 text-xs font-semibold capitalize shadow-sm"
									>
										{selectedTask.status}
									</Badge>
									{phaseName ? (
										<span
											className={cn(
												"inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground/90",
											)}
										>
											<CircleDot
												className="h-3 w-3 text-primary"
												aria-hidden
											/>
											{phaseName}
										</span>
									) : null}
								</div>
								<h1 className="text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem] lg:leading-[1.12]">
									{selectedTask.name}
								</h1>
								{ownerShell ? (
									<Link
										href={projectHref!}
										className="group inline-flex max-w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5 transition-colors hover:border-primary/35 hover:bg-primary/[0.07] sm:inline-flex sm:w-fit dark:hover:bg-primary/10"
									>
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
											<FolderKanban className="h-4 w-4" aria-hidden />
										</span>
										<span className="min-w-0 text-left">
											<span className={cn(kicker, "block")}>Project</span>
											<span className="flex items-center gap-1 font-semibold text-foreground underline decoration-border/70 decoration-1 underline-offset-2 group-hover:decoration-primary/50">
												<span className="truncate">{displayProjectName}</span>
												<ChevronRight
													className="h-4 w-4 shrink-0 opacity-50"
													aria-hidden
												/>
											</span>
										</span>
									</Link>
								) : (
									<div className="inline-flex max-w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5 sm:inline-flex sm:w-fit">
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20 dark:bg-primary/20">
											<FolderKanban className="h-4 w-4" aria-hidden />
										</span>
										<span className="min-w-0 text-left">
											<span className={cn(kicker, "block")}>Project</span>
											<span className="truncate font-semibold text-foreground">
												{displayProjectName}
											</span>
										</span>
									</div>
								)}
							</div>

							{(startLabel || dueLabel) && (
								<div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
									{startLabel ? (
										<div className="flex min-w-[10.5rem] items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3 dark:bg-background/40">
											<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
												<Calendar className="h-4 w-4" aria-hidden />
											</span>
											<div>
												<p className={kicker}>Start</p>
												<p className="text-sm font-semibold tabular-nums text-foreground">
													{startLabel}
												</p>
											</div>
										</div>
									) : null}
									{dueLabel ? (
										<div className="flex min-w-[10.5rem] items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3 dark:bg-background/40">
											<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
												<Calendar className="h-4 w-4" aria-hidden />
											</span>
											<div>
												<p className={kicker}>Due</p>
												<p className="text-sm font-semibold tabular-nums text-foreground">
													{dueLabel}
												</p>
											</div>
										</div>
									) : null}
								</div>
							)}
						</div>
					</div>
				</header>

				<div
					className={cn(
						"grid gap-10 xl:gap-12",
						"[grid-template-areas:'task-overview'_'task-sidebar'_'task-comments']",
						"lg:grid-cols-[minmax(0,1fr)_18.5rem] xl:grid-cols-[minmax(0,1fr)_20rem]",
						"lg:[grid-template-areas:'task-overview_task-sidebar'_'task-comments_task-sidebar']",
					)}
				>
					<section
						className={cn(panel, "min-w-0 overflow-hidden [grid-area:task-overview]")}
					>
						<Tabs
							value={overviewTab}
							onValueChange={setOverviewTab}
							className="w-full gap-0"
						>
							<div className="border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-6 dark:bg-muted/10">
								<TabsList className={tabListClass}>
									<TabsTrigger value="details" className={tabTriggerClass}>
										Overview
									</TabsTrigger>
									{materials.length > 0 ? (
										<TabsTrigger value="materials" className={tabTriggerClass}>
											Materials
											<Badge
												variant="secondary"
												className="ml-1 rounded-md px-1.5 py-px text-[10px] font-semibold tabular-nums opacity-90"
											>
												{materials.length}
											</Badge>
										</TabsTrigger>
									) : null}
								</TabsList>
							</div>
							<div className="px-5 py-8 sm:px-8 sm:py-10">
								<TabsContent value="details" className="m-0 outline-none">
									<TaskDetails
										selectedTask={selectedTask}
										projectName={displayProjectName}
										projectHref={projectHref}
										phaseName={phaseName || undefined}
										presentation="page"
										omitProjectContext
									/>
								</TabsContent>
								{materials.length > 0 ? (
									<TabsContent value="materials" className="m-0 outline-none">
										<TaskMaterials
											materials={materials}
											presentation="page"
										/>
									</TabsContent>
								) : null}
							</div>
						</Tabs>
					</section>

					<aside
						className={cn(
							"min-w-0 space-y-5 [grid-area:task-sidebar]",
							"lg:sticky lg:top-20 lg:self-start",
						)}
					>
						<div className={cn(panel, "p-5 sm:p-6")}>
							<ul className="space-y-3">
								<li className="flex items-center justify-between gap-3 rounded-xl bg-muted/35 px-3 py-2.5 dark:bg-muted/20">
									<span className="text-xs font-medium text-muted-foreground">
										Duration
									</span>
									<span className="text-sm font-semibold tabular-nums">
										{estDays}{" "}
										<span className="font-normal text-muted-foreground">
											days
										</span>
									</span>
								</li>
								<li className="flex items-center justify-between gap-3 rounded-xl bg-muted/35 px-3 py-2.5 dark:bg-muted/20">
									<span className="text-xs font-medium text-muted-foreground">
										Planned budget
									</span>
									<span className="text-sm font-semibold tabular-nums">
										{planned} <RupeeIcon />
									</span>
								</li>
								<li className="flex items-center justify-between gap-3 rounded-xl bg-muted/35 px-3 py-2.5 dark:bg-muted/20">
									<span className="text-xs font-medium text-muted-foreground">
										Spent
									</span>
									<span className="text-sm font-semibold tabular-nums">
										{spent} <RupeeIcon />
									</span>
								</li>
							</ul>
						</div>

						{selectedTask.status === "Inactive" ? (
							<div
								className={cn(
									panel,
									"border-l-[3px] border-l-amber-500/80 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5 dark:border-l-amber-400/60 dark:from-amber-500/10",
								)}
							>
								<div className="flex items-start gap-3">
									<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300">
										<UserPlus className="h-5 w-5" aria-hidden />
									</span>
									<div className="min-w-0 space-y-1">
										<h3 className="text-sm font-semibold text-foreground">
											Needs assignment
										</h3>
										<p className="text-xs leading-relaxed text-muted-foreground">
											Request someone on the project to pick up this task.
										</p>
									</div>
								</div>
								<Button
									type="button"
									variant="secondary"
									className="mt-4 h-10 w-full rounded-xl font-medium"
									onClick={() => setIsAssignOpen(true)}
								>
									Assign task
								</Button>
							</div>
						) : null}

						{selectedTask.status === "Active" ? (
							<div className={cn(panel, "overflow-hidden p-0")}>
								<div className="border-b border-border/60 bg-muted/25 px-5 py-4 dark:bg-muted/15">
									<h2 className={kicker}>Actions</h2>
								</div>
								<div className="flex flex-col gap-2 p-5 sm:p-6">
									<Button
										type="button"
										className="h-11 w-full justify-center gap-2 rounded-xl border border-emerald-800/25 bg-emerald-800 font-semibold text-white shadow-md shadow-emerald-950/20 hover:bg-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-700 dark:hover:bg-emerald-600"
										onClick={() => setIsCompleteOpen(true)}
									>
										<CheckCircle className="h-4 w-4" aria-hidden />
										Mark complete
									</Button>
									<Button
										type="button"
										variant="outline"
										className="h-10 w-full justify-center gap-2 rounded-xl border-border/80 bg-background font-medium"
										onClick={() => setIsPaymentOpen(true)}
									>
										<Banknote
											className="h-4 w-4 text-muted-foreground"
											aria-hidden
										/>
										Request payment
									</Button>
									{materials.length > 0 ? (
										<Button
											type="button"
											variant="outline"
											className="h-10 w-full justify-center gap-2 rounded-xl border-border/80 bg-background font-medium"
											onClick={() => setIsMaterialOpen(true)}
										>
											<Package
												className="h-4 w-4 text-muted-foreground"
												aria-hidden
											/>
											Request material
										</Button>
									) : null}
								</div>
							</div>
						) : null}
					</aside>

					<div className="min-w-0 [grid-area:task-comments]">
						<TaskCommentsSection
							taskId={selectedTask.id}
							authorId={profile.id}
							projectMembers={members}
						/>
					</div>
				</div>
			</div>

			<AssignTaskModal
				isAssignTaskOpen={isAssignOpen}
				setIsAssignTaskOpen={setIsAssignOpen}
				selectedTask={selectedTask}
				teamMembers={members}
				projectData={project}
				updateprojectDetails={updateprojectDetails}
				currentUserId={profile.id}
			/>
			<PaymentModal
				isPaymentModalOpen={isPaymentOpen}
				setIsPaymentModalOpen={setIsPaymentOpen}
				selectedTask={selectedTask}
			/>
			<MaterialModal
				isMaterialModalOpen={isMaterialOpen}
				setIsMaterialModalOpen={setIsMaterialOpen}
				selectedTask={selectedTask}
			/>
			<CompleteModal
				isCompleteModalOpen={isCompleteOpen}
				setIsCompleteModalOpen={setIsCompleteOpen}
				selectedTask={selectedTask}
			/>
		</div>
	);
}
