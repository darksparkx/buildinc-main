import type { IRequest, requestType } from "@/lib/types";
import {
	currentAndPreviousWindows,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";

/** Pending longer than 48 hours — warning threshold. */
export const APPROVAL_SLA_WARNING_MS = 48 * 60 * 60 * 1000;
/** Pending longer than 7 days — critical threshold. */
export const APPROVAL_SLA_CRITICAL_MS = 7 * 24 * 60 * 60 * 1000;

export type ApprovalSlaSnapshot = {
	pendingCount: number;
	avgPendingMs: number | null;
	medianPendingMs: number | null;
	oldestPendingMs: number | null;
	pendingOverWarning: number;
	pendingOverCritical: number;
	/** Resolved (approved or rejected) in the current period window. */
	resolvedInPeriod: number;
	avgResolutionMsInPeriod: number | null;
	resolvedPreviousPeriod: number;
	avgResolutionMsPreviousPeriod: number | null;
};

export type ApprovalTypeSlaRow = {
	type: requestType;
	label: string;
	pendingCount: number;
	avgPendingMs: number | null;
	oldestPendingMs: number | null;
};

export function requestTypeLabel(type: requestType): string {
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

export function formatPendingDuration(ms: number): string {
	if (ms < 60 * 60 * 1000) {
		const m = Math.max(1, Math.round(ms / (60 * 1000)));
		return `${m} min`;
	}
	if (ms < 48 * 60 * 60 * 1000) {
		const h = Math.round(ms / (60 * 60 * 1000));
		return `${h} hr${h !== 1 ? "s" : ""}`;
	}
	const d = Math.round(ms / (24 * 60 * 60 * 1000));
	return `${d} day${d !== 1 ? "s" : ""}`;
}

function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid];
}

function pendingDurationMs(request: IRequest, now: Date): number {
	const created = new Date(request.created_at).getTime();
	return Math.max(0, now.getTime() - created);
}

function resolutionDurationMs(request: IRequest): number | null {
	if (request.status === "Pending" || !request.approvedAt) return null;
	const created = new Date(request.created_at).getTime();
	const resolved = new Date(request.approvedAt).getTime();
	return Math.max(0, resolved - created);
}

function isResolvedInWindow(
	request: IRequest,
	window: { start: Date; end: Date },
): boolean {
	if (request.status === "Pending" || !request.approvedAt) return false;
	const t = new Date(request.approvedAt).getTime();
	return t >= window.start.getTime() && t <= window.end.getTime();
}

function computePendingMetrics(pending: IRequest[], now: Date) {
	const durations = pending.map((r) => pendingDurationMs(r, now));
	const avgPendingMs =
		durations.length === 0
			? null
			: Math.round(
					durations.reduce((a, b) => a + b, 0) / durations.length,
				);
	return {
		pendingCount: pending.length,
		avgPendingMs,
		medianPendingMs: median(durations),
		oldestPendingMs:
			durations.length === 0 ? null : Math.max(...durations),
		pendingOverWarning: durations.filter(
			(d) => d >= APPROVAL_SLA_WARNING_MS,
		).length,
		pendingOverCritical: durations.filter(
			(d) => d >= APPROVAL_SLA_CRITICAL_MS,
		).length,
	};
}

function avgResolutionForPeriod(
	requests: IRequest[],
	window: { start: Date; end: Date } | null,
): { count: number; avgMs: number | null } {
	if (!window) return { count: 0, avgMs: null };
	const resolved = requests.filter((r) => isResolvedInWindow(r, window));
	const durations = resolved
		.map(resolutionDurationMs)
		.filter((d): d is number => d != null);
	return {
		count: resolved.length,
		avgMs:
			durations.length === 0
				? null
				: Math.round(
						durations.reduce((a, b) => a + b, 0) / durations.length,
					),
	};
}

export function computeApprovalSlaSnapshot(
	requests: IRequest[],
	timeRange: StatisticsTimeRange = "30d",
	now = new Date(),
): ApprovalSlaSnapshot {
	const pending = requests.filter((r) => r.status === "Pending");
	const pendingMetrics = computePendingMetrics(pending, now);

	const { current, previous } = currentAndPreviousWindows(timeRange, now);
	const currentResolved = avgResolutionForPeriod(requests, current);
	const previousResolved = avgResolutionForPeriod(requests, previous);

	return {
		...pendingMetrics,
		resolvedInPeriod: currentResolved.count,
		avgResolutionMsInPeriod: currentResolved.avgMs,
		resolvedPreviousPeriod: previousResolved.count,
		avgResolutionMsPreviousPeriod: previousResolved.avgMs,
	};
}

export function computeApprovalTypeSlaRows(
	requests: IRequest[],
	now = new Date(),
): ApprovalTypeSlaRow[] {
	const pending = requests.filter((r) => r.status === "Pending");
	const byType = new Map<
		requestType,
		{ pendingCount: number; durations: number[] }
	>();

	for (const r of pending) {
		const existing = byType.get(r.type) ?? {
			pendingCount: 0,
			durations: [],
		};
		existing.pendingCount += 1;
		existing.durations.push(pendingDurationMs(r, now));
		byType.set(r.type, existing);
	}

	return [...byType.entries()]
		.map(([type, v]) => ({
			type,
			label: requestTypeLabel(type),
			pendingCount: v.pendingCount,
			avgPendingMs:
				v.durations.length === 0
					? null
					: Math.round(
							v.durations.reduce((a, b) => a + b, 0) /
								v.durations.length,
						),
			oldestPendingMs:
				v.durations.length === 0 ? null : Math.max(...v.durations),
		}))
		.sort((a, b) => b.pendingCount - a.pendingCount);
}

export function filterRequestsForProjects(
	requests: IRequest[],
	projectIds: Set<string>,
): IRequest[] {
	return requests.filter(
		(r) => r.projectId != null && projectIds.has(r.projectId),
	);
}
