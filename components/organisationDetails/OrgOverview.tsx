import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Progress } from "@/components/base/ui/progress";
import { Separator } from "@/components/base/ui/separator";
import { TabsContent } from "@/components/base/ui/tabs";
import { IOrganisation } from "@/lib/types";
import { formatDate, formatCurrency, OrgIcon } from "@/lib/functions/utils";
import { Calendar, FileText, Wallet } from "lucide-react";
import React from "react";

const OrgOverview = ({
	organisation,
	totalBudget,
	totalSpent,
	budgetUtilization,
	showFinancials = true,
	totalSqft = 0,
	plannedPerSqft = null,
	actualPerSqft = null,
}: {
	organisation: IOrganisation;
	totalBudget: number;
	totalSpent: number;
	budgetUtilization: number;
	showFinancials?: boolean;
	totalSqft?: number;
	plannedPerSqft?: number | null;
	actualPerSqft?: number | null;
}) => {
	return (
		<TabsContent value="overview" className="mt-0 space-y-4">
			<div className="grid gap-4 lg:grid-cols-2">
				<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
					<CardHeader className="space-y-1 pb-4">
						<div className="flex items-center gap-2">
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
								<OrgIcon className="h-4 w-4" />
							</span>
							<div>
								<CardTitle className="text-lg sm:text-xl">
									Organisation information
								</CardTitle>
								<CardDescription>
									Basic details about this organisation
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border/40 pb-3">
							<span className="text-sm font-medium text-muted-foreground">
								Name
							</span>
							<span className="min-w-0 flex-1 text-right font-medium sm:text-left">
								{organisation.name}
							</span>
						</div>
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0">
									<span className="text-sm font-medium text-muted-foreground">
										Description
									</span>
									<p className="mt-1 text-sm leading-relaxed">
										{organisation.description ||
											"No description provided."}
									</p>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">Created</span>
							<span className="font-medium tabular-nums">
								{formatDate(organisation.created_at)}
							</span>
						</div>
					</CardContent>
				</Card>

				{showFinancials && (
					<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
						<CardHeader className="space-y-1 pb-4">
							<div className="flex items-center gap-2">
								<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400">
									<Wallet className="h-4 w-4" />
								</span>
								<div>
									<CardTitle className="text-lg sm:text-xl">
										Financial overview
									</CardTitle>
									<CardDescription>
										Budget and spend across linked projects
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between gap-4 text-sm">
								<span className="text-muted-foreground">Total budget</span>
								<span className="font-semibold tabular-nums">
									{formatCurrency(totalBudget)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4 text-sm">
								<span className="text-muted-foreground">Total spent</span>
								<span className="font-semibold tabular-nums">
									{formatCurrency(totalSpent)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4 text-sm">
								<span className="text-muted-foreground">Remaining</span>
								<span className="font-semibold tabular-nums">
									{formatCurrency(totalBudget - totalSpent)}
								</span>
							</div>
							{totalSqft > 0 && (
								<>
									<div className="flex items-center justify-between gap-4 text-sm">
										<span className="text-muted-foreground">
											Total built-up sqft
										</span>
										<span className="font-semibold tabular-nums">
											{totalSqft.toLocaleString("en-IN")} sqft
										</span>
									</div>
									{plannedPerSqft != null && (
										<div className="flex items-center justify-between gap-4 text-sm">
											<span className="text-muted-foreground">
												Planned ₹/sqft (org avg)
											</span>
											<span className="font-semibold tabular-nums">
												{formatCurrency(plannedPerSqft)}
											</span>
										</div>
									)}
									{actualPerSqft != null && (
										<div className="flex items-center justify-between gap-4 text-sm">
											<span className="text-muted-foreground">
												Actual spend ₹/sqft (org avg)
											</span>
											<span className="font-semibold tabular-nums">
												{formatCurrency(actualPerSqft)}
											</span>
										</div>
									)}
								</>
							)}
							<Separator className="bg-border/60" />
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Budget utilisation
									</span>
									<span className="tabular-nums font-medium">
										{budgetUtilization.toFixed(1)}%
									</span>
								</div>
								<Progress
									value={Math.min(100, Math.max(0, budgetUtilization))}
									className="h-2.5 bg-muted"
								/>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</TabsContent>
	);
};

export default OrgOverview;
