"use client";

import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import { handleAssigment, handleReject } from "@/lib/functions/requests";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { useProfileStore } from "@/lib/store/profileStore";
import { IRequest } from "@/lib/types";
import { Check, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function TaskAssignmentRequests({
	requests,
	profileId,
}: {
	requests: IRequest[];
	profileId: string;
}) {
	const profile = useProfileStore((s) => s.profile);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [processingAction, setProcessingAction] = useState<
		"accept" | "decline" | null
	>(null);

	const assignmentRequests = useMemo(
		() =>
			requests.filter(
				(req) =>
					req.type === "TaskAssignment" &&
					req.status === "Pending" &&
					String(req.requestedTo) === profileId,
			),
		[requests, profileId],
	);

	if (assignmentRequests.length === 0) return null;

	const isProcessing = (reqId: string) => processingId === reqId;

	const handleAccept = async (req: IRequest) => {
		setProcessingId(req.id);
		setProcessingAction("accept");
		try {
			await handleAssigment(req, profile);
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Could not accept this assignment.",
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
			await handleReject(req, profile);
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Could not decline this assignment.",
			);
		} finally {
			setProcessingId(null);
			setProcessingAction(null);
		}
	};

	return (
		<section className="space-y-4">
			<h2 className="text-lg font-semibold tracking-tight">
				Task assignments
			</h2>
			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
				<CardHeader className="space-y-1 pb-4 sm:pb-6">
					<CardTitle className="text-lg sm:text-xl">
						Pending assignments
					</CardTitle>
					<CardDescription>
						Accept or decline tasks assigned to you.
					</CardDescription>
				</CardHeader>
				<CardContent className="pb-6">
					<ul className="space-y-3 lg:hidden">
						{assignmentRequests.map((req) => {
							const requestedByProfile =
								getAllProfilesFromStore().find(
									(p) => p.id === req.requestedBy,
								) ?? req.requestedByProfile;
							const taskName =
								req.task?.name?.trim() || "Task assignment";
							const projectName =
								req.project?.name?.trim() || "—";
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
									<p className="font-medium">{taskName}</p>
									<p className="mt-1 text-sm text-muted-foreground">
										{projectName}
										{" · "}
										From{" "}
										<span className="text-foreground">
											{requestedByProfile?.name ?? "Unknown"}
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
											{accepting ? "Accepting…" : "Accept"}
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
									<TableHead className="pl-4">Task</TableHead>
									<TableHead>Project</TableHead>
									<TableHead>Assigned by</TableHead>
									<TableHead className="pr-4 text-right">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{assignmentRequests.map((req) => {
									const requestedByProfile =
										getAllProfilesFromStore().find(
											(p) => p.id === req.requestedBy,
										) ?? req.requestedByProfile;
									const taskName =
										req.task?.name?.trim() || "Task assignment";
									const projectName =
										req.project?.name?.trim() || "—";
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
											<TableCell className="pl-4 font-medium">
												{taskName}
											</TableCell>
											<TableCell>{projectName}</TableCell>
											<TableCell>
												{requestedByProfile?.name ?? "N/A"}
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
															? "Accepting…"
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
				</CardContent>
			</Card>
		</section>
	);
}
