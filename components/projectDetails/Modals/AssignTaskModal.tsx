import { Avatar, AvatarFallback } from "@/components/base/ui/avatar";
import { Button } from "@/components/base/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/ui/dialog";
import { modalButtonCancelClass } from "@/lib/functions/modalButtonStyles";
import { projectDetails } from "@/lib/functions/projectDetails";
import { IProject, IProjectProfile, ITask } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type Props = {
	isAssignTaskOpen: boolean;
	setIsAssignTaskOpen: Dispatch<SetStateAction<boolean>>;
	selectedTask: ITask | null;
	setSelectedTask?: Dispatch<SetStateAction<ITask | null>>;
	teamMembers: IProjectProfile[];
	projectData: IProject;

	/** Unused; kept for call-site compatibility. */
	updateprojectDetails?: (project: IProject) => void;
	currentUserId: string;
};

const AssignTaskModal = ({
	isAssignTaskOpen,
	setIsAssignTaskOpen,
	selectedTask,
	setSelectedTask,
	teamMembers,
	projectData,
	currentUserId,
}: Props) => {
	const { assignTask } = projectDetails();

	const handleAdd = (member: IProjectProfile) => {
		if (!selectedTask) return;
		toast.info("Assigning task...");
		try {
			assignTask(
				selectedTask.id,
				selectedTask.phaseId,
				member.id,
				currentUserId,
				projectData
			);
			setIsAssignTaskOpen(false);
			setSelectedTask?.(null);
			toast.success("Task Assignment Request Sent.");
		} catch (error) {
			toast.error("Failed to assign task. Please try again.");
			console.error("Error assigning task:", error);
			return;
		}
		// window.location.reload();
	};
	return (
		<Dialog
			open={isAssignTaskOpen}
			onOpenChange={setIsAssignTaskOpen}
		>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Assign Task</DialogTitle>
					<DialogDescription>
						Assign &quot;{selectedTask?.name}&quot; to a team member
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-3">
						{teamMembers
							.sort((a, b) => {
								const roleOrder = {
									Admin: 0,
									Supervisor: 1,
									Employee: 2,
								};
								return (
									(roleOrder[
										a.memberInfo
											?.role as keyof typeof roleOrder
									] ?? 3) -
									(roleOrder[
										b.memberInfo
											?.role as keyof typeof roleOrder
									] ?? 3)
								);
							})
							.map((member) => (
								<div
									key={member.id}
									className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
									onClick={() => handleAdd(member)}
								>
									<Avatar>
										<AvatarFallback>
											{member.name[0]}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-medium">
											{member.name}
										</p>
										<p className="text-sm text-slate-600">
											{member.memberInfo?.role}
										</p>
									</div>
								</div>
							))}
					</div>
				</div>
				<DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:gap-2">
					<Button
						type="button"
						variant="outline"
						className={modalButtonCancelClass}
						onClick={() => setIsAssignTaskOpen(false)}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AssignTaskModal;
