import type { OwnerStatisticsSnapshot, ProjectStatisticRow } from "@/lib/statistics/ownerSnapshot";
import type {
	ApprovalSlaSnapshot,
	ApprovalTypeSlaRow,
} from "@/lib/statistics/approvalSnapshot";
import type {
	MaterialGroupRow,
	MaterialRollupSnapshot,
	ProjectMaterialRow,
} from "@/lib/statistics/materialSnapshot";
import type { PhaseStatisticRow } from "@/lib/statistics/phaseSnapshot";
import { STATISTICS_TIME_RANGE_LABELS } from "@/lib/statistics/timeRange";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";

export type StatisticsCsvExportOptions = {
	materialRollup?: MaterialRollupSnapshot;
	materialGroupRows?: MaterialGroupRow[];
	projectMaterialRows?: ProjectMaterialRow[];
	approvalSla?: ApprovalSlaSnapshot;
	approvalTypeRows?: ApprovalTypeSlaRow[];
};

function appendApprovalCsvSections(
	lines: string[],
	options?: StatisticsCsvExportOptions,
) {
	const sla = options?.approvalSla;
	if (!sla) return;

	lines.push(row(["overview", "approvals_pending", sla.pendingCount]));
	lines.push(
		row([
			"overview",
			"approvals_avg_pending_ms",
			sla.avgPendingMs ?? "",
		]),
	);
	lines.push(
		row([
			"overview",
			"approvals_oldest_pending_ms",
			sla.oldestPendingMs ?? "",
		]),
	);
	lines.push(
		row(["overview", "approvals_pending_over_48h", sla.pendingOverWarning]),
	);
	lines.push(
		row(["overview", "approvals_pending_over_7d", sla.pendingOverCritical]),
	);
	lines.push(
		row(["overview", "approvals_resolved_in_period", sla.resolvedInPeriod]),
	);
	lines.push(
		row([
			"overview",
			"approvals_avg_resolution_ms_in_period",
			sla.avgResolutionMsInPeriod ?? "",
		]),
	);

	const types = options?.approvalTypeRows ?? [];
	if (types.length > 0) {
		lines.push("");
		lines.push(
			row([
				"approval_type",
				"pending_count",
				"avg_pending_ms",
				"oldest_pending_ms",
			]),
		);
		for (const t of types) {
			lines.push(
				row([
					t.label,
					t.pendingCount,
					t.avgPendingMs ?? "",
					t.oldestPendingMs ?? "",
				]),
			);
		}
	}
}

function appendMaterialCsvSections(
	lines: string[],
	options?: StatisticsCsvExportOptions,
) {
	const rollup = options?.materialRollup;
	if (!rollup || rollup.lineCount === 0) return;

	lines.push(row(["overview", "material_lines", rollup.lineCount]));
	lines.push(row(["overview", "material_planned_cost", rollup.plannedCostTotal]));
	lines.push(row(["overview", "material_used_cost", rollup.usedCostTotal]));
	lines.push(
		row([
			"overview",
			"material_used_vs_planned_percent",
			rollup.usageVsPlannedPercent ?? "",
		]),
	);
	lines.push(row(["overview", "material_lines_over_plan", rollup.linesOverPlan]));

	const groups = options?.materialGroupRows ?? [];
	if (groups.length > 0) {
		lines.push("");
		lines.push(
			row([
				"material_name",
				"unit",
				"lines",
				"planned_quantity",
				"used_quantity",
				"planned_cost",
				"used_cost",
				"used_vs_planned_percent",
			]),
		);
		for (const g of groups) {
			lines.push(
				row([
					g.name,
					g.unit,
					g.lineCount,
					g.plannedQuantity,
					g.usedQuantity,
					g.plannedCost,
					g.usedCost,
					g.usageVsPlannedPercent ?? "",
				]),
			);
		}
	}

	const byProject = options?.projectMaterialRows ?? [];
	if (byProject.length > 0) {
		lines.push("");
		lines.push(
			row([
				"project_id",
				"project_name",
				"material_lines",
				"material_planned_cost",
				"material_used_cost",
				"used_vs_planned_percent",
			]),
		);
		for (const p of byProject) {
			lines.push(
				row([
					p.projectId,
					p.projectName,
					p.lineCount,
					p.plannedCostTotal,
					p.usedCostTotal,
					p.usageVsPlannedPercent ?? "",
				]),
			);
		}
	}
}

function csvCell(value: string | number | null | undefined): string {
	if (value == null) return "";
	const s = String(value);
	if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
	return s;
}

function row(values: (string | number | null | undefined)[]): string {
	return values.map(csvCell).join(",");
}

export function downloadCsvFile(filename: string, content: string) {
	const blob = new Blob(["\uFEFF" + content], {
		type: "text/csv;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

export function buildPortfolioStatisticsCsv(
	snapshot: OwnerStatisticsSnapshot,
	projectRows: ProjectStatisticRow[],
	timeRange: StatisticsTimeRange,
	options?: {
		scope?: string;
		generatedAt?: Date;
	} & StatisticsCsvExportOptions,
): string {
	const generatedAt = options?.generatedAt ?? new Date();
	const scope = options?.scope ?? "portfolio";
	const lines: string[] = [];
	lines.push(row(["BuildInc statistics export"]));
	lines.push(row(["generated_at", generatedAt.toISOString()]));
	lines.push(row(["time_range", STATISTICS_TIME_RANGE_LABELS[timeRange]]));
	lines.push(row(["scope", scope]));
	lines.push("");
	lines.push(row(["section", "metric", "value"]));
	lines.push(row(["overview", "projects_active", snapshot.activeProjectCount]));
	lines.push(row(["overview", "projects_total", snapshot.projectCount]));
	lines.push(
		row([
			"overview",
			"tasks_completed",
			`${snapshot.taskCompletedCount}/${snapshot.taskInventoryCount}`,
		]),
	);
	lines.push(
		row([
			"overview",
			"completion_rate_percent",
			snapshot.completionRatePercent ?? "",
		]),
	);
	lines.push(row(["overview", "completions_in_period", snapshot.completionsInPeriod]));
	lines.push(
		row(["overview", "completions_previous_period", snapshot.completionsPreviousPeriod]),
	);
	lines.push(row(["overview", "overdue_tasks", snapshot.overdueTaskCount]));
	lines.push(row(["overview", "pending_approvals", snapshot.pendingApprovalCount]));
	lines.push(row(["overview", "project_budget_total", snapshot.totalProjectBudget]));
	lines.push(row(["overview", "project_spent_total", snapshot.totalProjectSpent]));
	if (snapshot.totalBuiltUpSqft > 0) {
		lines.push(
			row(["overview", "total_built_up_sqft", snapshot.totalBuiltUpSqft]),
		);
		const portfolioPlannedPerSqft = Math.round(
			snapshot.totalProjectBudget / snapshot.totalBuiltUpSqft,
		);
		lines.push(
			row([
				"overview",
				"portfolio_planned_budget_per_sqft",
				portfolioPlannedPerSqft,
			]),
		);
		if (snapshot.totalProjectSpent > 0) {
			lines.push(
				row([
					"overview",
					"portfolio_actual_spend_per_sqft",
					Math.round(snapshot.totalProjectSpent / snapshot.totalBuiltUpSqft),
				]),
			);
		}
	}
	lines.push(row(["overview", "task_planned_total", snapshot.totalTaskPlannedBudget]));
	lines.push(row(["overview", "task_spent_total", snapshot.totalTaskSpent]));
	appendMaterialCsvSections(lines, options);
	appendApprovalCsvSections(lines, options);
	lines.push("");
	lines.push(
		row([
			"project_id",
			"name",
			"status",
			"tasks_completed",
			"tasks_total",
			"completion_rate_percent",
			"overdue",
			"completions_in_period",
			"completions_previous_period",
			"budget",
			"spent",
			"total_sqft",
			"planned_budget_per_sqft",
			"actual_spend_per_sqft",
			"task_planned",
			"task_spent",
			"pending_approvals",
		]),
	);
	for (const p of projectRows) {
		lines.push(
			row([
				p.projectId,
				p.name,
				p.status,
				p.taskCompletedCount,
				p.taskInventoryCount,
				p.completionRatePercent ?? "",
				p.overdueCount,
				p.completionsInPeriod,
				p.completionsPreviousPeriod,
				p.budget,
				p.spent,
				p.totalSqft > 0 ? p.totalSqft : "",
				p.plannedBudgetPerSqft ?? "",
				p.actualSpendPerSqft ?? "",
				p.taskPlannedTotal,
				p.taskSpentTotal,
				p.pendingApprovals,
			]),
		);
	}
	return lines.join("\n");
}

export function buildOrganisationStatisticsCsv(
	organisationName: string,
	snapshot: OwnerStatisticsSnapshot,
	projectRows: ProjectStatisticRow[],
	timeRange: StatisticsTimeRange,
	options?: { generatedAt?: Date } & StatisticsCsvExportOptions,
): string {
	const generatedAt = options?.generatedAt ?? new Date();
	return buildPortfolioStatisticsCsv(snapshot, projectRows, timeRange, {
		scope: `organisation:${organisationName}`,
		generatedAt,
		materialRollup: options?.materialRollup,
		materialGroupRows: options?.materialGroupRows,
		projectMaterialRows: options?.projectMaterialRows,
		approvalSla: options?.approvalSla,
		approvalTypeRows: options?.approvalTypeRows,
	});
}

export function buildProjectStatisticsCsv(
	projectName: string,
	projectRow: ProjectStatisticRow,
	phaseRows: PhaseStatisticRow[],
	timeRange: StatisticsTimeRange,
	options?: { generatedAt?: Date } & StatisticsCsvExportOptions,
): string {
	const generatedAt = options?.generatedAt ?? new Date();
	const lines: string[] = [];
	lines.push(row(["BuildInc statistics export"]));
	lines.push(row(["generated_at", generatedAt.toISOString()]));
	lines.push(row(["time_range", STATISTICS_TIME_RANGE_LABELS[timeRange]]));
	lines.push(row(["scope", `project:${projectName}`]));
	lines.push(row(["project_id", projectRow.projectId]));
	lines.push("");
	lines.push(row(["section", "metric", "value"]));
	lines.push(
		row([
			"overview",
			"tasks_completed",
			`${projectRow.taskCompletedCount}/${projectRow.taskInventoryCount}`,
		]),
	);
	lines.push(
		row([
			"overview",
			"completion_rate_percent",
			projectRow.completionRatePercent ?? "",
		]),
	);
	lines.push(row(["overview", "completions_in_period", projectRow.completionsInPeriod]));
	lines.push(
		row([
			"overview",
			"completions_previous_period",
			projectRow.completionsPreviousPeriod,
		]),
	);
	lines.push(row(["overview", "overdue_tasks", projectRow.overdueCount]));
	lines.push(row(["overview", "pending_approvals", projectRow.pendingApprovals]));
	lines.push(row(["overview", "budget", projectRow.budget]));
	lines.push(row(["overview", "spent", projectRow.spent]));
	if (projectRow.totalSqft > 0) {
		lines.push(row(["overview", "total_sqft", projectRow.totalSqft]));
		if (projectRow.plannedBudgetPerSqft != null) {
			lines.push(
				row([
					"overview",
					"planned_budget_per_sqft",
					projectRow.plannedBudgetPerSqft,
				]),
			);
		}
		if (projectRow.actualSpendPerSqft != null) {
			lines.push(
				row([
					"overview",
					"actual_spend_per_sqft",
					projectRow.actualSpendPerSqft,
				]),
			);
		}
	}
	lines.push(row(["overview", "task_planned", projectRow.taskPlannedTotal]));
	lines.push(row(["overview", "task_spent", projectRow.taskSpentTotal]));
	appendMaterialCsvSections(lines, options);
	appendApprovalCsvSections(lines, options);
	lines.push("");
	lines.push(
		row([
			"phase_id",
			"phase_name",
			"order",
			"tasks_completed",
			"tasks_total",
			"completion_rate_percent",
			"overdue",
			"completions_in_period",
			"completions_previous_period",
			"phase_budget",
			"task_planned",
			"task_spent",
		]),
	);
	for (const ph of phaseRows) {
		lines.push(
			row([
				ph.phaseId,
				ph.name,
				ph.order,
				ph.taskCompletedCount,
				ph.taskInventoryCount,
				ph.completionRatePercent ?? "",
				ph.overdueCount,
				ph.completionsInPeriod,
				ph.completionsPreviousPeriod,
				ph.budget,
				ph.taskPlannedTotal,
				ph.taskSpentTotal,
			]),
		);
	}
	return lines.join("\n");
}

/** Rows parsed from an enterprise import file (project budget / spend). */
export type ProjectBudgetImportRow = {
	projectId: string;
	budget: number;
	spent: number;
	name?: string;
};

const IMPORT_HEADERS = ["project_id", "budget", "spent"] as const;

function parseCsvLine(line: string): string[] {
	const out: string[] = [];
	let cur = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inQuotes) {
			if (ch === '"' && line[i + 1] === '"') {
				cur += '"';
				i++;
			} else if (ch === '"') {
				inQuotes = false;
			} else {
				cur += ch;
			}
		} else if (ch === '"') {
			inQuotes = true;
		} else if (ch === ",") {
			out.push(cur);
			cur = "";
		} else {
			cur += ch;
		}
	}
	out.push(cur);
	return out;
}

export function parseProjectBudgetImportCsv(
	text: string,
): { rows: ProjectBudgetImportRow[]; errors: string[] } {
	const errors: string[] = [];
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0 && !l.startsWith("#"));

	if (lines.length === 0) {
		return { rows: [], errors: ["File is empty."] };
	}

	let headerIndex = -1;
	let headers: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const cells = parseCsvLine(lines[i]).map((c) => c.trim().toLowerCase());
		if (cells.includes("project_id") && cells.includes("budget")) {
			headerIndex = i;
			headers = cells;
			break;
		}
	}

	if (headerIndex < 0) {
		return {
			rows: [],
			errors: [
				'Could not find a header row with "project_id" and "budget". Export from Statistics and edit budget/spent columns, or match that format.',
			],
		};
	}

	const idIdx = headers.indexOf("project_id");
	const budgetIdx = headers.indexOf("budget");
	const spentIdx = headers.indexOf("spent");
	const nameIdx = headers.indexOf("name");

	const rows: ProjectBudgetImportRow[] = [];

	for (let i = headerIndex + 1; i < lines.length; i++) {
		const cells = parseCsvLine(lines[i]);
		const projectId = cells[idIdx]?.trim();
		if (!projectId || projectId === "project_id") continue;

		const budget = Number(cells[budgetIdx]?.replace(/,/g, "") ?? "");
		const spentRaw = spentIdx >= 0 ? cells[spentIdx] : "";
		const spent =
			spentRaw === "" || spentRaw == null
				? NaN
				: Number(String(spentRaw).replace(/,/g, ""));

		if (!Number.isFinite(budget) || budget < 0) {
			errors.push(`Row ${i + 1}: invalid budget for project ${projectId}.`);
			continue;
		}
		if (spentIdx >= 0 && spentRaw !== "" && (!Number.isFinite(spent) || spent < 0)) {
			errors.push(`Row ${i + 1}: invalid spent for project ${projectId}.`);
			continue;
		}

		rows.push({
			projectId,
			budget,
			spent: Number.isFinite(spent) ? spent : 0,
			name: nameIdx >= 0 ? cells[nameIdx]?.trim() : undefined,
		});
	}

	return { rows, errors };
}

