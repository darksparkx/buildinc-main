"use client";

import { SummaryCard } from "@/components/base/general/SummaryCard";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import {
	formatPendingDuration,
	type ApprovalSlaSnapshot,
	type ApprovalTypeSlaRow,
} from "@/lib/statistics/approvalSnapshot";
import {
	formatPeriodComparison,
	periodCompletionCaption,
} from "@/lib/statistics/periodComparison";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";
import { Clock, Inbox } from "lucide-react";

const shell =
	"border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm";

type Props = {
	snapshot: ApprovalSlaSnapshot;
	typeRows: ApprovalTypeSlaRow[];
	timeRange: StatisticsTimeRange;
};

export default function ApprovalSlaSection({
	snapshot,
	typeRows,
	timeRange,
}: Props) {
	const showPeriodCompare = timeRange !== "all";
	const {
		pendingCount,
		avgPendingMs,
		oldestPendingMs,
		pendingOverWarning,
		pendingOverCritical,
		resolvedInPeriod,
		avgResolutionMsInPeriod,
		resolvedPreviousPeriod,
		avgResolutionMsPreviousPeriod,
	} = snapshot;

	if (pendingCount === 0 && typeRows.length === 0 && resolvedInPeriod === 0) {
		return (
			<section className="space-y-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Approval turnaround
					</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						How long requests sit pending and how fast they were resolved in
						the selected period.
					</p>
				</div>
				<p className="rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-border/40">
					No approval requests in this view yet.
				</p>
			</section>
		);
	}

	const pendingContent =
		pendingCount === 0 ? (
			<span className="text-muted-foreground">None pending</span>
		) : (
			<div className="space-y-1 text-left">
				<span className="tabular-nums">{pendingCount} open</span>
				{avgPendingMs != null ? (
					<p className="text-xs font-medium text-muted-foreground">
						Avg waiting{" "}
						<span className="tabular-nums text-foreground">
							{formatPendingDuration(avgPendingMs)}
						</span>
						{oldestPendingMs != null ? (
							<span className="block pt-0.5">
								Oldest{" "}
								<span className="tabular-nums text-foreground">
									{formatPendingDuration(oldestPendingMs)}
								</span>
							</span>
						) : null}
					</p>
				) : null}
				{pendingOverWarning > 0 || pendingOverCritical > 0 ? (
					<p className="text-xs text-amber-800 dark:text-amber-300">
						{pendingOverCritical > 0
							? `${pendingOverCritical} over 7 days`
							: null}
						{pendingOverCritical > 0 && pendingOverWarning > 0
							? " · "
							: null}
						{pendingOverWarning > 0
							? `${pendingOverWarning} over 48 hours`
							: null}
					</p>
				) : null}
			</div>
		);

	const resolutionContent =
		showPeriodCompare && avgResolutionMsInPeriod != null ? (
			<div className="space-y-1 text-left">
				<span className="tabular-nums">
					{formatPendingDuration(avgResolutionMsInPeriod)}
				</span>
				<span className="text-lg font-semibold text-muted-foreground">
					{" "}
					avg to resolve
				</span>
				<p className="text-xs font-medium text-muted-foreground">
					<span className="tabular-nums text-foreground">
						{resolvedInPeriod}
					</span>{" "}
					resolved {periodCompletionCaption(timeRange)}
					{avgResolutionMsPreviousPeriod != null ? (
						<span className="block pt-0.5 tabular-nums text-foreground/90">
							{formatPeriodComparison(
								avgResolutionMsInPeriod,
								avgResolutionMsPreviousPeriod,
								{
									formatDelta: (d) => formatPendingDuration(Math.abs(d)),
								},
							)}
						</span>
					) : resolvedPreviousPeriod > 0 ? (
						<span className="block pt-0.5 text-muted-foreground">
							No prior-period baseline for average time.
						</span>
					) : null}
				</p>
			</div>
		) : showPeriodCompare ? (
			<p className="text-sm text-muted-foreground">
				<span className="tabular-nums text-foreground">
					{resolvedInPeriod}
				</span>{" "}
				resolved {periodCompletionCaption(timeRange)}
			</p>
		) : null;

	return (
		<section className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold tracking-tight">
					Approval turnaround
				</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					Pending queue age (48h / 7d thresholds) and average resolution time
					for requests closed in the selected period.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<SummaryCard
					title="Pending approvals"
					content={pendingContent}
					icon={
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-300">
							<Inbox className="h-5 w-5" aria-hidden />
						</span>
					}
					className={shell}
				/>
				{showPeriodCompare ? (
					<SummaryCard
						title="Resolution time"
						content={resolutionContent ?? "—"}
						icon={
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-800 ring-1 ring-orange-500/25 dark:text-orange-300">
								<Clock className="h-5 w-5" aria-hidden />
							</span>
						}
						className={shell}
					/>
				) : null}
			</div>

			{typeRows.length > 0 ? (
				<div className="rounded-xl border border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
					<div className="border-b border-border/50 px-4 py-3 sm:px-5">
						<h3 className="text-base font-semibold tracking-tight">
							Pending by request type
						</h3>
					</div>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">Open</TableHead>
									<TableHead className="text-right">Avg waiting</TableHead>
									<TableHead className="text-right">Oldest</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{typeRows.map((row) => (
									<TableRow key={row.type}>
										<TableCell className="font-medium">
											{row.label}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{row.pendingCount}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{row.avgPendingMs != null
												? formatPendingDuration(row.avgPendingMs)
												: "—"}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{row.oldestPendingMs != null
												? formatPendingDuration(row.oldestPendingMs)
												: "—"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			) : null}
		</section>
	);
}
