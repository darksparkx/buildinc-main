import { useProfileStore } from "@/lib/store/profileStore";
import React, { useState, useEffect } from "react";
import { role } from "@/lib/types";
import { Button } from "@/components/base/ui/button";
import { Checkbox } from "@/components/base/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/base/ui/dialog";
import { Label } from "@/components/base/ui/label";
import { changeUserRole } from "@/lib/functions/projectDetails";
import {
	modalButtonCancelClass,
	modalButtonConfirmClass,
} from "@/lib/functions/modalButtonStyles";

const ChangeRoleModal = ({
	isOpen,
	onOpenChange,
	user,
	originalRole,
	originalCanSeeBudget,
	projectId,
	id,
	showBudgetGrant,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	user: string;
	originalRole: string;
	originalCanSeeBudget: boolean;
	projectId: string;
	id: string;
	showBudgetGrant: boolean;
}) => {
	const [memberRole, setMemberRole] = useState<role>(originalRole as role);
	const [canSeeBudget, setCanSeeBudget] = useState(originalCanSeeBudget);
	const [loading, setLoading] = useState(false);
	const memberProfile = useProfileStore((state) =>
		state.allProfiles.find((profile) => profile.id === user),
	);

	useEffect(() => {
		if (isOpen) {
			setMemberRole(originalRole as role);
			setCanSeeBudget(originalCanSeeBudget);
		}
	}, [isOpen, originalRole, originalCanSeeBudget]);

	const handleSubmit = async () => {
		if (
			memberRole === originalRole &&
			canSeeBudget === originalCanSeeBudget
		) {
			onOpenChange(false);
			return;
		}
		setLoading(true);
		await changeUserRole(id, projectId, {
			role: memberRole,
			canSeeBudget: showBudgetGrant ? canSeeBudget : false,
		});
		setLoading(false);
		onOpenChange(false);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (isOpen) {
				const modalContent = document.querySelector(
					"[data-radix-dialog-content]",
				);
				if (modalContent && !modalContent.contains(e.target as Node)) {
					onOpenChange(false);
				}
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onOpenChange]);

	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-50"
					onClick={() => onOpenChange(false)}
				/>
			)}

			<Dialog open={isOpen} onOpenChange={onOpenChange} modal={false}>
				<DialogContent
					className="sm:max-w-[425px] z-50"
					onPointerDownOutside={(e) => {
						e.preventDefault();
						onOpenChange(false);
					}}
					onInteractOutside={(e) => e.preventDefault()}
				>
					<div>
						<DialogHeader>
							<DialogTitle>Change member role</DialogTitle>
							<DialogDescription>
								Update role and budget visibility for this project
								member.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="flex items-start gap-4 p-4 bg-muted/50 border border-muted rounded-md">
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium">
										{memberProfile?.name ?? "Unknown member"}
									</div>
									<div className="mt-1 text-xs text-muted-foreground">
										Email: {memberProfile?.email ?? "—"}
									</div>
								</div>
							</div>

							<div>
								<Label htmlFor="role-select">Role</Label>
								<select
									id="role-select"
									value={memberRole}
									onChange={(e) =>
										setMemberRole(e.target.value as role)
									}
									className="w-full rounded-md border px-3 py-2"
								>
									<option value="Admin">Admin</option>
									<option value="Supervisor">Supervisor</option>
									<option value="Employee">Employee</option>
								</select>
							</div>

							{showBudgetGrant ? (
								<div className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
									<Checkbox
										id="can-see-budget"
										checked={canSeeBudget}
										onCheckedChange={(checked) =>
											setCanSeeBudget(checked === true)
										}
									/>
									<div className="space-y-1">
										<Label
											htmlFor="can-see-budget"
											className="cursor-pointer font-medium"
										>
											Can see budget
										</Label>
										<p className="text-xs text-muted-foreground">
											Allows viewing project budget, spend, task
											planned amounts, material costs, and ₹/sqft.
										</p>
									</div>
								</div>
							) : null}

							<DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:gap-2">
								<Button
									type="button"
									variant="outline"
									className={modalButtonCancelClass}
									onClick={() => onOpenChange(false)}
									disabled={loading}
								>
									Cancel
								</Button>
								<Button
									type="button"
									variant="outline"
									className={modalButtonConfirmClass}
									disabled={loading}
									onClick={handleSubmit}
								>
									{loading ? "Saving…" : "Save changes"}
								</Button>
							</DialogFooter>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ChangeRoleModal;
