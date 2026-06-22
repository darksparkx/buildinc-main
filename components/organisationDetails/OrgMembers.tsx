"use client";
import { useState } from "react";
import { Button } from "@/components/base/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/base/ui/dropdown-menu";
import {
	IOrganisation,
	IOrganisationProfile,
} from "@/lib/types";
import { formatDate } from "@/lib/functions/utils";
import { Mail, MoreHorizontal, UserCircle } from "lucide-react";
import { toast } from "sonner";
import AddMember from "./AddMember";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { removeOrganisationMember } from "@/lib/middleware/organisationMembers";
import { useOrganisationMembers } from "@/lib/hooks/useOrganisationMembers";

const PAGE_SIZE = 10;

const OrgMembers = ({
	organisation,
	setChangeRole,
	setChangeRoleModal,
	setChangeRoleUser,
	setChangeRoleId,
}: {
	organisation: IOrganisation;
	setChangeRole: (role: string) => void;
	setChangeRoleModal: (open: boolean) => void;
	setChangeRoleUser: (user: string) => void;
	setChangeRoleId: (role: string) => void;
}) => {
	const [page, setPage] = useState(1);
	const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

	const members = useOrganisationMembers(organisation.id);
	const startIndex = (page - 1) * PAGE_SIZE;
	const paginatedMembers = members.slice(startIndex, startIndex + PAGE_SIZE);
	const totalPages = Math.ceil(members.length / PAGE_SIZE);

	const handleChangeRole = (member: IOrganisationProfile) => {
		const userId = member.id;
		const id = member.memberInfo?.id;
		const currentRole = "";
		if (!userId) return;
		setChangeRoleUser(userId);
		setChangeRoleId(id || "");
		setChangeRole(currentRole);
		setChangeRoleModal(true);
	};

	const handleRemoveOrgMember = async (member: IOrganisationProfile) => {
		const linkId = member.memberInfo?.id;
		if (!linkId) return;

		setRemovingMemberId(member.id);
		try {
			await removeOrganisationMember(linkId, organisation.id, member.id);
			toast.success(`${member.name ?? "Member"} removed from the organisation.`);
			if (page > 1 && paginatedMembers.length === 1) {
				setPage((p) => Math.max(1, p - 1));
			}
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Could not remove this member.",
			);
		} finally {
			setRemovingMemberId(null);
		}
	};

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="flex flex-col gap-4 space-y-0 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
				<div className="space-y-1">
					<CardTitle className="text-lg sm:text-xl">Members</CardTitle>
					<CardDescription>
						People with access to this organisation
					</CardDescription>
				</div>
				<AddMember organisation={organisation} />
			</CardHeader>

			<CardContent className="px-0 pb-6 sm:px-6">
				{paginatedMembers.length > 0 ? (
					<>
						<ul className="space-y-3 px-4 sm:px-0 lg:hidden">
							{paginatedMembers.map((member: IOrganisationProfile) => (
								<li
									key={member.id}
									className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<p className="flex items-center gap-2 font-medium">
												<UserCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
												<span className="truncate">
													{member.name ?? "Unnamed"}
												</span>
											</p>
											<p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
												<Mail className="h-3.5 w-3.5 shrink-0" />
												<span className="truncate">{member.email}</span>
											</p>
											<div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
												<span className="rounded-md bg-secondary/15 px-2 py-0.5 font-medium text-secondary-foreground">
													{member.memberInfo?.role}
												</span>
												<span className="tabular-nums">
													Joined{" "}
													{member.memberInfo?.joinedAt
														? formatDate(member.memberInfo.joinedAt)
														: "—"}
												</span>
											</div>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="shrink-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-44">
												<DropdownMenuItem
													onClick={() => handleChangeRole(member)}
												>
													Change role
												</DropdownMenuItem>
												<DropdownMenuItem disabled>View profile</DropdownMenuItem>
												{member.memberInfo?.role !== "Admin" && (
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														disabled={removingMemberId === member.id}
														onClick={() => handleRemoveOrgMember(member)}
													>
														{removingMemberId === member.id
															? "Removing…"
															: "Remove member"}
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</li>
							))}
						</ul>

						<div className="hidden overflow-x-auto lg:block">
							<Table>
								<TableHeader>
									<TableRow className="border-border/50 hover:bg-transparent">
										<TableHead className="pl-4">Name</TableHead>
										<TableHead className="text-center">Role</TableHead>
										<TableHead>Email</TableHead>
										<TableHead className="text-center">Joined</TableHead>
										<TableHead className="w-[70px] pr-4 text-right">
											<span className="sr-only">Actions</span>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedMembers.map((member: IOrganisationProfile) => (
										<TableRow
											key={member.id}
											className="border-border/40"
										>
											<TableCell className="pl-4 font-medium">
												{member.name ?? "Unnamed"}
											</TableCell>
											<TableCell className="text-center">
												<span className="inline-flex rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium">
													{member.memberInfo?.role}
												</span>
											</TableCell>
											<TableCell className="max-w-[220px] truncate text-muted-foreground">
												{member.email}
											</TableCell>
											<TableCell className="text-center tabular-nums text-sm">
												{member.memberInfo?.joinedAt
													? formatDate(member.memberInfo.joinedAt)
													: "—"}
											</TableCell>
											<TableCell className="pr-4 text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="w-44">
														<DropdownMenuItem
															onClick={() => handleChangeRole(member)}
														>
															Change role
														</DropdownMenuItem>
														<DropdownMenuItem disabled>
															View profile
														</DropdownMenuItem>
														{member.memberInfo?.role !== "Admin" && (
															<DropdownMenuItem
																className="text-destructive focus:text-destructive"
																disabled={removingMemberId === member.id}
																onClick={() =>
																	handleRemoveOrgMember(member)
																}
															>
																{removingMemberId === member.id
																	? "Removing…"
																	: "Remove member"}
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</>
				) : (
					<div className="mx-4 flex min-h-[8rem] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground sm:mx-0">
						No members yet. Invite someone to get started.
					</div>
				)}

				{totalPages > 1 && (
					<div className="mt-6 flex flex-wrap items-center justify-center gap-2 px-4 sm:px-0">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							Previous
						</Button>
						<span className="text-sm text-muted-foreground tabular-nums">
							Page {page} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
						>
							Next
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default OrgMembers;
