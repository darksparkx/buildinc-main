"use client";

import { PageBreadcrumbs } from "@/components/base/general/PageBreadcrumbs";
import { TabsTriggerList } from "@/components/base/general/TabsTriggerList";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { Badge } from "@/components/base/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Tabs } from "@/components/base/ui/tabs";
import { canViewProjectFinancials } from "@/lib/permissions/canViewProjectFinancials";
import { RupeeIcon } from "@/lib/functions/utils";
import { getOrganisationMembersFromStore } from "@/lib/middleware/organisationMembers";
import { getProjectMembersByProjectIdFromStore } from "@/lib/middleware/projectMembers";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useprojectDetailStore } from "@/lib/store/projectDetailStore";
import {
	IOrganisation,
	IProject,
	IProjectProfile,
	ITask,
} from "@/lib/types";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useUrlQueryTab } from "@/lib/hooks/useUrlQueryTab";
import { FolderOpen, IndianRupee, Percent, Users } from "lucide-react";
import {
	Suspense,
	useState,
	type Dispatch,
	type SetStateAction,
} from "react";
import { Members } from "./Members";
import AssignTaskModal from "./Modals/AssignTaskModal";
import ChangeRoleModal from "./Modals/ChangeUserModal";
import TaskDetailModal from "./Modals/TaskDetailModal";
import { Overview } from "./Overview";
import { PhaseBoard } from "./PhaseBoard";
import { ProjectSettings } from "./ProjectSettings";
import { ProjectStatistics } from "./ProjectStatistics";

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

const PROJECT_WORKSPACE_TABS_BASE = [
	"kanban",
	"overview",
	"team",
	"settings",
] as const;

const PROJECT_WORKSPACE_TABS_WITH_STATS = [
	"kanban",
	"overview",
	"statistics",
	"team",
	"settings",
] as const;

function ProjectWorkspace({
	projectData,
	organisation,
	teamMembers,
	organisationMembers,
	setChangeRole,
	setChangeRoleModal,
	setChangeRoleUser,
	setChangeRoleId,
	setChangeRoleCanSeeBudget,
	setIsTaskDetailOpen,
	setSelectedTask,
	showStatisticsTab,
}: {
	projectData: IProject;
	organisation: IOrganisation | undefined;
	teamMembers: IProjectProfile[] | undefined;
	organisationMembers: ReturnType<typeof getOrganisationMembersFromStore>;
	setChangeRole: Dispatch<SetStateAction<string>>;
	setChangeRoleModal: Dispatch<SetStateAction<boolean>>;
	setChangeRoleUser: Dispatch<SetStateAction<string>>;
	setChangeRoleId: Dispatch<SetStateAction<string>>;
	setChangeRoleCanSeeBudget: Dispatch<SetStateAction<boolean>>;
	setIsTaskDetailOpen: Dispatch<SetStateAction<boolean>>;
	setSelectedTask: Dispatch<SetStateAction<ITask | null>>;
	showStatisticsTab: boolean;
}) {
	const tabIds = showStatisticsTab
		? PROJECT_WORKSPACE_TABS_WITH_STATS
		: PROJECT_WORKSPACE_TABS_BASE;
	const [activeTab, setTab] = useUrlQueryTab(tabIds, "kanban");

	const triggers = [
		{ value: "kanban", label: "Task Board" },
		{ value: "overview", label: "Overview" },
		...(showStatisticsTab
			? [{ value: "statistics" as const, label: "Statistics" }]
			: []),
		{ value: "team", label: "Members" },
		{ value: "settings", label: "Settings" },
	];

	return (
		<Tabs value={activeTab} onValueChange={setTab} className="w-full">
			<TabsTriggerList
				triggers={triggers}
				className="overflow-x-auto sm:overflow-visible"
			/>
			<PhaseBoard
				projectId={projectData.id}
				setIsTaskDetailOpen={setIsTaskDetailOpen}
				setSelectedTask={setSelectedTask}
			/>

			<Overview
				projectData={projectData}
				organisationName={organisation?.name}
				onSelectTask={(task) => {
					setSelectedTask(task);
					setIsTaskDetailOpen(true);
				}}
				onViewBoard={() => setTab("kanban")}
			/>
			{showStatisticsTab ? (
				<ProjectStatistics projectData={projectData} />
			) : null}
			<Members
				members={teamMembers ?? []}
				organisationMembers={organisationMembers}
				teamMembers={teamMembers ?? []}
				projectId={projectData.id}
				projectName={projectData.name}
				setChangeRole={setChangeRole}
				setChangeRoleModal={setChangeRoleModal}
				setChangeRoleUser={setChangeRoleUser}
				setChangeRoleId={setChangeRoleId}
				setChangeRoleCanSeeBudget={setChangeRoleCanSeeBudget}
			/>
			<ProjectSettings
				project={projectData}
				organisation={organisation}
			/>
		</Tabs>
	);
}

export default function ProjectDetails() {
	const [changeRoleModal, setChangeRoleModal] = useState(false);
	const [changeRoleUser, setChangeRoleUser] = useState<string>("");
	const [changeRole, setChangeRole] = useState<string>("");
	const [changeRoleId, setChangeRoleId] = useState<string>("");
	const [changeRoleCanSeeBudget, setChangeRoleCanSeeBudget] = useState(false);
	const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
	const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

	const { updateprojectDetails } = useprojectDetailStore();
	const projectData = useprojectDetailStore((state) => state.project);
	const profile = useProfileStore((state) => state.profile);
	const ownerShell = useUsesOwnerShell(profile);
	const currentUserId = profile?.id ?? "";
	const organisations = useOrganisationStore((state) => state.organisations);
	const organisation = Object.values(organisations).find(
		(org) => org.id === projectData?.orgId,
	);

	const teamMembers = getProjectMembersByProjectIdFromStore(
		projectData?.id || "",
	);

	const organisationMembers = getOrganisationMembersFromStore(
		organisation?.id ?? "",
	);

	if (!projectData) {
		return <LoadingSpinner />;
	}

	const showBudgetGrant = canViewProjectFinancials(
		currentUserId,
		projectData,
	);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
				<Header
					projectData={projectData}
					organisation={organisation}
				/>

				<Summary
					projectData={projectData}
					teamMembers={teamMembers}
				/>

				<Suspense fallback={<LoadingSpinner />}>
					<ProjectWorkspace
						projectData={projectData}
						organisation={organisation}
						teamMembers={teamMembers}
						organisationMembers={organisationMembers}
						setChangeRole={setChangeRole}
						setChangeRoleModal={setChangeRoleModal}
						setChangeRoleUser={setChangeRoleUser}
						setChangeRoleId={setChangeRoleId}
						setChangeRoleCanSeeBudget={setChangeRoleCanSeeBudget}
						setIsTaskDetailOpen={setIsTaskDetailOpen}
						setSelectedTask={setSelectedTask}
						showStatisticsTab={ownerShell}
					/>
				</Suspense>
			</div>
			<TaskDetailModal
				isTaskDetailOpen={isTaskDetailOpen}
				setIsTaskDetailOpen={setIsTaskDetailOpen}
				selectedTask={selectedTask}
				setIsAssignTaskOpen={setIsAssignTaskOpen}
			/>
			<AssignTaskModal
				isAssignTaskOpen={isAssignTaskOpen}
				setIsAssignTaskOpen={setIsAssignTaskOpen}
				selectedTask={selectedTask}
				setSelectedTask={setSelectedTask}
				teamMembers={teamMembers || []}
				projectData={projectData}
				updateprojectDetails={updateprojectDetails}
				currentUserId={currentUserId}
			/>
			<ChangeRoleModal
				isOpen={changeRoleModal}
				onOpenChange={setChangeRoleModal}
				user={changeRoleUser}
				originalRole={changeRole}
				originalCanSeeBudget={changeRoleCanSeeBudget}
				projectId={projectData.id}
				id={changeRoleId}
				showBudgetGrant={showBudgetGrant}
			/>
		</div>
	);
}

const Header = ({
	projectData,
	organisation,
}: {
	projectData: IProject;
	organisation: IOrganisation | undefined;
}) => {
	return (
		<header className="mb-3 space-y-4 lg:mb-8">
			<div className="flex flex-wrap items-center gap-2 lg:hidden">
				<Badge variant={statusVariant(projectData.status)}>
					{projectData.status}
				</Badge>
				{organisation?.name ? (
					<span className="text-sm text-muted-foreground">
						{organisation.name}
					</span>
				) : null}
			</div>

			<PageBreadcrumbs
				className="hidden lg:block"
				items={
					organisation
						? [
								{ label: "Organisations", href: "/organisations" },
								{
									label: organisation.name,
									href: `/organisations/${organisation.id}`,
								},
								{ label: projectData.name },
							]
						: [
								{ label: "Projects", href: "/projects" },
								{ label: projectData.name },
							]
				}
			/>

			<div className="hidden min-w-0 flex-col gap-3 lg:flex">
				<div className="flex min-w-0 items-start gap-3">
					<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 sm:h-12 sm:w-12">
						<FolderOpen className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
					</span>
					<div className="min-w-0 flex-1 pt-0.5">
						<div className="flex flex-wrap items-center gap-2 gap-y-1">
							<h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
								{projectData.name}
							</h1>
							<Badge variant={statusVariant(projectData.status)}>
								{projectData.status}
							</Badge>
						</div>
						<p className="mt-1 text-sm text-muted-foreground sm:text-base">
							{organisation?.name
								? `${organisation.name} · Tasks, phases, and team.`
								: "Tasks, phases, and team."}
						</p>
					</div>
				</div>
			</div>
		</header>
	);
};

const Summary = ({
	projectData,
	teamMembers,
}: {
	projectData: IProject;
	teamMembers: IProjectProfile[];
}) => {
	const profileId = useProfileStore((s) => s.profile?.id);
	const showFinancials = canViewProjectFinancials(profileId, projectData);
	const budget = projectData.budget ?? 0;
	const spent = projectData.spent ?? 0;
	const progress = Number.isFinite(projectData.progress)
		? projectData.progress
		: 0;
	const totalTasks = projectData.totalTasks ?? 0;
	const completedTasks = projectData.completedTasks ?? 0;

	return (
		<div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
			{showFinancials && (
				<>
					<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Budget
							</CardTitle>
							<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
								<IndianRupee className="h-5 w-5" aria-hidden />
							</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{budget.toLocaleString("en-IN")}
								<RupeeIcon />
							</div>
						</CardContent>
					</Card>
					<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Budget spent
							</CardTitle>
							<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/25">
								<IndianRupee className="h-5 w-5" aria-hidden />
							</span>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold tabular-nums">
								{spent.toLocaleString("en-IN")}
								<RupeeIcon />
							</div>
						</CardContent>
					</Card>
				</>
			)}
			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Team members
					</CardTitle>
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary ring-1 ring-secondary/25">
						<Users className="h-5 w-5" aria-hidden />
					</span>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">
						{teamMembers.length ?? 0}
					</div>
				</CardContent>
			</Card>
			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Progress
					</CardTitle>
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25">
						<Percent className="h-5 w-5" aria-hidden />
					</span>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">
						{Math.round(progress)}%
					</div>
					<p className="mt-1 text-xs text-muted-foreground tabular-nums">
						{completedTasks} / {totalTasks} tasks
					</p>
				</CardContent>
			</Card>
		</div>
	);
};
