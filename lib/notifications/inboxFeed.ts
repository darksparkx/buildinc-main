import type { IRequest } from "@/lib/types";

/**
 * Inbox UX (see P1.1, `InboxBell`): tabs — Inbox | Sent | History — same three buckets as before.
 *
 * Alternatives if you want to change later:
 * — Section headers in one scroll instead of tabs (previous layout).
 * — Single chronological list with a small filter chip row (All | Action | Sent).
 * — Add task-level rows (e.g. task moved to Reviewing without a request row) by querying `tasks`
 *   where assignee or supervisor matches the user; keep request-backed events as the source of truth until then.
 */

export type InboxSectionKey = "actionRequired" | "waitingOnOthers" | "recent";

export type InboxSections = Record<
	InboxSectionKey,
	IRequest[]
>;

function sortByNewest(a: IRequest, b: IRequest): number {
	const ta = new Date(
		a.status !== "Pending" && a.approvedAt
			? a.approvedAt
			: a.created_at,
	).getTime();
	const tb = new Date(
		b.status !== "Pending" && b.approvedAt
			? b.approvedAt
			: b.created_at,
	).getTime();
	return tb - ta;
}

const RECENT_LIMIT = 12;

export function partitionInboxRequests(
	userId: string,
	requests: IRequest[],
): InboxSections {
	const actionRequired: IRequest[] = [];
	const waitingOnOthers: IRequest[] = [];
	const recent: IRequest[] = [];

	for (const r of requests) {
		const toMe = String(r.requestedTo) === userId;
		const fromMe = r.requestedBy === userId;

		if (r.status === "Pending") {
			if (toMe) actionRequired.push(r);
			else if (fromMe) waitingOnOthers.push(r);
			continue;
		}

		if (
			(r.status === "Approved" || r.status === "Rejected") &&
			(toMe || fromMe)
		) {
			recent.push(r);
		}
	}

	actionRequired.sort(sortByNewest);
	waitingOnOthers.sort(sortByNewest);
	recent.sort(sortByNewest);

	return {
		actionRequired,
		waitingOnOthers,
		recent: recent.slice(0, RECENT_LIMIT),
	};
}

export function inboxActionRequiredCount(
	userId: string,
	requests: IRequest[],
): number {
	return requests.filter(
		(r) =>
			r.status === "Pending" && String(r.requestedTo) === userId,
	).length;
}

export function inboxItemTitle(req: IRequest): string {
	switch (req.type) {
		case "MaterialRequest":
			return req.requestData.materialName
				? `Material: ${req.requestData.materialName}`
				: "Material request";
		case "PaymentRequest":
			return "Payment request";
		case "TaskAssignment":
			return req.task?.name
				? `Task assignment · ${req.task.name}`
				: "Task assignment";
		case "TaskCompletion":
			return req.task?.name
				? `Task completion · ${req.task.name}`
				: "Task completion";
		case "JoinOrganisation":
			return req.requestData.organisationName
				? `Organisation invite · ${req.requestData.organisationName}`
				: "Organisation invitation";
		case "JoinProject":
			return req.requestData.projectName
				? `Project invite · ${req.requestData.projectName}`
				: "Project invitation";
		default:
			return "Request";
	}
}

export function inboxItemSubtitle(req: IRequest, viewerId: string): string {
	const project = req.project?.name ?? "";
	const toMe = String(req.requestedTo) === viewerId;
	const fromMe = req.requestedBy === viewerId;

	let line = "";
	if (toMe && !fromMe) {
		line =
			req.requestedByProfile?.name != null &&
			req.requestedByProfile.name !== ""
				? `From ${req.requestedByProfile.name}`
				: "Needs your response";
	} else if (fromMe && !toMe) {
		line =
			req.requestedToProfile?.name != null &&
			req.requestedToProfile.name !== ""
				? `Waiting on ${req.requestedToProfile.name}`
				: "Awaiting response";
	} else if (fromMe && toMe) {
		line = "Your request";
	}

	if (req.type === "JoinOrganisation" || req.type === "JoinProject") {
		if (!line) line = "Invitation";
	}

	const parts = [line, project].filter(Boolean);
	return parts.length > 0 ? parts.join(" · ") : "—";
}
