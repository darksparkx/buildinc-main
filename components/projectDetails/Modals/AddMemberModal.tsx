"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/base/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/base/ui/dialog";
import { Input } from "@/components/base/ui/input";
import { ScrollArea } from "@/components/base/ui/scroll-area";
import { UserPlus } from "lucide-react";
import { IProfile } from "@/lib/types";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { useOrganisationMembers } from "@/lib/hooks/useOrganisationMembers";
import { useProjectMembers } from "@/lib/hooks/useProjectMembers";
import { useProfileStore } from "@/lib/store/profileStore";
import { addProjectMember } from "@/lib/functions/projectDetails";
import {
	modalButtonCancelClass,
	modalButtonConfirmClass,
} from "@/lib/functions/modalButtonStyles";
import { toast } from "sonner";

type Props = {
	orgId: string;
	projectId: string;
	projectName: string;
};

interface SearchResults extends IProfile {
	added: boolean;
}

const AddMemberModal = ({ orgId, projectId, projectName }: Props) => {
	const ownerId = useProfileStore((state) => state.profile?.id) || "";
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [users, setUsers] = useState<SearchResults[]>([]);
	const [selectedUser, setSelectedUser] = useState<IProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const { allProfiles } = useProfileStore();
	const organisationMembers = useOrganisationMembers(orgId);
	const projectMembers = useProjectMembers(projectId);
	const orgMemberIds = useMemo(
		() => organisationMembers.map((member) => member.id),
		[organisationMembers],
	);
	const projectMemberIds = useMemo(
		() => new Set(projectMembers.map((member) => member.id)),
		[projectMembers],
	);

	useEffect(() => {
		const fetchUsers = () => {
			try {
				const data = allProfiles.length
					? allProfiles
					: getAllProfilesFromStore();

				const orgMembers = data.filter((user: IProfile) =>
					orgMemberIds.includes(user.id),
				);

				const dataWithAdded = orgMembers.map((user: IProfile) => ({
					...user,
					added: projectMemberIds.has(user.id),
				}));
				setUsers(dataWithAdded);
			} catch (err) {
				console.error("Failed to load users", err);
			}
		};
		if (isOpen) fetchUsers();
	}, [isOpen, orgMemberIds, projectMemberIds, allProfiles]);

	useEffect(() => {
		if (!searchQuery) return;

		const timeout = setTimeout(() => {
			try {
				const data = allProfiles.length
					? allProfiles
					: getAllProfilesFromStore();

				const results = data.filter(
					(user: IProfile) =>
						orgMemberIds.includes(user.id) &&
						(user.name ?? "")
							.toLowerCase()
							.includes(searchQuery.toLowerCase()),
				);

				const resultsWithAdded = results.map((user: IProfile) => ({
					...user,
					added: projectMemberIds.has(user.id),
				}));
				setUsers(resultsWithAdded);
			} catch (err) {
				console.error("Search failed", err);
			}
		}, 300);
		return () => clearTimeout(timeout);
	}, [searchQuery, orgMemberIds, projectMemberIds, allProfiles]);

	const handleAdd = async () => {
		if (!selectedUser) return;
		setLoading(true);
		try {
			await addProjectMember(
				projectId,
				projectName,
				selectedUser,
				ownerId,
			);
			toast.success(`Invitation sent to ${selectedUser.name ?? "member"}.`);
			setIsOpen(false);
			setSelectedUser(null);
			setSearchQuery("");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Could not send invitation.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="group h-11 w-full border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm transition-all duration-200 ease-out hover:border-primary/35 hover:bg-primary/5 hover:shadow-md hover:ring-primary/25 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
				>
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20 transition-transform duration-200 ease-out group-hover:scale-105 group-hover:bg-primary/25 group-hover:ring-primary/35 group-active:scale-95">
						<UserPlus
							className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110"
							aria-hidden
						/>
					</span>
					<span className="inline-flex h-8 shrink-0 items-center leading-none font-medium transition-colors group-hover:text-foreground">
						Add member
					</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add Member</DialogTitle>
					<DialogDescription>
						Search for organisation members to add them to this
						project.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex flex-col gap-2">
						<Input
							id="search"
							placeholder="Search by name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<ScrollArea className="h-64 rounded-md border p-2">
						{users.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No organisation members found.
							</p>
						)}
						<ul className="space-y-2">
							{users.map((user) => (
								<li
									key={user.id}
									className={`flex cursor-pointer items-center justify-between rounded-md p-2 ${
										selectedUser?.id === user.id
											? "bg-muted"
											: "hover:bg-muted/50"
									} ${
										user.added
											? "cursor-not-allowed opacity-50"
											: ""
									}`}
									onClick={() => {
										!user.added && setSelectedUser(user);
									}}
								>
									<div>
										<p className="font-medium">
											{user.name || user.email}
										</p>
										<p className="text-sm text-muted-foreground">
											{user.email}
										</p>
									</div>
									{selectedUser?.id === user.id && (
										<span className="text-xs text-primary">
											Selected
										</span>
									)}
									{user.added && (
										<span className="text-xs text-muted-foreground">
											Already in project
										</span>
									)}
								</li>
							))}
						</ul>
					</ScrollArea>
				</div>

				<DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:gap-2">
					<Button
						type="button"
						variant="outline"
						className={modalButtonCancelClass}
						onClick={() => setIsOpen(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleAdd}
						disabled={!selectedUser || loading}
						className={modalButtonConfirmClass}
					>
						{loading ? "Adding…" : "Add to project"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddMemberModal;
