import { refuseInvitation } from "@/lib/functions/organisationDetails";
import { acceptProjectInvitation } from "@/lib/functions/projectDetails";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { IRequest } from "@/lib/types";
import { Check, Inbox, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../base/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../base/ui/table";

const ProjectMemberRequests = ({ requests }: { requests: IRequest[] }) => {
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [processingAction, setProcessingAction] = useState<
		"accept" | "decline" | null
	>(null);

	const projectMemberRequests = requests.filter(
		(req) => req.type === "JoinProject" && req.status === "Pending",
	);

	const isProcessing = (reqId: string) => processingId === reqId;

	const handleAccept = async (req: IRequest) => {
		setProcessingId(req.id);
		setProcessingAction("accept");
		try {
			await acceptProjectInvitation(req);
			toast.success("You joined the project.");
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Could not accept this invitation.",
			);
		} finally {
			setProcessingId(null);
			setProcessingAction(null);
		}
	};

	const handleDecline = async (req: IRequest) => {
		setProcessingId(req.id);
		setProcessingAction("decline");
		try {
			refuseInvitation(req);
			toast.success("Invitation declined.");
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Could not decline this invitation.",
			);
		} finally {
			setProcessingId(null);
			setProcessingAction(null);
		}
	};

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl">
					Project invitations
				</CardTitle>
				<CardDescription>
					Accept or decline requests to join a project.
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-6">
				{projectMemberRequests.length > 0 ? (
					<>
						<ul className="space-y-3 lg:hidden">
							{projectMemberRequests.map((req) => {
								const requestedByProfile =
									getAllProfilesFromStore().find(
										(p) => p.id === req.requestedBy,
									);
								const busy = isProcessing(req.id);
								const accepting =
									busy && processingAction === "accept";
								const declining =
									busy && processingAction === "decline";
								return (
									<li
										key={req.id}
										className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm"
									>
										<p className="font-medium">
											{req.requestData.projectName}
										</p>
										<p className="mt-1 text-sm text-muted-foreground">
											From{" "}
											<span className="text-foreground">
												{requestedByProfile?.name ??
													"Unknown"}
											</span>
										</p>
										<div className="mt-4 flex gap-2">
											<Button
												type="button"
												variant="secondary"
												size="sm"
												className="flex-1"
												disabled={busy}
												onClick={() => handleAccept(req)}
											>
												{accepting ? (
													<Loader2
														className="mr-1.5 h-4 w-4 animate-spin"
														aria-hidden
													/>
												) : (
													<Check
														className="mr-1.5 h-4 w-4"
														aria-hidden
													/>
												)}
												{accepting ? "Joining…" : "Accept"}
											</Button>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
												disabled={busy}
												onClick={() => handleDecline(req)}
											>
												{declining ? (
													<Loader2
														className="mr-1.5 h-4 w-4 animate-spin"
														aria-hidden
													/>
												) : (
													<X
														className="mr-1.5 h-4 w-4"
														aria-hidden
													/>
												)}
												{declining ? "Declining…" : "Decline"}
											</Button>
										</div>
									</li>
								);
							})}
						</ul>

						<div className="hidden overflow-x-auto lg:block">
							<Table>
								<TableHeader>
									<TableRow className="border-border/50 hover:bg-transparent">
										<TableHead className="pl-4">
											Requested by
										</TableHead>
										<TableHead>Project</TableHead>
										<TableHead className="pr-4 text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{projectMemberRequests.map((req) => {
										const requestedByProfile =
											getAllProfilesFromStore().find(
												(p) =>
													p.id === req.requestedBy,
											);
										const busy = isProcessing(req.id);
										const accepting =
											busy && processingAction === "accept";
										const declining =
											busy && processingAction === "decline";
										return (
											<TableRow
												key={req.id}
												className="border-border/40"
											>
												<TableCell className="pl-4">
													{requestedByProfile?.name ??
														"N/A"}
												</TableCell>
												<TableCell className="font-medium">
													{req.requestData.projectName}
												</TableCell>
												<TableCell className="pr-4">
													<div className="flex justify-end gap-2">
														<Button
															type="button"
															variant="secondary"
															size="sm"
															disabled={busy}
															onClick={() =>
																handleAccept(req)
															}
														>
															{accepting ? (
																<Loader2
																	className="mr-1 h-4 w-4 animate-spin"
																	aria-hidden
																/>
															) : (
																<Check
																	className="mr-1 h-4 w-4"
																	aria-hidden
																/>
															)}
															{accepting
																? "Joining…"
																: "Accept"}
														</Button>
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="border-destructive/30 text-destructive hover:bg-destructive/10"
															disabled={busy}
															onClick={() =>
																handleDecline(req)
															}
														>
															{declining ? (
																<Loader2
																	className="mr-1 h-4 w-4 animate-spin"
																	aria-hidden
																/>
															) : (
																<X
																	className="mr-1 h-4 w-4"
																	aria-hidden
																/>
															)}
															{declining
																? "Declining…"
																: "Decline"}
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</>
				) : (
					<div className="flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center">
						<Inbox
							className="h-10 w-10 text-muted-foreground/60"
							aria-hidden
						/>
						<p className="text-sm text-muted-foreground">
							No pending invitations
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ProjectMemberRequests;
