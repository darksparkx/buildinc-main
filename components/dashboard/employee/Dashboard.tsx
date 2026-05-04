"use client";

import React from "react";
import { IProfile, ITask } from "@/lib/types";

import { SummaryCard } from "@/components/base/general/SummaryCard";
import { CheckSquare, Clock, Users } from "lucide-react";
import DashboardQuickActions from "./DashboardQuickActions";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProjectStore } from "@/lib/store/projectStore";

const Dashboard = ({
	profile,
	tasks,
}: {
	profile: IProfile;
	tasks: ITask[];
}) => {
	const orgCount = useOrganisationStore((s) =>
		Object.keys(s.organisations).length,
	);
	const projectCount = useProjectStore((s) =>
		Object.keys(s.projects).length,
	);
	const showTeammateHint = orgCount === 0 && projectCount === 0;
	const inProgressTasks = tasks.filter((task) => task.status === "Active");
	const awaitingApprovalTasks = tasks.filter(
		(task) => task.status === "Reviewing",
	);
	const today = new Date().toLocaleDateString(undefined, {
		weekday: "long",
		month: "short",
		day: "numeric",
	});

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/12 via-background/90 to-background p-5 shadow-sm ring-1 ring-border/40 sm:p-8">
					<div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
					<div className="relative space-y-2">
						<p
							className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
							suppressHydrationWarning
						>
							{today}
						</p>
						<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
							Welcome back{profile?.name ? `, ${profile.name}` : ""}
						</h1>
						<p className="max-w-xl text-sm text-muted-foreground sm:text-base">
							Here is a snapshot of your tasks and shortcuts to get
							things done.
						</p>
					</div>
				</section>

				{showTeammateHint ? (
					<div className="flex gap-3 rounded-xl border border-border/60 bg-muted/25 px-4 py-4 text-sm text-muted-foreground ring-1 ring-border/40">
						<span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
							<Users className="h-4 w-4" aria-hidden />
						</span>
						<div className="min-w-0 space-y-1">
							<p className="font-medium text-foreground">Teammate account</p>
							<p className="leading-snug">
								You&apos;re not on an organisation or project in this app yet.
								Ask your organisation owner to invite you to an organisation
								or add you to a project — then lists and tasks will show up
								here.
							</p>
						</div>
					</div>
				) : null}

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					<SummaryCard
						title="Tasks in progress"
						content={
							<span className="tabular-nums">
								{inProgressTasks.length}
							</span>
						}
						icon={
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
								<CheckSquare className="h-5 w-5" aria-hidden />
							</span>
						}
						className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
					/>

					<SummaryCard
						title="Tasks awaiting approval"
						content={
							<span className="tabular-nums">
								{awaitingApprovalTasks.length}
							</span>
						}
						icon={
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-400">
								<Clock className="h-5 w-5" aria-hidden />
							</span>
						}
						className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
					/>
				</div>

				<DashboardQuickActions />
			</div>
		</div>
	);
};

export default Dashboard;
