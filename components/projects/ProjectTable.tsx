"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import { Badge } from "@/components/base/ui/badge";
import { RupeeIcon } from "@/lib/functions/utils";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { IProject } from "@/lib/types";
import { ChevronRight, FolderOpen, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/functions/utils";
import { ProjectProgressDisplay } from "./ProjectProgressDisplay";

type Props = {
	filteredProjects: IProject[];
	admin: boolean;
	projectTotalCount: number;
	hasActiveFilters: boolean;
};

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

function ProjectMobileRow({
	project,
	admin,
	orgName,
	onOpen,
}: {
	project: IProject;
	admin: boolean;
	orgName: string;
	onOpen: () => void;
}) {
	const pct =
		project.budget && project.budget > 0
			? Math.round(((project.spent ?? 0) / project.budget) * 100)
			: 0;

	return (
		<button
			type="button"
			disabled={!admin}
			onClick={onOpen}
			className={cn(
				"flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 p-4 text-left shadow-sm transition-colors",
				admin
					? "hover:bg-primary/5 active:bg-primary/10"
					: "cursor-default opacity-95"
			)}
		>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<FolderOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />
					<span className="truncate font-medium">{project.name}</span>
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-2">
					<Badge variant={statusVariant(project.status)} className="text-[12px]">
						{project.status}
					</Badge>
					{orgName ? (
						<span className="text-xs text-muted-foreground">{orgName}</span>
					) : null}
				</div>
				{admin ? (
					<div className="mt-3 space-y-2">
						<ProjectProgressDisplay project={project} />
						<p className="text-xs text-muted-foreground tabular-nums">
							Budget {project.budget?.toLocaleString("en-IN") ?? "0"}
							<RupeeIcon /> · {pct}% spent
						</p>
					</div>
				) : (
					<p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
						<MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
						<span className="truncate">{project.location || "—"}</span>
					</p>
				)}
			</div>
			{admin && (
				<ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
			)}
		</button>
	);
}

const ProjectTable = ({
	filteredProjects,
	admin,
	projectTotalCount,
	hasActiveFilters,
}: Props) => {
	const router = useRouter();
	const organisations = useOrganisationStore((s) => s.organisations);

	const orgNameById = useMemo(() => {
		const map: Record<string, string> = {};
		Object.values(organisations).forEach((o) => {
			map[o.id] = o.name;
		});
		return map;
	}, [organisations]);

	const handleClick = (project: IProject) => {
		if (admin) router.push(`/projects/${project.id}`);
	};

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl">All projects</CardTitle>
				<CardDescription>
					{admin
						? "Select a row to open project details."
						: "Projects you are assigned to."}
				</CardDescription>
			</CardHeader>
			<CardContent className="px-0 pb-6 sm:px-6">
				{filteredProjects.length > 0 ? (
					<>
						<ul className="space-y-3 px-4 sm:px-0 lg:hidden">
							{filteredProjects.map((project) => (
								<li key={project.id}>
									<ProjectMobileRow
										project={project}
										admin={admin}
										orgName={
											project.orgId
												? orgNameById[project.orgId] ?? ""
												: ""
										}
										onOpen={() => handleClick(project)}
									/>
								</li>
							))}
						</ul>

						<div className="hidden overflow-x-auto lg:block">
							<Table>
								<TableHeader>
									<TableRow className="border-border/50 hover:bg-transparent">
										<TableHead className="min-w-[200px] pl-4 text-left">
											Project
										</TableHead>
										<TableHead className="min-w-[100px] text-center">
											Status
										</TableHead>
										{admin ? (
											<>
												<TableHead className="text-center tabular-nums">
													Progress
												</TableHead>
												<TableHead className="text-center">
													Budget
												</TableHead>
												<TableHead className="pr-4 text-center tabular-nums">
													Tasks done
												</TableHead>
											</>
										) : (
											<TableHead className="pr-4 text-center">
												Location
											</TableHead>
										)}
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredProjects.map((project) => {
										const pct =
											project.budget && project.budget > 0
												? Math.round(
														((project.spent ?? 0) / project.budget) * 100
												  )
												: 0;
										return (
											<TableRow
												key={project.id}
												className={cn(
													"border-border/40",
													admin && "cursor-pointer hover:bg-muted/40"
												)}
												onClick={() => handleClick(project)}
											>
												<TableCell className="pl-4">
													<div className="space-y-0.5">
														<p className="font-medium">{project.name}</p>
														{project.orgId && orgNameById[project.orgId] ? (
															<p className="text-xs text-muted-foreground">
																{orgNameById[project.orgId]}
															</p>
														) : null}
													</div>
												</TableCell>
												<TableCell className="text-center">
													<Badge variant={statusVariant(project.status)}>
														{project.status}
													</Badge>
												</TableCell>
												{admin ? (
													<>
														<TableCell className="min-w-[140px] px-2">
															<ProjectProgressDisplay
																project={project}
																compact
															/>
														</TableCell>
														<TableCell className="text-center">
															<div className="space-y-0.5">
																<p className="font-medium tabular-nums">
																	{project.budget?.toLocaleString("en-IN")}
																	<RupeeIcon />
																</p>
																<p className="text-xs text-muted-foreground tabular-nums">
																	Spent{" "}
																	{project.spent?.toLocaleString("en-IN")}
																	<RupeeIcon /> ({pct}%)
																</p>
															</div>
														</TableCell>
														<TableCell className="pr-4 text-center tabular-nums text-muted-foreground">
															<span className="text-foreground font-medium">
																{project.completedTasks ?? 0}
															</span>
															<span> / {project.totalTasks ?? 0}</span>
														</TableCell>
													</>
												) : (
													<TableCell className="pr-4 text-center text-muted-foreground">
														{project.location || "—"}
													</TableCell>
												)}
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</>
				) : (
					<div className="mx-4 flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center sm:mx-0">
						{projectTotalCount === 0 && !admin ? (
							<p className="max-w-md text-sm text-muted-foreground">
								No projects yet. When your organisation owner adds you to a
								project, it will appear here. You use the same login as your
								team — you don&apos;t need your own paid plan.
							</p>
						) : projectTotalCount === 0 && admin && !hasActiveFilters ? (
							<p className="max-w-md text-sm text-muted-foreground">
								No projects yet. Use <strong>Create project</strong> above to
								start one.
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No projects match your filters.
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ProjectTable;
