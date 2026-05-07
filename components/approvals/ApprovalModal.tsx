import { Badge } from "@/components/base/ui/badge";
import { Button } from "@/components/base/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/ui/dialog";
import { Label } from "@/components/base/ui/label";
import { Textarea } from "@/components/base/ui/textarea";
import { acceptOrgInvitation } from "@/lib/functions/organisationDetails";
import { acceptProjectInvitation } from "@/lib/functions/projectDetails";
import {
	handleAssigment,
	handleCompletion,
	handleMaterialRequest,
	handlePaymentRequest,
	handleReject,
} from "@/lib/functions/requests";
import {
	modalButtonCancelClass,
	modalButtonConfirmClass,
	modalButtonDangerClass,
} from "@/lib/functions/modalButtonStyles";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { requestStatusBadgeVariant } from "@/lib/functions/taskStatusUi";
import { RupeeIcon } from "@/lib/functions/utils";
import { useProfileStore } from "@/lib/store/profileStore";
import { IProfile, IRequest } from "@/lib/types";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { PhotoGalleryViewer } from "../base/general/PhotoViewer";

function requestTitle(type: IRequest["type"] | undefined): string {
	switch (type) {
		case "MaterialRequest":
			return "Material request";
		case "TaskAssignment":
			return "Task assignment";
		case "PaymentRequest":
			return "Payment request";
		case "TaskCompletion":
			return "Task completion";
		case "JoinOrganisation":
			return "Join organisation";
		case "JoinProject":
			return "Join project";
		default:
			return "Request";
	}
}

/** Approve flow for pending requests; returns whether the modal may close. */
async function runApprove(
	selectedApproval: IRequest,
	profile: IProfile | null,
): Promise<boolean> {
	switch (selectedApproval.type) {
		case "TaskAssignment":
			await handleAssigment(selectedApproval, profile);
			return true;
		case "MaterialRequest":
			await handleMaterialRequest(selectedApproval, profile);
			return true;
		case "PaymentRequest":
			await handlePaymentRequest(selectedApproval, profile);
			return true;
		case "TaskCompletion":
			return (await handleCompletion(selectedApproval, profile)) === true;
		case "JoinOrganisation":
		case "JoinProject": {
			if (!profile || profile.id !== String(selectedApproval.requestedTo)) {
				toast.error("Only the invited user can accept this invitation.");
				return false;
			}
			if (selectedApproval.type === "JoinOrganisation") {
				acceptOrgInvitation(selectedApproval);
			} else {
				acceptProjectInvitation(selectedApproval);
			}
			return true;
		}
		default: {
			const kind = selectedApproval.type as string;
			toast.error(
				"This request type can't be approved from this screen. If this keeps happening, contact support.",
			);
			console.warn("ApprovalModal: unhandled request type on approve:", kind);
			return false;
		}
	}
}

const ApprovalModal = ({
	isDetailDialogOpen,
	setIsDetailDialogOpen,
	selectedApproval,
	setComment,
	comment,
	profile,
}: {
	isDetailDialogOpen: boolean;
	setIsDetailDialogOpen: (open: boolean) => void;
	selectedApproval: IRequest | null;
	setComment: (comment: string) => void;
	comment: string;
	profile: IProfile | null;
}) => {
	const profiles = useProfileStore((state) => state.allProfiles);
	const requestedByProfile = profiles.find(
		(p) => p.id === selectedApproval?.requestedBy,
	);

	return (
		<Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-[700px]">
				<DialogHeader className="shrink-0 space-y-2 border-b border-border/60 px-6 pb-4 pt-6">
					<DialogTitle className="text-left text-xl leading-tight">
						{requestTitle(selectedApproval?.type)}
					</DialogTitle>
					<DialogDescription className="hidden text-left lg:block">
						{selectedApproval?.project?.name
							? `${selectedApproval.project.name} · `
							: null}
						Request details and photos
					</DialogDescription>
				</DialogHeader>

				{selectedApproval && (
					<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
						{selectedApproval.requestedBy ? (
							<Row label="Requested by">
								<span className="font-medium">
									{requestedByProfile?.name || "Unknown user"}
								</span>
							</Row>
						) : null}

						<Row label="Date submitted">
							{formatCalendarDate(selectedApproval.created_at)}
						</Row>

						{selectedApproval.type === "MaterialRequest" && (
							<>
								<Row label="Item">
									<p className="font-medium">
										{selectedApproval.requestData.materialName}
									</p>
								</Row>
								<Row label="Quantity">
									<p className="font-medium">
										{selectedApproval.requestData.units}{" "}
										{selectedApproval.requestData.unitName}
									</p>
								</Row>
								<Row
									label={
										`Cost per ` +
										(selectedApproval.requestData.unitName?.endsWith("s")
											? selectedApproval.requestData.unitName.slice(0, -1)
											: selectedApproval.requestData.unitName)
									}
								>
									<p className="font-medium">
										{selectedApproval.requestData.unitCost?.toLocaleString(
											"en-IN",
										)}{" "}
										<RupeeIcon />
									</p>
								</Row>
								<Row label="Total cost">
									<p className="font-medium">
										{(
											(selectedApproval.requestData?.unitCost ?? 0) *
											(selectedApproval.requestData?.units ?? 0)
										).toLocaleString("en-IN")}{" "}
										<RupeeIcon />
									</p>
								</Row>
							</>
						)}

						{selectedApproval.requestData.description ? (
							<Row label="Description">
								<p className="leading-relaxed">
									{selectedApproval.requestData.description}
								</p>
							</Row>
						) : null}
						{selectedApproval.notes ? (
							<Row label="Notes">
								<p className="leading-relaxed">{selectedApproval.notes}</p>
							</Row>
						) : null}
						{selectedApproval.requestData.amount != null &&
						selectedApproval.requestData.amount > 0 ? (
							<Row label="Amount">
								<p className="font-medium tabular-nums">
									{selectedApproval.requestData.amount?.toLocaleString("en-IN")}{" "}
									<RupeeIcon />
								</p>
							</Row>
						) : null}

						{selectedApproval.photos && selectedApproval.photos.length > 0 ? (
							<Row label="Photos">
								<PhotoGalleryViewer photos={selectedApproval.photos} />
							</Row>
						) : null}

						<Row label="Project">
							<p className="font-medium">{selectedApproval.project?.name}</p>
						</Row>

						<Row label="Location">
							<p>{selectedApproval.project?.location ?? "—"}</p>
						</Row>

						{selectedApproval.requestData.supplier ? (
							<Row label="Supplier">
								<p>{selectedApproval.requestData.supplier}</p>
							</Row>
						) : null}

						<Row label="Status">
							<Badge
								variant={requestStatusBadgeVariant(selectedApproval.status)}
								className="capitalize"
							>
								{selectedApproval.status}
							</Badge>
						</Row>

						{selectedApproval.status === "Pending" ? (
							<div className="space-y-2 pt-1">
								<Label
									htmlFor="approval-comment"
									className="text-sm font-medium text-muted-foreground"
								>
									Comment
								</Label>
								<Textarea
									id="approval-comment"
									placeholder="Optional notes for this decision…"
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									rows={3}
									className="resize-none border-border/60"
								/>
							</div>
						) : null}
					</div>
				)}

				<DialogFooter className="shrink-0 gap-2 border-t border-border/60 px-6 py-4 sm:gap-2">
					{selectedApproval?.status === "Pending" ? (
						<ApprovalButtons
							selectedApproval={selectedApproval}
							setIsDetailDialogOpen={setIsDetailDialogOpen}
							profile={profile}
						/>
					) : (
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDetailDialogOpen(false)}
							className={modalButtonCancelClass}
						>
							Close
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const Row = ({
	label,
	children,
}: {
	label: React.ReactNode;
	children: React.ReactNode;
}) => (
	<div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4 sm:items-start">
		<Label className="text-sm font-medium text-muted-foreground">{label}</Label>
		<div className="min-w-0 break-words text-sm">{children}</div>
	</div>
);

const ApprovalButtons = ({
	selectedApproval,
	setIsDetailDialogOpen,
	profile,
}: {
	selectedApproval: IRequest | null;
	setIsDetailDialogOpen: (open: boolean) => void;
	profile: IProfile | null;
}) => (
	<>
		<Button
			type="button"
			variant="outline"
			onClick={async () => {
				if (selectedApproval) await handleReject(selectedApproval, profile);
				setIsDetailDialogOpen(false);
			}}
			className={modalButtonDangerClass}
		>
			<XCircle className="h-4 w-4" aria-hidden />
			Reject
		</Button>
		<Button
			type="button"
			variant="outline"
			className={modalButtonConfirmClass}
			onClick={async () => {
				if (!selectedApproval) {
					setIsDetailDialogOpen(false);
					return;
				}
				const mayClose = await runApprove(selectedApproval, profile);
				if (mayClose) setIsDetailDialogOpen(false);
			}}
		>
			<CheckCircle className="h-4 w-4" aria-hidden />
			Approve
		</Button>
	</>
);

export default ApprovalModal;
