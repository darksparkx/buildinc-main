import PhotoUploader from "@/components/base/general/PhotoUploader";
import { Button } from "@/components/base/ui/button";
import {
	modalButtonCancelClass,
	modalButtonConfirmClass,
} from "@/lib/functions/modalButtonStyles";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/ui/dialog";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { Textarea } from "@/components/base/ui/textarea";
import {
	getProjectIdFromPhaseId,
	handleTaskCompletion,
} from "@/lib/functions/tasks";
import { RupeeIcon } from "@/lib/functions/utils";
import { addRequestPhoto } from "@/lib/middleware/requestPhotos";
import { useProfileStore } from "@/lib/store/profileStore";
import { ITask } from "@/lib/types";
import { useRef, useState } from "react";
import { toast } from "sonner";

const CompleteModal = ({
	isCompleteModalOpen,
	setIsCompleteModalOpen,
	selectedTask,
}: {
	isCompleteModalOpen: boolean;
	setIsCompleteModalOpen: (open: boolean) => void;
	selectedTask: ITask | undefined;
}) => {
	const projectName = selectedTask?.projectName;
	const projectId =
		selectedTask?.projectId ||
		(selectedTask?.phaseId
			? getProjectIdFromPhaseId(selectedTask.phaseId)
			: null) ||
		null;
	const [notes, setNotes] = useState<string>("");
	const [photos, setPhotos] = useState<File[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const submitStartedRef = useRef(false);

	const user = useProfileStore((state) => state.profile);

	const handleSubmit = async () => {
		if (submitStartedRef.current || isSubmitting) return;
		if (!selectedTask || !user) {
			toast.error("Missing task or profile.");
			return;
		}
		if (!projectId) {
			toast.error("Could not find a project for this task.");
			return;
		}

		submitStartedRef.current = true;
		setIsSubmitting(true);
		try {
			let newRequestId: string | undefined;
			try {
				newRequestId = await handleTaskCompletion(selectedTask.id);
			} catch (e) {
				console.error(e);
				toast.error(
					e instanceof Error
						? e.message
						: "Failed to submit completion.",
				);
				return;
			}

			if (!newRequestId) {
				toast.error(
					"Could not submit completion. The task may be missing an assignee, or no supervisor/admin is set on the project.",
				);
				return;
			}
			for (const file of photos) {
				await addRequestPhoto(newRequestId, file, user.id as string);
			}

			setIsCompleteModalOpen(false);
			setNotes("");
			setPhotos([]);
		} finally {
			submitStartedRef.current = false;
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setIsCompleteModalOpen(false);
		setNotes("");
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Modal is being closed
			handleClose();
		} else {
			// Modal is being opened
			setIsCompleteModalOpen(true);
		}
	};

	return (
		<Dialog
			open={isCompleteModalOpen}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-[700px]">
				<DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
					<DialogTitle>{selectedTask?.name}</DialogTitle>
					<DialogDescription>Submit task completion</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 overflow-y-auto">
					{selectedTask && (
						<div className="px-6 py-4">
							<div className="space-y-6">
								{/* Notes Textarea */}
								<div className="space-y-2">
									<Label
										htmlFor="notes"
										className="text-sm font-medium"
									>
										Notes:
									</Label>
									<Textarea
										id="notes"
										placeholder="Add any notes regarding the completion..."
										value={notes}
										onChange={(e) =>
											setNotes(e.target.value)
										}
										rows={4}
										className="resize-none focus-visible:ring-0 focus-visible:border-black border-gray-300 w-full"
									/>
								</div>

								<div>
									<PhotoUploader
										onFilesSelected={setPhotos}
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="shrink-0 gap-2 border-t border-border/60 px-6 py-4 sm:gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						className={modalButtonCancelClass}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleSubmit}
						className={modalButtonConfirmClass}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Submitting…" : "Submit"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CompleteModal;
