"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Badge } from "@/components/base/ui/badge";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { getProjectType } from "@/lib/projectGeneration/projectTypes";
import { isFullRulePack } from "@/lib/projectGeneration/rulePacks";
import type { ProjectCreationQuestionnaire } from "@/lib/projectGeneration/types";
import {
	Building2,
	CalendarRange,
	Hammer,
	MapPin,
	Ruler,
	Sparkles,
} from "lucide-react";

type Props = {
	questionnaire: ProjectCreationQuestionnaire;
};

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
			<dt className="text-sm text-muted-foreground">{label}</dt>
			<dd className="text-sm font-medium text-foreground sm:text-right">{value}</dd>
		</div>
	);
}

export default function QuestionnaireReviewStep({ questionnaire }: Props) {
	const typeLabel =
		getProjectType(questionnaire.projectTypeId)?.label ?? "—";
	const fullPack =
		questionnaire.projectTypeId &&
		isFullRulePack(questionnaire.projectTypeId);

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Sparkles className="h-5 w-5 text-blue-600" />
					Review before generating
				</CardTitle>
				<CardDescription>
					Check your answers below. Click <strong>Next</strong> to
					automatically build phases, tasks, materials, and budget from
					your project type.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 sm:grid-cols-2">
				<section className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
					<h3 className="flex items-center gap-2 text-sm font-semibold">
						<Building2 className="h-4 w-4 text-blue-600" />
						Project
					</h3>
					<dl className="space-y-2">
						<Row label="Type" value={typeLabel} />
						<Row label="Name" value={questionnaire.name || "—"} />
						<Row
							label="Rule pack"
							value={fullPack ? "Full (detailed)" : "Standard template"}
						/>
					</dl>
					{fullPack && (
						<Badge variant="secondary" className="text-xs">
							Comprehensive lifecycle plan
						</Badge>
					)}
				</section>

				<section className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
					<h3 className="flex items-center gap-2 text-sm font-semibold">
						<CalendarRange className="h-4 w-4 text-blue-600" />
						Schedule
					</h3>
					<dl className="space-y-2">
						<Row
							label="Planned start"
							value={
								questionnaire.startDate
									? formatCalendarDate(questionnaire.startDate)
									: "—"
							}
						/>
						<Row
							label="Planned end"
							value={
								questionnaire.endDate
									? formatCalendarDate(questionnaire.endDate)
									: "—"
							}
						/>
					</dl>
				</section>

				<section className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
					<h3 className="flex items-center gap-2 text-sm font-semibold">
						<Ruler className="h-4 w-4 text-blue-600" />
						Size & site
					</h3>
					<dl className="space-y-2">
						<Row
							label="Built-up area"
							value={`${questionnaire.builtUpSqft.toLocaleString("en-IN")} sqft`}
						/>
						{questionnaire.floorCount != null && (
							<Row label="Floors" value={String(questionnaire.floorCount)} />
						)}
						{questionnaire.plotAreaSqft != null && (
							<Row
								label="Plot area"
								value={`${questionnaire.plotAreaSqft.toLocaleString("en-IN")} sqft`}
							/>
						)}
					</dl>
				</section>

				<section className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
					<h3 className="flex items-center gap-2 text-sm font-semibold">
						<Hammer className="h-4 w-4 text-blue-600" />
						Scope
					</h3>
					<dl className="space-y-2">
						<Row
							label="Delivery"
							value={questionnaire.deliveryMode.replace(/_/g, " ")}
						/>
						<Row label="Finish level" value={questionnaire.finishLevel} />
						{questionnaire.structuralSystem && (
							<Row label="Structure" value={questionnaire.structuralSystem} />
						)}
					</dl>
				</section>

				<section className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4 sm:col-span-2">
					<h3 className="flex items-center gap-2 text-sm font-semibold">
						<MapPin className="h-4 w-4 text-blue-600" />
						Location & notes
					</h3>
					<dl className="space-y-2">
						<Row label="Site" value={questionnaire.location || "—"} />
						{questionnaire.description?.trim() && (
							<Row label="Description" value={questionnaire.description} />
						)}
					</dl>
				</section>
			</CardContent>
		</Card>
	);
}
