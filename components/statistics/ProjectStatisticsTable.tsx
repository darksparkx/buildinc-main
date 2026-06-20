"use client";

import { Badge } from "@/components/base/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import type { ProjectStatisticRow } from "@/lib/statistics/ownerSnapshot";
import { formatPeriodComparison } from "@/lib/statistics/periodComparison";
import {
	STATISTICS_TIME_RANGE_LABELS,
	type StatisticsTimeRange,
} from "@/lib/statistics/timeRange";
import { cn } from "@/lib/functions/utils";
import Link from "next/link";

function statusVariant(
	status: string | undefined,
):
	| "active"
	| "reviewing"
	| "inactive"
	| "pending"
	| "completed"
	| "secondary" {
	if (!status) return "secondary";
	const s = status.toLowerCase();
	if (
		s === "active" ||
		s === "reviewing" ||
		s === "inactive" ||
		s === "pending" ||
		s === "completed"
	) {
		return s;
	}
	return "secondary";
}

function formatMoney(amount: number) {
	return amount.toLocaleString("en-IN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

function pctOrDash(value: number | null) {
	if (value === null) return "—";
	return `${value}%`;
}

type Props = {
	rows: ProjectStatisticRow[];
	orgNameById: Record<string, string>;
	timeRange: StatisticsTimeRange;
};

function periodColumnLabel(timeRange: StatisticsTimeRange): string {
	if (timeRange === "all") return "Completed (all)";
	return `Completed (${STATISTICS_TIME_RANGE_LABELS[timeRange].replace(/^Last /i, "")})`;
}

export default function ProjectStatisticsTable({
	rows,
	orgNameById,
	timeRange,
}: Props) {
	const periodLabel = periodColumnLabel(timeRange);
	const showSqft = rows.some((r) => r.totalSqft > 0);
	if (rows.length === 0) {
		return (
			<p className="rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-border/40">
				No projects to show yet. Projects you can access will appear here with
				task and spend rollups.
			</p>
		);
	}

	return (
		<div className="rounded-xl border border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm overflow-hidden">
			<div className="border-b border-border/50 px-4 py-3">
				<h2 className="text-lg font-semibold tracking-tight">
					Project statistics
				</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					Per-project rollups · open a project for its Statistics tab.
				</p>
			</div>
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="whitespace-normal min-w-[10rem]">
							Project
						</TableHead>
						<TableHead className="whitespace-nowrap">Status</TableHead>
						<TableHead className="whitespace-nowrap text-right">
							Tasks
						</TableHead>
						<TableHead className="whitespace-nowrap text-right hidden sm:table-cell">
							Overdue
						</TableHead>
						<TableHead className="whitespace-nowrap text-right hidden md:table-cell">
							{periodLabel}
						</TableHead>
						{showSqft ? (
							<TableHead className="whitespace-nowrap text-right hidden xl:table-cell">
								₹/sqft
							</TableHead>
						) : null}
						<TableHead className="whitespace-nowrap text-right hidden lg:table-cell">
							Budget use
						</TableHead>
						<TableHead className="whitespace-nowrap text-right hidden lg:table-cell">
							Task plan use
						</TableHead>
						<TableHead className="whitespace-nowrap text-right hidden sm:table-cell">
							Pending
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => {
						const orgName = row.orgId ? orgNameById[row.orgId] : "";
						const taskLine =
							row.taskInventoryCount === 0 ? (
								<span className="text-muted-foreground">—</span>
							) : (
								<span className="tabular-nums">
									{row.taskCompletedCount}/{row.taskInventoryCount}
									{row.completionRatePercent != null ? (
										<span className="text-muted-foreground">
											{" "}
											({row.completionRatePercent}%)
										</span>
									) : null}
								</span>
							);
						const budgetTitle = `Spent ${formatMoney(row.spent)} of budget ${formatMoney(row.budget)}`;
						const taskTitle = `Task spend ${formatMoney(row.taskSpentTotal)} of planned ${formatMoney(row.taskPlannedTotal)}`;
						const statsHref =
							timeRange === "30d"
								? `/projects/${row.projectId}?tab=statistics`
								: `/projects/${row.projectId}?tab=statistics&range=${timeRange}`;

						return (
							<TableRow key={row.projectId}>
								<TableCell className="font-medium align-top">
									<Link
										href={statsHref}
										className={cn(
											"group block max-w-[16rem]",
											"text-primary underline-offset-4 hover:underline",
										)}
									>
										<span className="truncate group-hover:text-primary">
											{row.name}
										</span>
									</Link>
									{orgName ? (
										<p className="mt-0.5 truncate text-xs font-normal text-muted-foreground">
											{orgName}
										</p>
									) : null}
									<dl className="mt-2 space-y-0.5 font-normal lg:hidden">
										<div className="flex justify-between gap-2 text-xs text-muted-foreground sm:hidden">
											<dt>Overdue</dt>
											<dd className="tabular-nums text-foreground">
												{row.overdueCount}
											</dd>
										</div>
										<div className="flex justify-between gap-2 text-xs text-muted-foreground md:hidden">
											<dt>{periodLabel}</dt>
											<dd className="tabular-nums text-foreground">
												{row.completionsInPeriod}
											</dd>
										</div>
										<div className="flex justify-between gap-2 text-xs text-muted-foreground lg:hidden">
											<dt>Budget use</dt>
											<dd
												className="tabular-nums text-foreground"
												title={budgetTitle}
											>
												{pctOrDash(row.projectSpendVsBudgetPercent)}
											</dd>
										</div>
										<div className="flex justify-between gap-2 text-xs text-muted-foreground lg:hidden">
											<dt>Task plan use</dt>
											<dd
												className="tabular-nums text-foreground"
												title={taskTitle}
											>
												{pctOrDash(row.taskSpendVsPlannedPercent)}
											</dd>
										</div>
										<div className="flex justify-between gap-2 text-xs text-muted-foreground sm:hidden">
											<dt>Open approvals</dt>
											<dd className="tabular-nums text-foreground">
												{row.pendingApprovals}
											</dd>
										</div>
									</dl>
								</TableCell>
								<TableCell className="align-top">
									<Badge variant={statusVariant(row.status)} className="text-[11px]">
										{row.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right align-top tabular-nums">
									{taskLine}
								</TableCell>
								<TableCell className="text-right align-top tabular-nums hidden sm:table-cell">
									{row.overdueCount}
								</TableCell>
								<TableCell className="text-right align-top tabular-nums hidden md:table-cell">
									{timeRange === "all" ? (
										row.completionsInPeriod
									) : (
										<span className="inline-flex flex-col items-end gap-0.5">
											<span>{row.completionsInPeriod}</span>
											<span className="text-[11px] font-normal text-muted-foreground">
												{formatPeriodComparison(
													row.completionsInPeriod,
													row.completionsPreviousPeriod,
												)}
											</span>
										</span>
									)}
								</TableCell>
								{showSqft ? (
									<TableCell className="text-right align-top tabular-nums hidden xl:table-cell">
										{row.totalSqft > 0 ? (
											<span className="inline-flex flex-col items-end gap-0.5">
												<span>
													{row.plannedBudgetPerSqft != null
														? `${row.plannedBudgetPerSqft.toLocaleString("en-IN")} planned`
														: "—"}
												</span>
												{row.actualSpendPerSqft != null ? (
													<span className="text-[11px] font-normal text-muted-foreground">
														{row.actualSpendPerSqft.toLocaleString("en-IN")}{" "}
														actual
													</span>
												) : null}
												<span className="text-[11px] font-normal text-muted-foreground">
													{row.totalSqft.toLocaleString("en-IN")} sqft
												</span>
											</span>
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</TableCell>
								) : null}
								<TableCell
									className="text-right align-top tabular-nums hidden lg:table-cell"
									title={budgetTitle}
								>
									<span className="inline-flex flex-col items-end gap-0.5">
										<span>{pctOrDash(row.projectSpendVsBudgetPercent)}</span>
										<span className="text-[11px] font-normal tabular-nums text-muted-foreground">
											{formatMoney(row.spent)} ₹
										</span>
									</span>
								</TableCell>
								<TableCell
									className="text-right align-top tabular-nums hidden lg:table-cell"
									title={taskTitle}
								>
									{pctOrDash(row.taskSpendVsPlannedPercent)}
								</TableCell>
								<TableCell className="text-right align-top tabular-nums hidden sm:table-cell">
									{row.pendingApprovals}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
