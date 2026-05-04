import { useState } from "react";
import { Input } from "@/components/base/ui/input";
import { Building2, Search } from "lucide-react";
import { OrgTable } from "./OrgTable";
import { IOrganisation, IRequest } from "@/lib/types";
import AddOrgModal from "./AddOrgModal";
import OrgMemberRequests from "./OrgMemberRequests";

export default function Organisations({
	organisations,
	admin,
	requests,
}: {
	organisations: IOrganisation[];
	admin: boolean;
	requests: IRequest[];
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const filteredOrganisations = organisations.filter((org) =>
		org.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex items-start gap-3">
								<span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 lg:inline-flex">
									<Building2 className="h-5 w-5" aria-hidden />
								</span>
								<div className="min-w-0">
									<h1 className="hidden text-2xl font-semibold tracking-tight lg:block lg:text-3xl">
										Organisations
									</h1>
									<p className="max-w-xl text-sm text-muted-foreground lg:mt-1 sm:text-base">
										{admin
											? "Create organisations, add members, and link projects."
											: "Organisations you belong to and invitations."}
									</p>
								</div>
							</div>
						</div>
						<p className="text-sm text-muted-foreground tabular-nums sm:text-right">
							{filteredOrganisations.length} of {organisations.length}{" "}
							shown
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
						<div className="relative w-full sm:max-w-md">
							<Search
								className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
								aria-hidden
							/>
							<Input
								placeholder="Search by name…"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="h-11 border-border/60 bg-background/80 pl-10 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							/>
						</div>
						{admin && (
							<div className="flex shrink-0 sm:justify-end">
								<AddOrgModal
									isOpen={isCreateDialogOpen}
									onOpenChange={setIsCreateDialogOpen}
								/>
							</div>
						)}
					</div>
				</header>

				<OrgTable
					filteredOrganisations={filteredOrganisations}
					admin={admin}
					organisationTotalCount={organisations.length}
					hasSearchQuery={searchTerm.trim() !== ""}
				/>

				{!admin && <OrgMemberRequests requests={requests} />}
			</div>
		</div>
	);
}
