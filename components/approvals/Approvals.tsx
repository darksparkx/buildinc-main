"use client";

import { TabsTriggerList } from "@/components/base/general/TabsTriggerList";
import { SummaryCard } from "@/components/base/general/SummaryCard";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { useUrlQueryTab } from "@/lib/hooks/useUrlQueryTab";
import { useProfileStore } from "@/lib/store/profileStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { IRequest } from "@/lib/types";
import { ClipboardCheck, Clock, ShieldX, ThumbsUp } from "lucide-react";
import { Suspense, useState } from "react";
import { Tabs } from "../base/ui/tabs";
import ApprovalModal from "./ApprovalModal";
import Approved from "./Approved";
import Pending from "./Pending";
import Rejected from "./Rejected";

const APPROVAL_TABS = ["pending", "approved", "rejected"] as const;

function ApprovalsTabbed({
	pendingApprovals,
	approvedApprovals,
	rejectedApprovals,
	setIsDetailDialogOpen,
	setSelectedApproval,
}: {
	pendingApprovals: IRequest[];
	approvedApprovals: IRequest[];
	rejectedApprovals: IRequest[];
	setIsDetailDialogOpen: (open: boolean) => void;
	setSelectedApproval: (r: IRequest | null) => void;
}) {
	const [activeTab, setTab] = useUrlQueryTab(APPROVAL_TABS, "pending");

	return (
		<Tabs value={activeTab} onValueChange={setTab} className="w-full">
			<TabsTriggerList
				triggers={[
					{
						value: "pending",
						label: "Pending",
						count: pendingApprovals.length,
					},
					{
						value: "approved",
						label: "Approved",
						count: approvedApprovals.length,
					},
					{
						value: "rejected",
						label: "Rejected",
						count: rejectedApprovals.length,
					},
				]}
			/>

			<Pending
				pendingApprovals={pendingApprovals}
				setIsDetailDialogOpen={setIsDetailDialogOpen}
				setSelectedApproval={setSelectedApproval}
			/>

			<Approved
				approvedApprovals={approvedApprovals}
				setIsDetailDialogOpen={setIsDetailDialogOpen}
				setSelectedApproval={setSelectedApproval}
			/>

			<Rejected
				rejectedApprovals={rejectedApprovals}
				setIsDetailDialogOpen={setIsDetailDialogOpen}
				setSelectedApproval={setSelectedApproval}
			/>
		</Tabs>
	);
}

export default function Approvals({ admin: _admin }: { admin: boolean }) {
	const { requests } = useRequestStore();
	const { profile } = useProfileStore();
	const [selectedApproval, setSelectedApproval] = useState<IRequest | null>(
		null,
	);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [comment, setComment] = useState("");

	const filteredRequests = Object.values(requests);
	const pendingApprovals = filteredRequests.filter((a) => a.status === "Pending");
	const approvedApprovals = filteredRequests.filter(
		(a) => a.status === "Approved",
	);
	const rejectedApprovals = filteredRequests.filter(
		(a) => a.status === "Rejected",
	);

	const total = filteredRequests.length;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex items-start gap-3">
								<span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 lg:inline-flex">
									<ClipboardCheck className="h-5 w-5" aria-hidden />
								</span>
								<div className="min-w-0">
									<h1 className="hidden text-2xl font-semibold tracking-tight lg:block lg:text-3xl">
										Approvals
									</h1>
									<p className="max-w-xl text-sm text-muted-foreground lg:mt-1 sm:text-base">
										Review payment, material, and task requests from your team.
									</p>
								</div>
							</div>
						</div>
						<p className="text-sm text-muted-foreground tabular-nums sm:text-right">
							{total} total
						</p>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
						<SummaryCard
							className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							title="Pending"
							content={pendingApprovals.length.toLocaleString()}
							icon={
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-400">
									<Clock className="h-5 w-5" aria-hidden />
								</span>
							}
						/>
						<SummaryCard
							className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							title="Approved"
							content={approvedApprovals.length.toLocaleString()}
							icon={
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-400">
									<ThumbsUp className="h-5 w-5" aria-hidden />
								</span>
							}
						/>
						<SummaryCard
							className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
							title="Rejected"
							content={rejectedApprovals.length.toLocaleString()}
							icon={
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/25 dark:text-rose-400">
									<ShieldX className="h-5 w-5" aria-hidden />
								</span>
							}
						/>
					</div>
				</header>

				<Suspense fallback={<LoadingSpinner />}>
					<ApprovalsTabbed
						pendingApprovals={pendingApprovals}
						approvedApprovals={approvedApprovals}
						rejectedApprovals={rejectedApprovals}
						setIsDetailDialogOpen={setIsDetailDialogOpen}
						setSelectedApproval={setSelectedApproval}
					/>
				</Suspense>

				<ApprovalModal
					isDetailDialogOpen={isDetailDialogOpen}
					setIsDetailDialogOpen={setIsDetailDialogOpen}
					selectedApproval={selectedApproval}
					setComment={setComment}
					comment={comment}
					profile={profile}
				/>
			</div>
		</div>
	);
}
