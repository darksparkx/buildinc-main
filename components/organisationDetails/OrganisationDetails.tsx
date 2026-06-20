"use client";
import { Building2, FolderOpen, Users } from "lucide-react";
import { Tabs, TabsContent } from "@/components/base/ui/tabs";
import { useOrganisationDetailStore } from "@/lib/store/organisationDetailStore";
import type { IOrganisation, IProject } from "@/lib/types";
import { PageBreadcrumbs } from "@/components/base/general/PageBreadcrumbs";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/base/ui/card";
import { organisationDetails } from "@/lib/functions/organisationDetails";
import OrgOverview from "./OrgOverview";
import OrgMembers from "./OrgMembers";
import OrgSettings from "./OrgSettings";
import ProjectTable from "../projects/ProjectTable";
import { TabsTriggerList } from "@/components/base/general/TabsTriggerList";
import { getOrganisationMembersFromStore } from "@/lib/middleware/organisationMembers";
import { getOrganisationProjectsFromStore } from "@/lib/middleware/projects";
import ChangeRoleModal from "./ChangeRoleModal";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useProfileStore } from "@/lib/store/profileStore";
import { Suspense, useState } from "react";
import { useUrlQueryTab } from "@/lib/hooks/useUrlQueryTab";
import OrganisationStatistics from "./OrganisationStatistics";

const ORG_WORKSPACE_TABS_BASE = [
	"overview",
	"projects",
	"members",
	"settings",
] as const;

const ORG_WORKSPACE_TABS_WITH_STATS = [
	"overview",
	"projects",
	"statistics",
	"members",
	"settings",
] as const;

function OrganisationWorkspace({
	organisation,
	projects,
	totalBudget,
	totalSpent,
	budgetUtilization,
	totalSqft,
	plannedPerSqft,
	actualPerSqft,
	showFinancials,
	setChangeRole,
	setChangeRoleUser,
	setChangeRoleModal,
	setChangeRoleId,
	showStatisticsTab,
}: {
	organisation: IOrganisation;
	projects: IProject[];
	totalBudget: number;
	totalSpent: number;
	budgetUtilization: number;
	totalSqft: number;
	plannedPerSqft: number | null;
	actualPerSqft: number | null;
	showFinancials: boolean;
	setChangeRole: (v: string) => void;
	setChangeRoleUser: (v: string) => void;
	setChangeRoleModal: (v: boolean) => void;
	setChangeRoleId: (v: string) => void;
	showStatisticsTab: boolean;
}) {
	const tabIds = showStatisticsTab
		? ORG_WORKSPACE_TABS_WITH_STATS
		: ORG_WORKSPACE_TABS_BASE;
	const [activeTab, setTab] = useUrlQueryTab(tabIds, "overview");

	const triggers = [
		{ value: "overview", label: "Overview" },
		{ value: "projects", label: "Projects" },
		...(showStatisticsTab
			? [{ value: "statistics" as const, label: "Statistics" }]
			: []),
		{ value: "members", label: "Members" },
		{ value: "settings", label: "Settings" },
	];

	return (
		<Tabs value={activeTab} onValueChange={setTab} className="w-full">
			<TabsTriggerList
				triggers={triggers}
				className="overflow-x-auto sm:overflow-visible"
			/>

			<OrgOverview
				organisation={organisation}
				totalBudget={totalBudget}
				totalSpent={totalSpent}
				budgetUtilization={budgetUtilization}
				showFinancials={showFinancials}
				totalSqft={totalSqft}
				plannedPerSqft={plannedPerSqft}
				actualPerSqft={actualPerSqft}
			/>

			{showStatisticsTab ? (
				<OrganisationStatistics
					organisation={organisation}
					projects={projects}
				/>
			) : null}

			<TabsContent value="projects" className="mt-0 space-y-4">
				<div>
					<h3 className="mb-4 text-lg font-semibold tracking-tight sm:text-xl">
						Organisation projects
					</h3>
					<ProjectTable
						filteredProjects={projects}
						admin={true}
						projectTotalCount={projects.length}
						hasActiveFilters={false}
					/>
				</div>
			</TabsContent>

			<TabsContent value="members" className="mt-0 space-y-4">
				<OrgMembers
					organisation={organisation}
					setChangeRole={setChangeRole}
					setChangeRoleUser={setChangeRoleUser}
					setChangeRoleModal={setChangeRoleModal}
					setChangeRoleId={setChangeRoleId}
				/>
			</TabsContent>

			<TabsContent value="settings" className="mt-0 space-y-4">
				<OrgSettings organisation={organisation} />
			</TabsContent>
		</Tabs>
	);
}

export default function OrganisationDetails() {
	const [changeRoleModal, setChangeRoleModal] = useState(false);
	const [changeRoleUser, setChangeRoleUser] = useState<string>("");
	const [changeRole, setChangeRole] = useState<string>("");
	const [changeRoleId, setChangeRoleId] = useState<string>("");

	const organisation = useOrganisationDetailStore(
		(state) => state.organisation
	);
	const profile = useProfileStore((s) => s.profile);
	const ownerShell = useUsesOwnerShell(profile);
	const projects = getOrganisationProjectsFromStore(organisation?.id || "");

	const { totalBudget, totalSpent, budgetUtilization } =
		organisationDetails(projects);

	const totalSqft = projects.reduce(
		(sum, p) => sum + (Number(p.totalSqft) || 0),
		0,
	);
	const plannedPerSqft =
		ownerShell && totalSqft > 0
			? Math.round(totalBudget / totalSqft)
			: null;
	const actualPerSqft =
		ownerShell && totalSqft > 0 && totalSpent > 0
			? Math.round(totalSpent / totalSqft)
			: null;

	if (!organisation) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				No organisation selected.
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
				<Header organisation={organisation} />
				<Summary organisation={organisation} />

				<Suspense fallback={<LoadingSpinner />}>
					<OrganisationWorkspace
						organisation={organisation}
						projects={projects}
						totalBudget={totalBudget}
						totalSpent={totalSpent}
						budgetUtilization={budgetUtilization}
						totalSqft={totalSqft}
						plannedPerSqft={plannedPerSqft}
						actualPerSqft={actualPerSqft}
						showFinancials={ownerShell}
						setChangeRole={setChangeRole}
						setChangeRoleUser={setChangeRoleUser}
						setChangeRoleModal={setChangeRoleModal}
						setChangeRoleId={setChangeRoleId}
						showStatisticsTab={ownerShell}
					/>
				</Suspense>

				<ChangeRoleModal
					isOpen={changeRoleModal}
					onOpenChange={setChangeRoleModal}
					user={changeRoleUser}
					originalRole={changeRole}
					orgId={organisation.id}
					id={changeRoleId}
				/>
			</div>
		</div>
	);
}

const Header = ({ organisation }: { organisation: IOrganisation }) => {
	return (
		<header className="mb-3 space-y-5 lg:mb-8">
			{/* Desktop: breadcrumb (mobile uses bottom nav → Organisations) */}
			<PageBreadcrumbs
				className="hidden lg:block"
				items={[
					{ label: "Organisations", href: "/organisations" },
					{ label: organisation.name },
				]}
			/>

			{/* Icon + title + tagline: lg+ only (top bar shows name below lg) */}
			<div className="hidden min-w-0 items-start gap-3 lg:flex">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 sm:h-12 sm:w-12">
					<Building2 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
				</span>
				<div className="min-w-0 pt-0.5">
					<h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
						{organisation.name}
					</h1>
					<p className="mt-0 text-sm text-muted-foreground sm:text-base lg:mt-1">
						Members, projects, and organisation settings.
					</p>
				</div>
			</div>
		</header>
	);
};

const Summary = ({ organisation }: { organisation: IOrganisation }) => {
	const members = getOrganisationMembersFromStore(organisation.id).length ?? 0;
	const projectCount =
		getOrganisationProjectsFromStore(organisation.id).length ?? 0;

	return (
		<div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Total members
					</CardTitle>
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
						<Users className="h-5 w-5" aria-hidden />
					</span>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">{members}</div>
				</CardContent>
			</Card>
			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Projects
					</CardTitle>
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary ring-1 ring-secondary/25">
						<FolderOpen className="h-5 w-5" aria-hidden />
					</span>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold tabular-nums">
						{projectCount}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
