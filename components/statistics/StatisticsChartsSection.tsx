"use client";

import CompletionsBarChart from "@/components/statistics/charts/CompletionsBarChart";
import PeriodComparisonChart from "@/components/statistics/charts/PeriodComparisonChart";
import SpendComparisonChart from "@/components/statistics/charts/SpendComparisonChart";
import TaskStatusPieChart from "@/components/statistics/charts/TaskStatusPieChart";
import { taskStatusBreakdown } from "@/lib/statistics/taskMetrics";
import type { StatisticsTimeRange } from "@/lib/statistics/timeRange";
import type { ITask } from "@/lib/types";

type BreakdownItem = { label: string; completions: number };

type Props = {
	tasks: ITask[];
	timeRange: StatisticsTimeRange;
	completionsInPeriod: number;
	completionsPreviousPeriod: number;
	projectSpent: number;
	projectBudget: number;
	taskSpent: number;
	taskPlanned: number;
	completionBreakdown?: BreakdownItem[];
	completionChartTitle?: string;
	completionChartDescription?: string;
};

export default function StatisticsChartsSection({
	tasks,
	timeRange,
	completionsInPeriod,
	completionsPreviousPeriod,
	projectSpent,
	projectBudget,
	taskSpent,
	taskPlanned,
	completionBreakdown,
	completionChartTitle,
	completionChartDescription,
}: Props) {
	const status = taskStatusBreakdown(tasks, new Date());

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<TaskStatusPieChart
				completed={status.completed}
				inProgress={status.inProgress}
				overdue={status.overdue}
			/>
			<PeriodComparisonChart
				timeRange={timeRange}
				current={completionsInPeriod}
				previous={completionsPreviousPeriod}
			/>
			{completionBreakdown && completionBreakdown.length > 0 ? (
				<CompletionsBarChart
					items={completionBreakdown}
					title={completionChartTitle ?? "Completions by group"}
					description={
						completionChartDescription ??
						"Tasks completed in the selected period"
					}
				/>
			) : null}
			<SpendComparisonChart
				spent={projectSpent}
				budgetOrPlanned={projectBudget}
				title="Project budget vs spent"
				description="Totals from project budget fields"
			/>
			<SpendComparisonChart
				spent={taskSpent}
				budgetOrPlanned={taskPlanned}
				title="Task spend vs planned"
				description="Rolled up from task planned amounts and spend"
			/>
		</div>
	);
}
