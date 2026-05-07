import { Avatar, AvatarFallback } from "@/components/base/ui/avatar";
import { Badge } from "@/components/base/ui/badge";
import { Label } from "@/components/base/ui/label";
import { Separator } from "@/components/base/ui/separator";
import { TabsContent } from "@/components/base/ui/tabs";
import { taskStatusBadgeVariant } from "@/lib/functions/taskStatusUi";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { cn, RupeeIcon } from "@/lib/functions/utils";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { ITask } from "@/lib/types";
import Link from "next/link";
import React from "react";

const linkClass =
	"text-sm font-medium text-foreground underline decoration-border/80 decoration-1 underline-offset-4 hover:decoration-foreground/50";

const k = "text-xs font-medium text-muted-foreground";
const v = "text-sm text-foreground tabular-nums";

const PageSection = ({
	title,
	children,
	className,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
}) => (
	<div className={cn("space-y-4", className)}>
		<h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
			{title}
		</h3>
		{children}
	</div>
);

const detailInnerSheet = (
	selectedTask: ITask,
	projectName: string,
	projectHref: string | undefined,
	phaseName: string | undefined,
	omitProjectContext: boolean,
) => {
	const assignee = selectedTask.assignedTo
		? getAllProfilesFromStore().find((p) => p.id === selectedTask.assignedTo)
		: undefined;
	const approver = selectedTask.approvedBy
		? getAllProfilesFromStore().find((p) => p.id === selectedTask.approvedBy)
		: undefined;
	const approvedLabel =
		approver?.name?.trim() ||
		selectedTask.approvedBy?.trim() ||
		(selectedTask.approvedBy ? "—" : "");

	const labelClass = "text-sm font-medium text-muted-foreground";

	return (
		<>
			<div className="space-y-2">
				<Label className={labelClass}>Description</Label>
				<p className="text-sm leading-relaxed text-foreground/95">
					{selectedTask.description?.trim()
						? selectedTask.description
						: "No description."}
				</p>
			</div>

			{selectedTask.assignedTo ? (
				<div className="space-y-2">
					<Label className={labelClass}>Assigned to</Label>
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8">
							<AvatarFallback className="text-xs">
								{assignee?.name?.[0] ?? "?"}
							</AvatarFallback>
						</Avatar>
						<span className="text-sm font-medium">
							{assignee?.name ?? "Unknown"}
						</span>
					</div>
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{!omitProjectContext ? (
					<div className="space-y-1.5">
						<Label className={labelClass}>Project</Label>
						{projectHref ? (
							<Link href={projectHref} className={linkClass}>
								{projectName || "—"}
							</Link>
						) : (
							<p className="text-sm font-medium">{projectName || "—"}</p>
						)}
					</div>
				) : null}

				{!omitProjectContext && phaseName ? (
					<div className="space-y-1.5">
						<Label className={labelClass}>Phase</Label>
						<p className="text-sm font-medium">{phaseName}</p>
					</div>
				) : null}

				<div className="space-y-1.5">
					<Label className={labelClass}>Status</Label>
					<div>
						<Badge
							variant={taskStatusBadgeVariant(selectedTask.status)}
							className="capitalize"
						>
							{selectedTask.status}
						</Badge>
					</div>
				</div>

				<div className="space-y-1.5">
					<Label className={labelClass}>Start date</Label>
					<p className={v}>
						{selectedTask.startDate
							? formatCalendarDate(selectedTask.startDate)
							: "—"}
					</p>
				</div>

				<div className="space-y-1.5">
					<Label className={labelClass}>Due date</Label>
					<p className={v}>
						{selectedTask.endDate
							? formatCalendarDate(selectedTask.endDate)
							: "—"}
					</p>
				</div>

				<div className="space-y-1.5">
					<Label className={labelClass}>Planned budget</Label>
					<p className={v}>
						{(selectedTask.plannedBudget ?? 0).toFixed(2)} <RupeeIcon />
					</p>
				</div>

				<div className="space-y-1.5 sm:col-span-2">
					<Label className={labelClass}>Spent</Label>
					<p className={v}>
						{(selectedTask.spent ?? 0).toFixed(2)} <RupeeIcon />
					</p>
				</div>
			</div>

			{selectedTask.rejectionReason?.trim() ? (
				<div className="space-y-2">
					<Label className={labelClass}>Rejection reason</Label>
					<p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
						{selectedTask.rejectionReason}
					</p>
				</div>
			) : null}

			{selectedTask.completionNotes ? (
				<div className="space-y-2">
					<Label className={labelClass}>Completion notes</Label>
					<p className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
						{selectedTask.completionNotes}
					</p>
				</div>
			) : null}

			{selectedTask.approvedBy ? (
				<div className="space-y-1.5">
					<Label className={labelClass}>Approved by</Label>
					<p className="text-sm">
						{approvedLabel}
						{selectedTask.completedDate
							? ` · ${formatCalendarDate(selectedTask.completedDate)}`
							: ""}
					</p>
				</div>
			) : null}
		</>
	);
};

const detailInnerPage = (
	selectedTask: ITask,
	projectName: string,
	projectHref: string | undefined,
	phaseName: string | undefined,
	omitProjectContext: boolean,
) => {
	const assignee = selectedTask.assignedTo
		? getAllProfilesFromStore().find((p) => p.id === selectedTask.assignedTo)
		: undefined;
	const approver = selectedTask.approvedBy
		? getAllProfilesFromStore().find((p) => p.id === selectedTask.approvedBy)
		: undefined;
	const approvedLabel =
		approver?.name?.trim() ||
		selectedTask.approvedBy?.trim() ||
		(selectedTask.approvedBy ? "—" : "");

	const hasPeople = Boolean(selectedTask.assignedTo);
	const showProjectBlock =
		!omitProjectContext && (projectName || phaseName || projectHref);

	return (
		<div className="space-y-10">
			<PageSection title="About">
				<div className="rounded-lg border border-border/60 bg-muted/25 px-4 py-4 text-sm leading-relaxed text-foreground/95 dark:bg-muted/15">
					{selectedTask.description?.trim()
						? selectedTask.description
						: "No description provided."}
				</div>
			</PageSection>

			{hasPeople ? (
				<>
					<Separator className="opacity-70" />
					<PageSection title="People">
						<div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 px-4 py-3">
							<Avatar className="h-9 w-9">
								<AvatarFallback className="text-xs font-medium">
									{assignee?.name?.[0] ?? "?"}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="text-xs text-muted-foreground">Assigned to</p>
								<p className="text-sm font-medium text-foreground">
									{assignee?.name ?? "Unknown"}
								</p>
							</div>
						</div>
					</PageSection>
				</>
			) : null}

			{showProjectBlock ? (
				<>
					<Separator className="opacity-70" />
					<PageSection title="Project context">
						<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-1">
								<dt className={k}>Project</dt>
								<dd>
									{projectHref ? (
										<Link href={projectHref} className={linkClass}>
											{projectName || "—"}
										</Link>
									) : (
										<span className="text-sm font-medium">{projectName || "—"}</span>
									)}
								</dd>
							</div>
							{phaseName ? (
								<div className="space-y-1">
									<dt className={k}>Phase</dt>
									<dd className="text-sm font-medium">{phaseName}</dd>
								</div>
							) : null}
							<div className="space-y-1">
								<dt className={k}>Status</dt>
								<dd>
									<Badge
										variant={taskStatusBadgeVariant(selectedTask.status)}
										className="rounded-md capitalize"
									>
										{selectedTask.status}
									</Badge>
								</dd>
							</div>
						</dl>
					</PageSection>
				</>
			) : null}

			{selectedTask.rejectionReason?.trim() ? (
				<>
					<Separator className="opacity-70" />
					<PageSection title="Rejection">
						<p className="rounded-lg border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm leading-relaxed dark:bg-destructive/10">
							{selectedTask.rejectionReason}
						</p>
					</PageSection>
				</>
			) : null}

			{selectedTask.completionNotes || selectedTask.approvedBy ? (
				<>
					<Separator className="opacity-70" />
					<PageSection title="Completion">
						<div className="space-y-4">
							{selectedTask.completionNotes ? (
								<div className="space-y-1">
									<p className={k}>Notes</p>
									<p className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed dark:bg-muted/15">
										{selectedTask.completionNotes}
									</p>
								</div>
							) : null}
							{selectedTask.approvedBy ? (
								<div className="space-y-1">
									<p className={k}>Approved by</p>
									<p className="text-sm text-foreground">
										{approvedLabel}
										{selectedTask.completedDate
											? ` · ${formatCalendarDate(selectedTask.completedDate)}`
											: ""}
									</p>
								</div>
							) : null}
						</div>
					</PageSection>
				</>
			) : null}
		</div>
	);
};

const TaskDetails = ({
	selectedTask,
	projectName,
	projectHref,
	phaseName,
	asStandalone = false,
	presentation = "sheet",
	omitProjectContext = false,
}: {
	selectedTask: ITask;
	projectName: string;
	projectHref?: string;
	phaseName?: string;
	asStandalone?: boolean;
	presentation?: "sheet" | "page";
	omitProjectContext?: boolean;
}) => {
	const inner =
		presentation === "page"
			? detailInnerPage(
					selectedTask,
					projectName,
					projectHref,
					phaseName,
					omitProjectContext,
				)
			: detailInnerSheet(
					selectedTask,
					projectName,
					projectHref,
					phaseName,
					omitProjectContext,
				);

	if (presentation === "page") {
		return <div className="outline-none">{inner}</div>;
	}

	if (asStandalone) {
		return <div className="mt-0 space-y-5">{inner}</div>;
	}

	return (
		<TabsContent value="details" className="mt-0 space-y-5 outline-none">
			{inner}
		</TabsContent>
	);
};

export default TaskDetails;
