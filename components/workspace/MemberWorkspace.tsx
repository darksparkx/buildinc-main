"use client";

import OrgMemberRequests from "@/components/organisations/OrgMemberRequests";
import ProjectMemberRequests from "@/components/projects/ProjectMemberRequests";
import ProjectTable from "@/components/projects/ProjectTable";
import { Input } from "@/components/base/ui/input";
import {
	Card,
	CardContent,
} from "@/components/base/ui/card";
import { getProjectProgress } from "@/lib/functions/base";
import { formatFriendlyDate } from "@/lib/functions/formatCalendarDate";
import { getOrganisationMembersFromStore } from "@/lib/middleware/organisationMembers";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { IOrganisation, IPhase, IProject, IRequest } from "@/lib/types";
import {
	Building2,
	Briefcase,
	FolderOpen,
	Search,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function WorkspaceOrgCard({
	org,
	memberProjectCount,
}: {
	org: IOrganisation;
	memberProjectCount: number;
}) {
	const ownerName =
		getAllProfilesFromStore().find((p) => p.id === org.owner)?.name ??
		"Unknown";
	const memberCount = getOrganisationMembersFromStore(org.id).length;
	const description = org.description?.trim();

	return (
		<li className="flex flex-col rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm ring-1 ring-border/30 transition-colors hover:border-primary/25 hover:bg-primary/[0.03]">
			<div className="flex items-start gap-3">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
					<Building2 className="h-5 w-5" aria-hidden />
				</span>
				<div className="min-w-0 flex-1 space-y-1">
					<p className="truncate font-semibold text-foreground">{org.name}</p>
					{description ? (
						<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
							{description}
						</p>
					) : (
						<p className="text-sm text-muted-foreground">
							No description provided.
						</p>
					)}
				</div>
			</div>
			<div className="mt-4 space-y-2 border-t border-border/50 pt-3 text-sm">
				<p className="text-muted-foreground">
					Owner:{" "}
					<span className="font-medium text-foreground">{ownerName}</span>
				</p>
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
					<span className="inline-flex items-center gap-1.5 tabular-nums">
						<Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
						{memberCount} {memberCount === 1 ? "member" : "members"}
					</span>
					<span className="inline-flex items-center gap-1.5 tabular-nums">
						<FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
						{memberProjectCount}{" "}
						{memberProjectCount === 1 ? "project" : "projects"} for you
					</span>
				</div>
			</div>
		</li>
	);
}

export default function MemberWorkspace({
	organisations,
	projects,
	phases,
	requests,
	profileId,
}: {
	organisations: IOrganisation[];
	projects: IProject[];
	phases: IPhase[];
	requests: IRequest[];
	profileId?: string;
}) {
	const [searchTerm, setSearchTerm] = useState("");

	const today = formatFriendlyDate(new Date());

	const filteredProjects = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		return projects.filter((p) => {
			if (!q) return true;
			return (
				p.name.toLowerCase().includes(q) ||
				(p.location?.toLowerCase().includes(q) ?? false)
			);
		});
	}, [projects, searchTerm]);

	const projectsByOrgId = useMemo(() => {
		const map: Record<string, number> = {};
		for (const project of projects) {
			if (!project.orgId) continue;
			map[project.orgId] = (map[project.orgId] ?? 0) + 1;
		}
		return map;
	}, [projects]);

	const projectCount = projects.length;
	const phaseCount = phases.length;
	useEffect(() => {
		getProjectProgress(projects, phases);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- stable deps are counts only
	}, [projectCount, phaseCount]);

	const pendingInviteCount = requests.filter(
		(r) =>
			r.status === "Pending" &&
			(r.type === "JoinOrganisation" || r.type === "JoinProject"),
	).length;


	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/12 via-background/90 to-background p-5 shadow-sm ring-1 ring-border/40 sm:p-8">
					<div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
					<div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-2">
							<p
								className="text-xs font-medium tracking-wide text-muted-foreground"
								suppressHydrationWarning
							>
								{today}
							</p>
							<div className="flex items-start gap-3">
								<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
									<Briefcase className="h-5 w-5" aria-hidden />
								</span>
								<div className="min-w-0">
									<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
										Workspace
									</h1>
									<p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
										Your teams, invitations, and assigned projects. Open{" "}
										<Link
											href="/tasks"
											className="font-medium text-primary underline-offset-2 hover:underline"
										>
											Tasks
										</Link>{" "}
										to view work assigned to you.
									</p>
								</div>
							</div>
						</div>
						<p className="text-sm text-muted-foreground tabular-nums sm:text-right">
							{organisations.length}{" "}
							{organisations.length === 1 ? "team" : "teams"} ·{" "}
							{projects.length}{" "}
							{projects.length === 1 ? "project" : "projects"}
						</p>
					</div>
				</section>

				{pendingInviteCount > 0 ? (
					<section className="space-y-4">
						<div className="space-y-1">
							<h2 className="text-lg font-semibold tracking-tight">
								Invitations
							</h2>
							<p className="text-sm text-muted-foreground">
								Accept or decline invites to join a team or project.
							</p>
						</div>
						<OrgMemberRequests requests={requests} />
						<ProjectMemberRequests requests={requests} />
					</section>
				) : null}

				<section className="space-y-4">
					<h2 className="text-lg font-semibold tracking-tight">
						Organisations
					</h2>

					{organisations.length > 0 ? (
						<ul className="grid gap-3 sm:grid-cols-2">
							{organisations.map((org) => (
								<WorkspaceOrgCard
									key={org.id}
									org={org}
									memberProjectCount={projectsByOrgId[org.id] ?? 0}
								/>
							))}
						</ul>
					) : (
						<Card className="border-dashed border-border/60 bg-muted/20 shadow-sm ring-1 ring-border/40">
							<CardContent className="flex gap-3 px-4 py-6 sm:px-6">
								<span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
									<Users className="h-4 w-4" aria-hidden />
								</span>
								<div className="min-w-0 space-y-1">
									<p className="font-medium text-foreground">
										No teams yet
									</p>
									<p className="text-sm leading-snug text-muted-foreground">
										When an organisation owner invites you, the team
										will appear here. Check Invitations above if you
										have a pending request.
									</p>
								</div>
							</CardContent>
						</Card>
					)}
				</section>

				<section className="space-y-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="text-lg font-semibold tracking-tight">
							Projects
						</h2>
						<div className="relative w-full sm:max-w-xs">
							<Search
								className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
								aria-hidden
							/>
							<Input
								placeholder="Search projects…"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="h-10 border-border/60 bg-background/80 pl-10 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							/>
						</div>
					</div>

					<ProjectTable
						filteredProjects={filteredProjects}
						admin={false}
						profileId={profileId}
						projectTotalCount={projects.length}
						hasActiveFilters={searchTerm.trim() !== ""}
					/>
				</section>
			</div>
		</div>
	);
}
