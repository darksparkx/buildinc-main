"use client";

import { Button } from "@/components/base/ui/button";
import { Input } from "@/components/base/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/base/ui/select";
import { IPhase, IProject, IRequest } from "@/lib/types";
import { Filter, FolderOpen, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProjectMemberRequests from "./ProjectMemberRequests";
import ProjectStatistics from "./ProjectStatistics";
import ProjectTable from "./ProjectTable";
import { getProjectProgress } from "@/lib/functions/base";
import { canViewProjectFinancials } from "@/lib/permissions/canViewProjectFinancials";
import { useProfileStore } from "@/lib/store/profileStore";

type StatusFilter =
	| "All"
	| "Inactive"
	| "Pending"
	| "Active"
	| "Reviewing"
	| "Completed";

export default function Projects({
	projects,
	phases,
	admin,
	requests,
}: {
	projects: IProject[];
	phases: IPhase[];
	admin: boolean;
	requests: IRequest[];
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
	const profileId = useProfileStore((s) => s.profile?.id);

	const totalProjects = projects.length;
	const activeProjects = projects.filter((p) => p.status === "Active").length;
	const totalBudget = projects.reduce((sum, p) => {
		if (!canViewProjectFinancials(profileId, p)) return sum;
		return sum + (p.budget ?? 0);
	}, 0);
	const showBudgetSummary = projects.some((p) =>
		canViewProjectFinancials(profileId, p),
	);

	const filteredProjects = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		return projects.filter((p) => {
			const matchesSearch =
				!q ||
				p.name.toLowerCase().includes(q) ||
				(p.location?.toLowerCase().includes(q) ?? false);
			const matchesStatus =
				statusFilter === "All" || p.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [projects, searchTerm, statusFilter]);

	// Parent passes `Object.values(...)` each render (new array identity). `getProjectProgress`
	// updates the store, so effect deps must not be those arrays or we loop forever.
	const projectCount = projects.length;
	const phaseCount = phases.length;
	useEffect(() => {
		getProjectProgress(projects, phases);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: stable deps are counts only
	}, [projectCount, phaseCount]);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex items-start gap-3">
								<span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 lg:inline-flex">
									<FolderOpen className="h-5 w-5" aria-hidden />
								</span>
								<div className="min-w-0">
									<h1 className="hidden text-2xl font-semibold tracking-tight lg:block lg:text-3xl">
										Projects
									</h1>
									<p className="max-w-xl text-sm text-muted-foreground lg:mt-1 sm:text-base">
										{admin
											? "Create projects, track tasks, and monitor budgets."
											: "Projects you belong to and invitations."}
									</p>
								</div>
							</div>
						</div>
						<p className="text-sm text-muted-foreground tabular-nums sm:text-right">
							{filteredProjects.length} of {projects.length} shown
						</p>
					</div>

					{admin && (
						<ProjectStatistics
							totalProjects={totalProjects}
							activeProjects={activeProjects}
							totalBudget={totalBudget}
							showBudget={showBudgetSummary}
						/>
					)}

					<SearchFilter
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						admin={admin}
					/>
				</header>

				<ProjectTable
					filteredProjects={filteredProjects}
					admin={admin}
					profileId={profileId}
					projectTotalCount={projects.length}
					hasActiveFilters={
						searchTerm.trim() !== "" || statusFilter !== "All"
					}
				/>

				{!admin && <ProjectMemberRequests requests={requests} />}
			</div>
		</div>
	);
}

const SearchFilter = ({
	searchTerm,
	setSearchTerm,
	statusFilter,
	setStatusFilter,
	admin,
}: {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	statusFilter: StatusFilter;
	setStatusFilter: (value: StatusFilter) => void;
	admin: boolean;
}) => {
	const router = useRouter();

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
			<div className="relative w-full sm:max-w-md">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden
				/>
				<Input
					placeholder="Search by name or location…"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="h-11 border-border/60 bg-background/80 pl-10 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
				/>
			</div>
			<div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
				<div className="relative w-full sm:w-[11rem]">
					<Filter
						className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden
					/>
					<Select
						value={statusFilter}
						onValueChange={(v) => setStatusFilter(v as StatusFilter)}
					>
						<SelectTrigger
							aria-label="Filter by status"
							className="h-11 w-full border-border/60 bg-background/80 pl-9 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
						>
							<SelectValue placeholder="All status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="All">All status</SelectItem>
							<SelectItem value="Active">Active</SelectItem>
							<SelectItem value="Inactive">Inactive</SelectItem>
							<SelectItem value="Pending">Pending</SelectItem>
							<SelectItem value="Reviewing">Reviewing</SelectItem>
							<SelectItem value="Completed">Completed</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{admin && (
					<Button
						type="button"
						variant="outline"
						className="group h-11 w-full shrink-0 border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm transition-all duration-200 ease-out hover:border-primary/35 hover:bg-primary/5 hover:shadow-md hover:ring-primary/25 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
						onClick={() => router.push("/projects/create-project")}
					>
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20 transition-transform duration-200 ease-out group-hover:scale-105 group-hover:bg-primary/25 group-hover:ring-primary/35 group-active:scale-95">
							<Plus
								className="h-4 w-4 transition-transform duration-200 ease-out group-hover:rotate-90"
								aria-hidden
							/>
						</span>
						<span className="inline-flex h-8 shrink-0 items-center leading-none font-medium transition-colors group-hover:text-foreground">
							Create project
						</span>
					</Button>
				)}
			</div>
		</div>
	);
};
