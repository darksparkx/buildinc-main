import { SummaryCard } from "@/components/base/general/SummaryCard";
import { RupeeIcon } from "@/lib/functions/utils";
import { CheckCircle2, FolderOpen, IndianRupee } from "lucide-react";

type Props = {
	totalProjects: number;
	activeProjects: number;
	totalBudget: number;
	showBudget?: boolean;
};

const ProjectStatistics = ({
	totalProjects,
	activeProjects,
	totalBudget,
	showBudget = true,
}: Props) => {
	return (
		<div
			className={
				showBudget
					? "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
					: "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
			}
		>
			<SummaryCard
				className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
				title="Total projects"
				content={totalProjects.toLocaleString()}
				icon={
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
						<FolderOpen className="h-5 w-5" aria-hidden />
					</span>
				}
			/>
			<SummaryCard
				className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
				title="Active"
				content={activeProjects.toLocaleString()}
				icon={
					<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/25">
						<CheckCircle2 className="h-5 w-5" aria-hidden />
					</span>
				}
			/>
			{showBudget ? (
				<SummaryCard
					className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
					title="Total budget"
					content={
						<span className="inline-flex items-baseline gap-0.5 tabular-nums">
							{totalBudget.toLocaleString("en-IN")}
							<RupeeIcon />
						</span>
					}
					icon={
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary ring-1 ring-secondary/25">
							<IndianRupee className="h-5 w-5" aria-hidden />
						</span>
					}
				/>
			) : null}
		</div>
	);
};

export default ProjectStatistics;
