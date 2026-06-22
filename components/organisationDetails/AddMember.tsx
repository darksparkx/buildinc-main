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
import { IOrganisation, IProfile } from "@/lib/types";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { useOrganisationMembers } from "@/lib/hooks/useOrganisationMembers";
import { useProfileStore } from "@/lib/store/profileStore";
import { addMember } from "@/lib/functions/organisationDetails";
import {
	modalButtonCancelClass,
	modalButtonConfirmClass,
} from "@/lib/functions/modalButtonStyles";
import { toast } from "sonner";

type Props = { organisation: IOrganisation };

interface SearchResults extends IProfile {
	added: boolean;
}
const AddMember = ({ organisation }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [users, setUsers] = useState<SearchResults[]>([]);
	const [selectedUser, setSelectedUser] = useState<IProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const { allProfiles } = useProfileStore();
	const organisationMembers = useOrganisationMembers(organisation.id);
	const orgMemberIds = useMemo(
		() => organisationMembers.map((member) => member.id),
		[organisationMembers],
	);
	// Fetch all users initially
	useEffect(() => {
		const fetchUsers = () => {
			try {
				const data = allProfiles.length
					? allProfiles
					: getAllProfilesFromStore();
				const dataWithAdded = (data ?? []).map((user: IProfile) => ({
					...user,
					added: orgMemberIds.includes(user.id),
				}));
				setUsers(dataWithAdded);
			} catch (err) {
				console.error("Failed to load users", err);
			}
		};
		if (isOpen) fetchUsers();
	}, [isOpen, allProfiles, orgMemberIds]);

	// Search users
	useEffect(() => {
		if (!searchQuery) return;
		const timeout = setTimeout(() => {
			try {
				const results = allProfiles.filter((user) =>
					(user.name ?? "")
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				);
				const resultsWithAdded = results.map((user: IProfile) => ({
					...user,
					added: orgMemberIds.includes(user.id),
				}));
				setUsers(resultsWithAdded);
			} catch (err) {
				console.error("Search failed", err);
			}
		}, 300);
		return () => clearTimeout(timeout);
	}, [searchQuery, allProfiles, orgMemberIds]);

	const handleAdd = async () => {
		if (!selectedUser) return;
		setLoading(true);
		toast.info("Sending join request…");
		try {
			await addMember(
				organisation.id,
				organisation.name,
				selectedUser,
				organisation.owner,
			);
			toast.success("Invitation sent.");
			setIsOpen(false);
			setSelectedUser(null);
			setSearchQuery("");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to send invitation.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="group h-11 w-full border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm transition-all duration-200 hover:border-primary/35 hover:bg-primary/5 hover:shadow-md hover:ring-primary/25 active:scale-[0.98] sm:w-auto"
				>
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-105 group-hover:bg-primary/25">
						<UserPlus className="h-4 w-4" aria-hidden />
					</span>
					<span className="inline-flex h-8 shrink-0 items-center leading-none font-medium">
						Add member
					</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="border-border/60 sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add Member</DialogTitle>
					<DialogDescription>
						Search for an existing user to add them to this
						organisation.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="flex flex-col gap-2">
						<Input
							id="search"
							placeholder="Search by name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className=""
						/>
					</div>

					<ScrollArea className="h-64 border rounded-md p-2">
						{users.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No users found.
							</p>
						)}
						<ul className="space-y-2">
							{users.map((user) => (
								<li
									key={user.id}
									className={`flex items-center justify-between rounded-md p-2 cursor-pointer ${
										selectedUser?.id === user.id
											? "bg-muted"
											: "hover:bg-muted/50"
									} ${
										user.added
											? "opacity-50 cursor-not-allowed"
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
											Already a member
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
						{loading ? "Adding…" : "Add member"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddMember;
