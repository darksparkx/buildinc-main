import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Progress } from "@/components/base/ui/progress";
import { Separator } from "@/components/base/ui/separator";
import { TabsContent } from "@/components/base/ui/tabs";
import { Badge } from "@/components/base/ui/badge";
import { formatDate, RupeeIcon } from "@/lib/functions/utils";
import { getProjectMembersByProjectIdFromStore } from "@/lib/middleware/projectMembers";
import { IProject, ITask } from "@/lib/types";
import {
	CalendarRange,
	FileText,
	FolderOpen,
	MapPin,
	Percent,
	UserCircle,
	Wallet,
} from "lucide-react";
import { ProjectLinkedTasks } from "./ProjectLinkedTasks";

function statusVariant(
	status: string | undefined
):
	| "active"
	| "reviewing"
	| "inactive"
	| "pending"
	| "completed"
	| "secondary" {
	if (!status) return "secondary";
	const s = status.toLowerCase();
	if (
		s === "active" ||
		s === "reviewing" ||
		s === "inactive" ||
		s === "pending" ||
		s === "completed"
	) {
		return s;
	}
	return "secondary";
}

export const Overview = ({
	projectData,
	organisationName,
	onSelectTask,
	onViewBoard,
}: {
	projectData: IProject;
	organisationName?: string;
	onSelectTask: (task: ITask) => void;
	onViewBoard: () => void;
}) => {
	const supervisor = getProjectMembersByProjectIdFromStore(
		projectData.id
	).find((m) => m.memberInfo?.role === "Supervisor");
	const supervisorName = supervisor?.name || "Not assigned";

	const budget = projectData.budget ?? 0;
	const spent = projectData.spent ?? 0;
	const budgetUsed =
		budget > 0 ? Math.round((spent / budget) * 100) : 0;
	const progress = Number.isFinite(projectData.progress)
		? projectData.progress
		: 0;
	const totalTasks = projectData.totalTasks ?? 0;
	const completedTasks = projectData.completedTasks ?? 0;

	const startLabel = projectData.startDate
		? formatDate(projectData.startDate)
		: "—";
	const endLabel = projectData.endDate
		? formatDate(projectData.endDate)
		: "—";

	return (
		<TabsContent value="overview" className="mt-0 space-y-4">
			<div className="grid gap-4 lg:grid-cols-2">
				<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
					<CardHeader className="space-y-1 pb-4">
						<div className="flex items-center gap-2">
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
								<FolderOpen className="h-4 w-4" aria-hidden />
							</span>
							<div>
								<CardTitle className="text-lg sm:text-xl">
									Project information
								</CardTitle>
								<CardDescription>
									Details and schedule for this project
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
							<Badge variant={statusVariant(projectData.status)}>
								{projectData.status}
							</Badge>
							<span className="text-sm text-muted-foreground">
								{projectData.category}
							</span>
						</div>

						{organisationName ? (
							<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
								<span className="text-sm font-medium text-muted-foreground">
									Organisation
								</span>
								<span className="min-w-0 flex-1 font-medium sm:text-left">
									{organisationName}
								</span>
							</div>
						) : null}

						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0">
									<span className="text-sm font-medium text-muted-foreground">
										Description
									</span>
									<p className="mt-1 text-sm leading-relaxed">
										{projectData.description?.trim()
											? projectData.description
											: "No description provided."}
									</p>
								</div>
							</div>
						</div>

						<div className="flex items-start gap-2 text-sm">
							<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<span className="text-muted-foreground">Location</span>
								<p className="font-medium">
									{projectData.location?.trim()
										? projectData.location
										: "—"}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2 text-sm">
							<UserCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
							<div>
								<span className="text-muted-foreground">
									Project supervisor
								</span>
								<p className="font-medium">{supervisorName}</p>
							</div>
						</div>

						<div className="flex items-center gap-2 text-sm">
							<CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">Start</span>
							<span className="font-medium tabular-nums">{startLabel}</span>
							<span className="text-muted-foreground">·</span>
							<span className="text-muted-foreground">End</span>
							<span className="font-medium tabular-nums">{endLabel}</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
					<CardHeader className="space-y-1 pb-4">
						<div className="flex items-center gap-2">
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400">
								<Wallet className="h-4 w-4" aria-hidden />
							</span>
							<div>
								<CardTitle className="text-lg sm:text-xl">
									Progress & budget
								</CardTitle>
								<CardDescription>
									Completion and spend vs budget
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between gap-4 text-sm">
							<span className="text-muted-foreground">Budget</span>
							<span className="font-semibold tabular-nums">
								{budget.toLocaleString("en-IN")}
								<RupeeIcon />
							</span>
						</div>
						<div className="flex items-center justify-between gap-4 text-sm">
							<span className="text-muted-foreground">Spent</span>
							<span className="font-semibold tabular-nums">
								{spent.toLocaleString("en-IN")}
								<RupeeIcon />
							</span>
						</div>
						<div className="flex items-center justify-between gap-4 text-sm">
							<span className="text-muted-foreground">Remaining</span>
							<span className="font-semibold tabular-nums">
								{Math.max(0, budget - spent).toLocaleString("en-IN")}
								<RupeeIcon />
							</span>
						</div>

						<Separator className="bg-border/60" />

						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="inline-flex items-center gap-1.5 text-muted-foreground">
									<Percent className="h-3.5 w-3.5" aria-hidden />
									Overall progress
								</span>
								<span className="tabular-nums font-medium">
									{Math.round(progress)}%
								</span>
							</div>
							<p className="text-xs text-muted-foreground tabular-nums">
								{completedTasks} of {totalTasks} tasks complete
							</p>
							<Progress
								value={Math.min(100, Math.max(0, progress))}
								className="h-2.5 bg-muted"
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Budget used</span>
								<span className="tabular-nums font-medium">{budgetUsed}%</span>
							</div>
							<Progress
								value={Math.min(100, Math.max(0, budgetUsed))}
								className="h-2.5 bg-muted"
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<ProjectLinkedTasks
				project={projectData}
				onSelectTask={onSelectTask}
				onViewBoard={onViewBoard}
			/>
		</TabsContent>
	);
};
