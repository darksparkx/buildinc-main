import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/base/ui/card";
import {
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Table,
} from "@/components/base/ui/table";
import React from "react";
import { IOrganisation } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
	getOrganisationMembersFromStore,
} from "@/lib/middleware/organisationMembers";
import { getOrganisationProjectsFromStore } from "@/lib/middleware/projects";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { Building2, ChevronRight, FolderOpen, Users } from "lucide-react";

type Props = {
	filteredOrganisations: IOrganisation[];
	admin: boolean;
	organisationTotalCount: number;
	hasSearchQuery: boolean;
};

function OrgMobileMeta({
	org,
	admin,
}: {
	org: IOrganisation;
	admin: boolean;
}) {
	const ownerName =
		getAllProfilesFromStore().find((p) => p.id === org.owner)?.name ??
		"N/A";
	const memberCount =
		getOrganisationMembersFromStore(org.id).length ?? 0;
	const projectCount =
		getOrganisationProjectsFromStore(org.id).length ?? 0;

	if (admin) {
		return (
			<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
				<span className="inline-flex items-center gap-1.5 tabular-nums">
					<Users className="h-3.5 w-3.5" aria-hidden />
					{memberCount} members
				</span>
				<span className="inline-flex items-center gap-1.5 tabular-nums">
					<FolderOpen className="h-3.5 w-3.5" aria-hidden />
					{projectCount} projects
				</span>
			</div>
		);
	}

	return (
		<p className="mt-2 text-sm text-muted-foreground">
			Owner <span className="font-medium text-foreground">{ownerName}</span>
			{" · "}
			<span className="tabular-nums">{projectCount}</span> projects
		</p>
	);
}

export const OrgTable = ({
	filteredOrganisations,
	admin,
	organisationTotalCount,
	hasSearchQuery,
}: Props) => {
	const router = useRouter();

	const goToOrg = (orgId: string) => {
		if (admin) router.push(`/organisations/${orgId}`);
	};

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl">All organisations</CardTitle>
				<CardDescription>
					{admin
						? "Select a row to open organisation details."
						: "Organisations you are a member of."}
				</CardDescription>
			</CardHeader>
			<CardContent className="px-0 pb-6 sm:px-6">
				{filteredOrganisations.length > 0 ? (
					<>
						{/* Mobile: cards */}
						<ul className="space-y-3 px-4 sm:px-0 lg:hidden">
							{filteredOrganisations.map((org) => (
								<li key={org.id}>
									<button
										type="button"
										disabled={!admin}
										onClick={() => goToOrg(org.id)}
										className={`flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 p-4 text-left shadow-sm transition-colors ${
											admin
												? "hover:bg-primary/5 active:bg-primary/10"
												: "cursor-default opacity-95"
										}`}
									>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<Building2 className="h-4 w-4 shrink-0 text-primary" />
												<span className="truncate font-medium">
													{org.name}
												</span>
											</div>
											<OrgMobileMeta
												org={org}
												admin={admin}
											/>
										</div>
										{admin && (
											<ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
										)}
									</button>
								</li>
							))}
						</ul>

						{/* Desktop: table */}
						<div className="hidden overflow-x-auto lg:block">
							<Table>
								<TableHeader>
									<TableRow className="border-border/50 hover:bg-transparent">
										<TableHead className="min-w-[180px] pl-4">
											Name
										</TableHead>
										{admin ? (
											<TableHead className="text-center">
												Members
											</TableHead>
										) : (
											<TableHead className="text-center">
												Owner
											</TableHead>
										)}
										<TableHead className="pr-4 text-center">
											Projects
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredOrganisations.map((org) => {
										const ownerName =
											getAllProfilesFromStore().find(
												(p) => p.id === org.owner
											)?.name;
										return (
											<TableRow
												key={org.id}
												className={`border-border/40 ${
													admin
														? "cursor-pointer hover:bg-muted/40"
														: ""
												}`}
												onClick={() => goToOrg(org.id)}
											>
												<TableCell className="pl-4 font-medium">
													{org.name}
												</TableCell>
												{admin ? (
													<TableCell className="text-center tabular-nums">
														{getOrganisationMembersFromStore(
															org.id
														).length ?? 0}
													</TableCell>
												) : (
													<TableCell className="text-center">
														{ownerName ?? "N/A"}
													</TableCell>
												)}
												<TableCell className="pr-4 text-center tabular-nums">
													{getOrganisationProjectsFromStore(
														org.id
													).length ?? 0}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</>
				) : (
					<div className="mx-4 flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center sm:mx-0">
						{organisationTotalCount === 0 && !admin ? (
							<>
								<p className="max-w-md text-sm text-muted-foreground">
									You&apos;re signed in as a teammate. You won&apos;t create
									organisations here — your admin creates the org and invites
									you. Once you&apos;re added, it will show up in this list.
								</p>
							</>
						) : organisationTotalCount === 0 && admin && !hasSearchQuery ? (
							<p className="max-w-md text-sm text-muted-foreground">
								No organisations yet. Use <strong>Create</strong> above to add
								your first one.
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No organisations match your search.
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
