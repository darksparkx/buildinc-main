"use client";

import { Avatar, AvatarFallback } from "@/components/base/ui/avatar";
import { Badge } from "@/components/base/ui/badge";
import { cn, RupeeIcon } from "@/lib/functions/utils";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { IRequest, requestType } from "@/lib/types";
import React from "react";

function requestTypeLabel(type: requestType): string {
	switch (type) {
		case "MaterialRequest":
			return "Material";
		case "PaymentRequest":
			return "Payment";
		case "TaskCompletion":
			return "Task completion";
		case "TaskAssignment":
			return "Task assignment";
		case "JoinOrganisation":
			return "Join organisation";
		case "JoinProject":
			return "Join project";
		default:
			return type;
	}
}

function itemSummary(request: IRequest): string {
	const rd = request.requestData;
	if (request.type === "MaterialRequest" && rd.materialName) {
		return `${rd.materialName} (${rd.units ?? 0} ${rd.unitName ?? ""})`.trim();
	}
	if (request.type === "PaymentRequest") {
		return rd.description || rd.reason || "Payment request";
	}
	if (request.type === "TaskCompletion") {
		return request.task?.name || rd.completionNotes || "Task completion";
	}
	if (request.type === "TaskAssignment") {
		return request.task?.name || rd.description || "Task assignment";
	}
	if (request.type === "JoinOrganisation") {
		return rd.organisationName || "Organisation request";
	}
	if (request.type === "JoinProject") {
		return rd.projectName || "Project request";
	}
	return "—";
}

function amountLine(request: IRequest): React.ReactNode {
	const rd = request.requestData;
	if (request.type === "PaymentRequest" && rd.amount != null) {
		return (
			<span className="inline-flex items-center gap-0.5 font-medium tabular-nums text-foreground">
				{rd.amount.toLocaleString("en-IN")}
				<RupeeIcon />
			</span>
		);
	}
	if (request.type === "MaterialRequest") {
		const u = rd.units ?? 0;
		const c = rd.unitCost ?? 0;
		const total = u * c;
		return (
			<span className="inline-flex items-center gap-0.5 font-medium tabular-nums text-foreground">
				{total.toLocaleString("en-IN")}
				<RupeeIcon />
			</span>
		);
	}
	return <span className="text-muted-foreground">—</span>;
}

const SECTION_SURFACE: Record<
	"pending" | "approved" | "rejected",
	string
> = {
	pending:
		"border-amber-500/25 bg-amber-500/[0.06] hover:bg-amber-500/10 dark:bg-amber-950/20",
	approved:
		"border-emerald-500/25 bg-emerald-500/[0.06] hover:bg-emerald-500/10 dark:bg-emerald-950/20",
	rejected:
		"border-rose-500/25 bg-rose-500/[0.06] hover:bg-rose-500/10 dark:bg-rose-950/20",
};

const ApprovalTable = ({
	data,
	variant,
	setSelectedApproval,
	setIsDetailDialogOpen,
}: {
	data: IRequest[];
	variant: "pending" | "approved" | "rejected";
	setSelectedApproval: (request: IRequest) => void;
	setIsDetailDialogOpen: (open: boolean) => void;
}) => {
	const surface = SECTION_SURFACE[variant];

	const openDetailDialog = (request: IRequest) => {
		setSelectedApproval(request);
		setIsDetailDialogOpen(true);
	};

	return (
		<ul className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 lg:grid-cols-3">
			{data.map((request) => {
				const name =
					request.requestedByProfile?.name?.trim() || "Unknown";
				const initial = name.charAt(0).toUpperCase() || "?";

				return (
					<li key={request.id} className="flex min-h-0 min-w-0">
						<button
							type="button"
							className={cn(
								"flex h-full min-h-0 w-full flex-col rounded-xl border p-5 text-left shadow-sm transition-colors",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								surface,
							)}
							onClick={() => openDetailDialog(request)}
						>
							<div className="flex min-h-0 flex-1 flex-col gap-4">
								<Badge variant="outline" className="w-fit font-normal text-[11px] uppercase tracking-wide">
									{requestTypeLabel(request.type)}
								</Badge>

								<div className="min-w-0 space-y-1.5">
									<p className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
										{itemSummary(request)}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{request.project?.name?.trim() || "No project"}
									</p>
								</div>

								<div className="mt-auto border-t border-border/50 pt-4">
									<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
										Requested by
									</p>
									<div className="mt-2 flex items-center gap-2.5">
										<Avatar className="h-9 w-9 ring-1 ring-border/50">
											<AvatarFallback className="text-xs font-medium">{initial}</AvatarFallback>
										</Avatar>
										<span className="min-w-0 truncate text-sm font-medium text-foreground">
											{name}
										</span>
									</div>

									<dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
										<div className="min-w-0 space-y-0.5">
											<dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
												Amount
											</dt>
											<dd className="flex items-center gap-1 tabular-nums text-foreground">
												{amountLine(request)}
											</dd>
										</div>
										<div className="min-w-0 space-y-0.5">
											<dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
												Submitted
											</dt>
											<dd className="font-medium tabular-nums text-foreground">
												{formatCalendarDate(request.created_at)}
											</dd>
										</div>
									</dl>
								</div>
							</div>
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export default ApprovalTable;
