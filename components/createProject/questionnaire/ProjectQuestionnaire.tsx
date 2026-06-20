"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/base/ui/card";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { Textarea } from "@/components/base/ui/textarea";
import { Button } from "@/components/base/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/base/ui/select";
import { Badge } from "@/components/base/ui/badge";
import { DatePicker } from "@/components/base/ui/date-picker";
import { MapPin, Search } from "lucide-react";
import {
	IOrganisation,
	IOrganisationProfile,
	IProjectCreationData,
} from "@/lib/types";
import type { ProjectCreationQuestionnaire } from "@/lib/projectGeneration/types";
import { projectTypeGroups, getProjectType } from "@/lib/projectGeneration/projectTypes";
import { isFullRulePack } from "@/lib/projectGeneration/rulePacks";
import { validateQuestionnaireStep } from "@/lib/projectGeneration/questionnaire";
import { cn } from "@/lib/functions/utils";

const SUB_STEPS = [
	"Project type",
	"Essentials",
	"Size & site",
	"Scope & delivery",
	"Targets & rate card",
];

type Props = {
	projectData: IProjectCreationData;
	setProjectData: React.Dispatch<React.SetStateAction<IProjectCreationData>>;
	organisations: IOrganisation[];
	supervisors: IOrganisationProfile[];
	validationErrors: Record<string, string>;
	setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	subStep: number;
	setSubStep: React.Dispatch<React.SetStateAction<number>>;
};

function syncFromProject(
	projectData: IProjectCreationData,
): ProjectCreationQuestionnaire {
	const q = projectData.questionnaire;
	if (q) return q;
	return {
		projectTypeId: (projectData.projectTypeId as ProjectCreationQuestionnaire["projectTypeId"]) || "",
		name: projectData.name || "",
		description: projectData.description || "",
		organisationId: projectData.organisationId || "",
		supervisor: projectData.supervisor || "",
		supervisorName: projectData.supervisorName || "",
		location: projectData.location || "",
		startDate: projectData.startDate,
		endDate: projectData.endDate,
		builtUpSqft: projectData.totalSqft ?? 0,
		plotAreaSqft: null,
		floorCount: null,
		basementOrParking: false,
		unitsPerFloor: null,
		commercialGfaPercent: null,
		residentialGfaPercent: null,
		deliveryMode: "new_build",
		finishLevel: "standard",
		structuralSystem: null,
		scopeNotes: "",
		targetBudget: null,
		targetBudgetPerSqft: null,
	};
}

export default function ProjectQuestionnaire({
	projectData,
	setProjectData,
	organisations,
	supervisors,
	validationErrors,
	setValidationErrors,
	subStep,
	setSubStep,
}: Props) {
	const [typeSearch, setTypeSearch] = useState("");

	const q = useMemo(() => syncFromProject(projectData), [projectData]);

	const patch = (partial: Partial<ProjectCreationQuestionnaire>) => {
		const next = { ...q, ...partial };
		const typeDef = next.projectTypeId
			? getProjectType(next.projectTypeId)
			: undefined;
		setProjectData((prev) => ({
			...prev,
			questionnaire: next,
			projectTypeId: next.projectTypeId || undefined,
			name: next.name,
			description: next.description || prev.description,
			organisationId: next.organisationId,
			supervisor: next.supervisor,
			supervisorName: next.supervisorName,
			location: next.location,
			startDate: next.startDate,
			endDate: next.endDate,
			totalSqft: next.builtUpSqft || undefined,
			category: typeDef?.legacyCategory ?? prev.category,
		}));
		Object.keys(partial).forEach((k) => {
			if (validationErrors[k]) {
				setValidationErrors((prev) => {
					const copy = { ...prev };
					delete copy[k];
					return copy;
				});
			}
		});
	};

	const groups = projectTypeGroups();
	const filteredGroups = groups
		.map((g) => ({
			...g,
			types: g.types.filter((t) =>
				t.label.toLowerCase().includes(typeSearch.toLowerCase()),
			),
		}))
		.filter((g) => g.types.length > 0);

	const inputClass =
		"h-11 border-border/60 bg-background/80 shadow-sm ring-1 ring-border/30";

	return (
		<div className="space-y-4">
			<nav className="flex flex-wrap gap-2" aria-label="Questionnaire steps">
				{SUB_STEPS.map((label, i) => {
					const step = i + 1;
					return (
						<button
							key={label}
							type="button"
							onClick={() => step <= subStep && setSubStep(step)}
							className={cn(
								"rounded-full px-3 py-1 text-xs font-medium transition-colors",
								step === subStep
									? "bg-blue-600 text-white"
									: step < subStep
										? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
										: "bg-muted text-muted-foreground",
							)}
						>
							{step}. {label}
						</button>
					);
				})}
			</nav>

			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40">
				<CardHeader>
					<CardTitle>{SUB_STEPS[subStep - 1]}</CardTitle>
					<CardDescription>
						{subStep === 1 &&
							"Choose the project type first — it drives questions and the generated plan."}
						{subStep === 2 && "Name, organisation, supervisor, and schedule."}
						{subStep === 3 && "Built-up area and type-specific site fields."}
						{subStep === 4 && "Delivery scope, finish level, and structure."}
						{subStep === 5 &&
							"Optional targets; generation uses your organisation rate card."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{subStep === 1 && (
						<>
							{validationErrors.projectTypeId && (
								<p className="text-sm text-destructive">
									{validationErrors.projectTypeId}
								</p>
							)}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className={cn(inputClass, "pl-9")}
									placeholder="Search project types…"
									value={typeSearch}
									onChange={(e) => setTypeSearch(e.target.value)}
								/>
							</div>
							<div className="max-h-[420px] space-y-6 overflow-y-auto pr-1">
								{filteredGroups.map(({ group, types }) => (
									<div key={group} className="space-y-2">
										<h3 className="text-sm font-semibold text-muted-foreground">
											{group}
										</h3>
										<div className="grid gap-2 sm:grid-cols-2">
											{types.map((t) => {
												const selected = q.projectTypeId === t.id;
												return (
													<button
														key={t.id}
														type="button"
														onClick={() =>
															patch({
																projectTypeId: t.id,
															})
														}
														className={cn(
															"rounded-lg border p-3 text-left text-sm transition-colors",
															selected
																? "border-blue-600 bg-blue-50 ring-2 ring-blue-500/30 dark:bg-blue-950/40"
																: "border-border hover:bg-muted/50",
														)}
													>
														<div className="flex items-start justify-between gap-2">
															<span className="font-medium">
																{t.label}
															</span>
															<Badge
																variant={
																	t.priority === "A"
																		? "default"
																		: "secondary"
																}
																className="shrink-0 text-[10px]"
															>
																{t.priority === "A"
																	? "Full plan"
																	: "Stub"}
															</Badge>
														</div>
														<p className="mt-1 text-xs text-muted-foreground">
															{t.id} · ₹
															{t.defaultBenchmarkPerSqft.toLocaleString(
																"en-IN",
															)}
															/sqft ref.
														</p>
													</button>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{subStep === 2 && (
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2 md:col-span-2">
								<Label>Project name</Label>
								<Input
									className={inputClass}
									value={q.name}
									onChange={(e) => patch({ name: e.target.value })}
								/>
								{validationErrors.name && (
									<p className="text-sm text-destructive">{validationErrors.name}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>Organisation</Label>
								<Select
									value={q.organisationId}
									onValueChange={(v) => patch({ organisationId: v })}
								>
									<SelectTrigger className={inputClass}>
										<SelectValue placeholder="Select organisation" />
									</SelectTrigger>
									<SelectContent>
										{organisations.map((org) => (
											<SelectItem key={org.id} value={org.id}>
												{org.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{validationErrors.organisationId && (
									<p className="text-sm text-destructive">
										{validationErrors.organisationId}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>Supervisor</Label>
								<Select
									value={q.supervisor}
									onValueChange={(v) => {
										const sup = supervisors.find((s) => s.id === v);
										patch({
											supervisor: v,
											supervisorName: sup?.name ?? "",
										});
									}}
								>
									<SelectTrigger className={inputClass}>
										<SelectValue placeholder="Select supervisor" />
									</SelectTrigger>
									<SelectContent>
										{supervisors.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{validationErrors.supervisor && (
									<p className="text-sm text-destructive">
										{validationErrors.supervisor}
									</p>
								)}
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label className="flex items-center gap-2">
									<MapPin className="h-4 w-4" /> Site location
								</Label>
								<Input
									className={inputClass}
									value={q.location}
									onChange={(e) => patch({ location: e.target.value })}
								/>
								{validationErrors.location && (
									<p className="text-sm text-destructive">
										{validationErrors.location}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="planned-start">Planned start</Label>
								<DatePicker
									id="planned-start"
									className={inputClass}
									value={q.startDate}
									onChange={(d) => patch({ startDate: d })}
									placeholder="Select start date"
									toDate={q.endDate ?? undefined}
								/>
								{validationErrors.startDate && (
									<p className="text-sm text-destructive">{validationErrors.startDate}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="planned-end">Planned end</Label>
								<DatePicker
									id="planned-end"
									className={inputClass}
									value={q.endDate}
									onChange={(d) => patch({ endDate: d })}
									placeholder="Select end date"
									fromDate={q.startDate ?? undefined}
								/>
								{validationErrors.endDate && (
									<p className="text-sm text-destructive">{validationErrors.endDate}</p>
								)}
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label>Notes (optional)</Label>
								<Textarea
									value={q.description}
									onChange={(e) => patch({ description: e.target.value })}
									placeholder="Brief project description"
								/>
							</div>
						</div>
					)}

					{subStep === 3 && (
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Built-up area (sqft)</Label>
								<Input
									type="number"
									className={inputClass}
									min={1}
									value={q.builtUpSqft || ""}
									onChange={(e) =>
										patch({
											builtUpSqft: Number(e.target.value) || 0,
										})
									}
								/>
								{validationErrors.builtUpSqft && (
									<p className="text-sm text-destructive">
										{validationErrors.builtUpSqft}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>Plot area (sqft, optional)</Label>
								<Input
									type="number"
									className={inputClass}
									value={q.plotAreaSqft ?? ""}
									onChange={(e) =>
										patch({
											plotAreaSqft: e.target.value
												? Number(e.target.value)
												: null,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Floor count</Label>
								<Input
									type="number"
									className={inputClass}
									min={0}
									value={q.floorCount ?? ""}
									onChange={(e) =>
										patch({
											floorCount: e.target.value
												? Number(e.target.value)
												: null,
										})
									}
								/>
								{validationErrors.floorCount && (
									<p className="text-sm text-destructive">
										{validationErrors.floorCount}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>Units per floor</Label>
								<Input
									type="number"
									className={inputClass}
									value={q.unitsPerFloor ?? ""}
									onChange={(e) =>
										patch({
											unitsPerFloor: e.target.value
												? Number(e.target.value)
												: null,
										})
									}
								/>
							</div>
							{q.projectTypeId === "M2" && (
								<>
									<div className="space-y-2">
										<Label>Commercial GFA %</Label>
										<Input
											type="number"
											className={inputClass}
											value={q.commercialGfaPercent ?? ""}
											onChange={(e) =>
												patch({
													commercialGfaPercent: Number(e.target.value),
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Residential GFA %</Label>
										<Input
											type="number"
											className={inputClass}
											value={q.residentialGfaPercent ?? ""}
											onChange={(e) =>
												patch({
													residentialGfaPercent: Number(e.target.value),
												})
											}
										/>
									</div>
									{validationErrors.gfaSplit && (
										<p className="text-sm text-destructive md:col-span-2">
											{validationErrors.gfaSplit}
										</p>
									)}
								</>
							)}
							<div className="flex items-center gap-2 md:col-span-2">
								<input
									id="basement"
									type="checkbox"
									checked={q.basementOrParking}
									onChange={(e) =>
										patch({ basementOrParking: e.target.checked })
									}
								/>
								<Label htmlFor="basement">Basement / stilt parking</Label>
							</div>
						</div>
					)}

					{subStep === 4 && (
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Delivery scope</Label>
								<Select
									value={q.deliveryMode}
									onValueChange={(v) =>
										patch({
											deliveryMode:
												v as ProjectCreationQuestionnaire["deliveryMode"],
										})
									}
								>
									<SelectTrigger className={inputClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="new_build">New build</SelectItem>
										<SelectItem value="extension">Extension</SelectItem>
										<SelectItem value="renovation">Renovation</SelectItem>
										<SelectItem value="fit_out">Fit-out only</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Finish level</Label>
								<Select
									value={q.finishLevel}
									onValueChange={(v) =>
										patch({
											finishLevel:
												v as ProjectCreationQuestionnaire["finishLevel"],
										})
									}
								>
									<SelectTrigger className={inputClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="basic">Basic</SelectItem>
										<SelectItem value="standard">Standard</SelectItem>
										<SelectItem value="premium">Premium</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label>Structural system (optional)</Label>
								<Select
									value={q.structuralSystem ?? ""}
									onValueChange={(v) =>
										patch({
											structuralSystem: v
												? (v as ProjectCreationQuestionnaire["structuralSystem"])
												: null,
										})
									}
								>
									<SelectTrigger className={inputClass}>
										<SelectValue placeholder="Select if known" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="rcc">RCC</SelectItem>
										<SelectItem value="steel_frame">Steel frame</SelectItem>
										<SelectItem value="load_bearing">Load bearing</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label>Scope notes</Label>
								<Textarea
									value={q.scopeNotes}
									onChange={(e) => patch({ scopeNotes: e.target.value })}
								/>
							</div>
						</div>
					)}

					{subStep === 5 && (
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Target budget (optional, validation only)</Label>
								<Input
									type="number"
									className={inputClass}
									value={q.targetBudget ?? ""}
									onChange={(e) =>
										patch({
											targetBudget: e.target.value
												? Number(e.target.value)
												: null,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Target ₹/sqft (optional)</Label>
								<Input
									type="number"
									className={inputClass}
									value={q.targetBudgetPerSqft ?? ""}
									onChange={(e) =>
										patch({
											targetBudgetPerSqft: e.target.value
												? Number(e.target.value)
												: null,
										})
									}
								/>
							</div>
							{q.projectTypeId && isFullRulePack(q.projectTypeId) && (
								<p className="text-sm text-muted-foreground md:col-span-2">
									Full rule pack will generate phases, tasks, materials, and
									budget for{" "}
									<strong>
										{getProjectType(q.projectTypeId)?.label}
									</strong>
									.
								</p>
							)}
							{validationErrors.rateCard && (
								<p className="text-sm text-amber-600 md:col-span-2">
									{validationErrors.rateCard}
								</p>
							)}
						</div>
					)}

					<div className="flex justify-between border-t pt-4">
						<Button
							type="button"
							variant="outline"
							disabled={subStep <= 1}
							onClick={() => setSubStep((s) => Math.max(1, s - 1))}
						>
							Back
						</Button>
						{subStep < 5 && (
							<Button
								type="button"
								onClick={() => {
									const errs = validateQuestionnaireStep(subStep, q);
									setValidationErrors(errs);
									if (Object.keys(errs).length === 0) {
										setSubStep((s) => s + 1);
									}
								}}
							>
								Continue
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function validateFullQuestionnaire(
	q: ProjectCreationQuestionnaire,
): Record<string, string> {
	let merged: Record<string, string> = {};
	for (let s = 1; s <= 5; s++) {
		merged = { ...merged, ...validateQuestionnaireStep(s, q) };
	}
	return merged;
}
