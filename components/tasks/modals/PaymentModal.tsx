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
import { requestPayment } from "@/lib/functions/tasks";
import { RupeeIcon } from "@/lib/functions/utils";
import { addRequestPhoto } from "@/lib/middleware/requestPhotos";
import { useProfileStore } from "@/lib/store/profileStore";
import { ITask } from "@/lib/types";
import { set } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

const PaymentModal = ({
	isPaymentModalOpen,
	setIsPaymentModalOpen,
	selectedTask,
}: {
	isPaymentModalOpen: boolean;
	setIsPaymentModalOpen: (open: boolean) => void;
	selectedTask: ITask | undefined;
}) => {
	const projectName = selectedTask?.projectName;
	const projectId = selectedTask?.projectId || null;
	const [amount, setAmount] = useState<number>(0);
	const [notes, setNotes] = useState<string>("");
	const [photos, setPhotos] = useState<File[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const user = useProfileStore((state) => state.profile);

	const handleSubmit = async () => {
		if (!selectedTask || !amount || !user || !projectId) return;

		setLoading(true);
		try {
			const newRequestId = await requestPayment(
				selectedTask,
				amount,
				projectId,
				notes,
				user.id,
			);

			for (const file of photos) {
				await addRequestPhoto(newRequestId, file, user.id as string);
			}

			setIsPaymentModalOpen(false);
			setAmount(0);
			setNotes("");
			setPhotos([]);
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Could not submit payment request.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setIsPaymentModalOpen(false);
		setAmount(0);
		setNotes("");
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Modal is being closed
			handleClose();
		} else {
			// Modal is being opened
			setIsPaymentModalOpen(true);
		}
	};

	return (
		<Dialog
			open={isPaymentModalOpen}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-[700px]">
				<DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
					<DialogTitle>{selectedTask?.name}</DialogTitle>
					<DialogDescription>Request a payment for this task</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 overflow-y-auto">
					{selectedTask && (
						<div className="px-6 py-4">
							<div className="space-y-6">
								{/* Amount Input */}
								<div className="space-y-2">
									<Label
										htmlFor="amount"
										className="text-sm font-medium"
									>
										Payment Amount *
									</Label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
											<RupeeIcon />
										</span>
										<Input
											id="budget"
											type="text"
											placeholder="0"
											value={
												amount
													? new Intl.NumberFormat(
															"en-IN"
													  ).format(amount)
													: ""
											}
											onChange={(e) => {
												const raw =
													e.target.value.replace(
														/,/g,
														""
													); // remove commas
												const num =
													Number.parseInt(raw) || 0;
												setAmount(num);
											}}
											className="pl-8 focus-visible:ring-0 focus-visible:border-black w-full border-gray-300"
										/>
									</div>
									<p className="text-xs text-gray-500">
										Enter the amount you wish to request
									</p>
								</div>

								{/* Notes Textarea */}
								<div className="space-y-2">
									<Label
										htmlFor="notes"
										className="text-sm font-medium"
									>
										Reason for Payment
									</Label>
									<Textarea
										id="notes"
										placeholder="Describe the reason for this payment request..."
										value={notes}
										onChange={(e) =>
											setNotes(e.target.value)
										}
										rows={4}
										className="resize-none focus-visible:ring-0 focus-visible:border-black border-gray-300 w-full"
									/>
									<p className="text-xs text-gray-500">
										Optional: Provide details about what
										this payment covers
									</p>
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
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={handleSubmit}
						className={modalButtonConfirmClass}
						disabled={!amount || amount <= 0 || loading}
					>
						Request payment
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PaymentModal;
