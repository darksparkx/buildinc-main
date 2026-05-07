"use client";

import { useRequestStore } from "@/lib/store/requestStore";
import { IRequest, requestType } from "@/lib/types";

/** Pending approvals of these types for the same task block task completion (P1.10). */
const WORKFLOW_TYPES_BLOCKING_COMPLETION: readonly requestType[] = [
	"MaterialRequest",
	"PaymentRequest",
	"TaskAssignment",
];

function completionBlockerLabel(type: requestType): string {
	switch (type) {
		case "MaterialRequest":
			return "material";
		case "PaymentRequest":
			return "payment";
		case "TaskAssignment":
			return "assignment";
		default:
			return type;
	}
}

/** Other pending workflow requests for this task (excludes the completion request being approved). */
export function getPendingTaskWorkflowBlockersForCompletion(
	completionRequest: IRequest,
): IRequest[] {
	const taskId = completionRequest.taskId;
	if (!taskId) return [];

	return Object.values(useRequestStore.getState().requests).filter(
		(r) =>
			r.taskId === taskId &&
			r.id !== completionRequest.id &&
			r.status === "Pending" &&
			WORKFLOW_TYPES_BLOCKING_COMPLETION.includes(r.type),
	);
}

export function describeCompletionBlockers(blockers: IRequest[]): string {
	const kinds = [
		...new Set(blockers.map((b) => completionBlockerLabel(b.type))),
	].sort();
	return kinds.join(", ");
}
