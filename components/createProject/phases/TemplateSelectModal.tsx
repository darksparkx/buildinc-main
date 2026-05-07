import { Badge } from "@/components/base/ui/badge";
import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/base/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/ui/dialog";
import { Input } from "@/components/base/ui/input";
import { templates } from "@/lib/constants/project-templates";
import {
	getPhaseSectionTheme,
	getTemplateModalTheme,
	TEMPLATE_MODAL_ICON_GLYPH,
} from "@/lib/constants/phaseColorThemes";
import {
	IPhaseTemplate,
	IProjectCreationData,
	IProjectTemplate,
} from "@/lib/types";
import { modalButtonCancelClass } from "@/lib/functions/modalButtonStyles";
import { cn, getEstimatedDuration } from "@/lib/functions/utils";
import { randomUUID } from "crypto";
import { Layers, User, Plus, Search, LayoutTemplate } from "lucide-react";
import React, { useState } from "react";
import { useProjectTemplateStore } from "@/lib/store/projectTemplateStore";

function templateStats(t: IProjectTemplate) {
	const taskCount = t.phases.reduce(
		(sum: number, p: IPhaseTemplate) => sum + (p.tasks?.length ?? 0),
		0,
	);
	return { phases: t.phases?.length ?? 0, tasks: taskCount };
}

function matchesQuery(t: IProjectTemplate, q: string) {
	const s = q.trim().toLowerCase();
	if (!s) return true;
	return (
		(t.name ?? "").toLowerCase().includes(s) ||
		(t.description ?? "").toLowerCase().includes(s) ||
		(t.category ?? "").toLowerCase().includes(s)
	);
}

const TemplateSelectModal = ({
	projectData,
	setProjectData,
	customTemplates,
}: {
	projectData: IProjectCreationData;
	setProjectData: React.Dispatch<React.SetStateAction<IProjectCreationData>>;
	customTemplates: IProjectTemplate[];
}) => {
	const [selectedTemplate, setSelectedTemplate] =
		useState<IProjectTemplate | null>(null);
	const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
	const [search, setSearch] = useState("");

	const libraryTemplates: IProjectTemplate[] = [
		...Object.values(useProjectTemplateStore.getState().projectTemplates),
		...templates,
	];

	const filteredLibrary = libraryTemplates.filter((t) =>
		matchesQuery(t, search),
	);
	const filteredCustom = customTemplates.filter((t) =>
		matchesQuery(t, search),
	);

	const phaseTheme = getPhaseSectionTheme();
	const templateModalTheme = getTemplateModalTheme();
	const selectedTheme = selectedTemplate ? templateModalTheme : null;

	const applyTemplate = (template: IProjectTemplate) => {
		const phases: IPhaseTemplate[] = (template.phases ?? []).map(
			(templatePhase, index) => {
				const phaseStartDays = (template.phases ?? [])
					.slice(0, index)
					.reduce((sum, p) => sum + (p.estimatedDuration ?? 0), 0);

				const phaseStart = projectData.startDate ?? new Date();

				phaseStart.setDate(
					phaseStart.getDate() + (phaseStartDays ?? 0),
				);
				const phaseEnd = new Date(phaseStart);
				phaseEnd.setDate(
					phaseEnd.getDate() + (templatePhase.estimatedDuration ?? 0),
				);
				const estimatedDuration = getEstimatedDuration(
					phaseStart,
					phaseEnd,
				);

				return {
					created_at: new Date(),
					id: templatePhase.id || randomUUID(),
					name: templatePhase.name,
					description: templatePhase.description,
					startDate: phaseStart,
					endDate: phaseEnd,
					status: ["Inactive"],
					progress: 0,
					tasks: templatePhase.tasks,
					totalTasks: templatePhase.tasks.length,
					CompletedTasks: 0,
					budget: templatePhase.budget,
					spent: 0,
					dependencies: [],
					projectId: projectData.id,
					estimatedDuration: estimatedDuration,
				};
			},
		);

		setProjectData((prev) => ({
			...prev,
			selectedTemplate: template,
			phases,
		}));
		setSelectedTemplate(template);
		setIsTemplateDialogOpen(false);
		setSearch("");
	};

	const libraryEmpty = filteredLibrary.length === 0;
	const customEmpty = filteredCustom.length === 0;
	const nothingFound = search.trim() && libraryEmpty && customEmpty;

	return (
		<div>
			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
				<CardHeader className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0 space-y-1">
							<CardTitle className="text-lg sm:text-xl">
								Project template
							</CardTitle>
							<CardDescription className="text-pretty">
								Start from a template or add phases manually
								below.
							</CardDescription>
						</div>
						<Button
							type="button"
							onClick={() => setIsTemplateDialogOpen(true)}
							variant="outline"
							className={cn(
								"group h-11 shrink-0 transition-all duration-200 ease-out",
								templateModalTheme.browseTemplates,
							)}
						>
							<span
								className={cn(
									"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-200 ease-out group-hover:scale-105",
									templateModalTheme.icon,
									templateModalTheme.iconHover,
								)}
							>
								<LayoutTemplate
									className={cn(
										"h-4 w-4",
										TEMPLATE_MODAL_ICON_GLYPH,
									)}
									aria-hidden
								/>
							</span>
							<span className="inline-flex h-8 shrink-0 items-center leading-none font-medium transition-colors group-hover:text-foreground">
								Browse templates
							</span>
						</Button>
					</div>
				</CardHeader>
				{selectedTemplate && selectedTheme && (
					<CardContent className="pb-6 pt-0">
						<div
							className={cn(
								"flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-sm ring-1",
								selectedTheme.card,
							)}
						>
							<div className="flex min-w-0 items-center gap-3">
								<div
									className={cn(
										"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1",
										selectedTheme.icon,
									)}
								>
									<Layers
										className="h-5 w-5 dark:text-black"
										aria-hidden
									/>
								</div>
								<div className="min-w-0">
									<h4 className="font-medium text-sky-950 dark:text-sky-100">
										{selectedTemplate.name}
									</h4>
									<p className="text-sm text-sky-900/85 dark:text-sky-400">
										{selectedTemplate.description}
									</p>
								</div>
							</div>
							<Badge
								variant="secondary"
								className="shrink-0 border border-sky-300/45 bg-sky-200/45 text-sky-950 dark:border-sky-700 dark:bg-sky-900/75 dark:text-sky-200"
							>
								{selectedTemplate.phases?.length} phases
							</Badge>
						</div>
					</CardContent>
				)}
			</Card>
			<Dialog
				open={isTemplateDialogOpen}
				onOpenChange={(open) => {
					setIsTemplateDialogOpen(open);
					if (!open) setSearch("");
				}}
			>
				<DialogContent
					className={cn(
						"flex max-h-[min(85vh,880px)] flex-col gap-0 overflow-hidden border-border/60 p-0 shadow-xl sm:max-w-4xl",
					)}
				>
					<div className="border-b border-border/60 bg-muted/30 px-6 pb-5 pt-6 pr-14">
						<DialogHeader className="gap-3 text-left sm:text-left">
							<div className="flex items-start gap-3">
								<span
									className={cn(
										"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
										templateModalTheme.icon,
									)}
								>
									<LayoutTemplate
										className={cn(
											"h-5 w-5",
											TEMPLATE_MODAL_ICON_GLYPH,
										)}
										aria-hidden
									/>
								</span>
								<div className="min-w-0 space-y-1">
									<DialogTitle className="text-xl font-semibold tracking-tight">
										Choose a template
									</DialogTitle>
									<DialogDescription className="text-pretty text-sm leading-relaxed">
										Pick a starter layout with phases and
										tasks, or close with &quot;Start from
										scratch&quot; at the bottom.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>
					</div>

					<div className="border-b border-border/60 px-6 py-3">
						<div className="relative">
							<Search
								className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
								aria-hidden
							/>
							<Input
								type="search"
								placeholder="Search by name, category, or description…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-11 border-border/60 bg-background/90 pl-9 shadow-sm ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</div>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
						{nothingFound ? (
							<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-14 text-center">
								<p className="text-sm font-medium text-foreground">
									No templates match your search
								</p>
								<p className="mt-1 max-w-sm text-sm text-muted-foreground">
									Try another keyword or clear the search
									field.
								</p>
								<Button
									type="button"
									variant="link"
									className="mt-2 h-auto p-0 text-primary"
									onClick={() => setSearch("")}
								>
									Clear search
								</Button>
							</div>
						) : (
							<div className="space-y-10">
								{!libraryEmpty && (
									<section aria-labelledby="tpl-library">
										<h3
											id="tpl-library"
											className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
										>
											Library
										</h3>
										<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
											{filteredLibrary.map((template) => {
												const { phases, tasks } =
													templateStats(template);
												return (
													<button
														key={template.id}
														type="button"
														onClick={() =>
															applyTemplate(
																template,
															)
														}
														className={cn(
															"group flex w-full flex-col rounded-2xl border p-5 text-left shadow-sm ring-1 transition-all",
															templateModalTheme.card,
															templateModalTheme.cardHover,
															"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
														)}
													>
														<div className="mb-4 flex items-start justify-between gap-3">
															<span
																className={cn(
																	"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-105",
																	templateModalTheme.icon,
																	templateModalTheme.iconHover,
																)}
															>
																<Layers
																	className={cn(
																		"h-5 w-5",
																		TEMPLATE_MODAL_ICON_GLYPH,
																	)}
																	aria-hidden
																/>
															</span>
															<Badge
																variant="secondary"
																className="shrink-0 border border-sky-300/50 bg-sky-200/50 text-[12px] uppercase tracking-wide text-sky-950 dark:border-sky-700 dark:bg-sky-900/80 dark:text-sky-200"
															>
																{
																	template.category
																}
															</Badge>
														</div>
														<span className="mb-1 line-clamp-2 font-semibold leading-snug text-sky-950 dark:text-sky-100">
															{template.name}
														</span>
														<p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-sky-900/80 dark:text-sky-400">
															{
																template.description
															}
														</p>
														<div className="mt-auto flex flex-wrap gap-2">
															<span
																className={cn(
																	"rounded-md px-2 py-0.5 text-xs tabular-nums ring-1",
																	templateModalTheme.chip,
																)}
															>
																{phases}{" "}
																{phases === 1
																	? "phase"
																	: "phases"}
															</span>
															<span
																className={cn(
																	"rounded-md px-2 py-0.5 text-xs tabular-nums ring-1",
																	templateModalTheme.chip,
																)}
															>
																{tasks}{" "}
																{tasks === 1
																	? "task"
																	: "tasks"}
															</span>
														</div>
													</button>
												);
											})}
										</div>
									</section>
								)}

								{customTemplates.length > 0 && !customEmpty && (
									<section aria-labelledby="tpl-custom">
										<h3
											id="tpl-custom"
											className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
										>
											Your templates
										</h3>
										<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
											{filteredCustom.map((template) => {
												const { phases, tasks } =
													templateStats(template);
												return (
													<button
														key={template.id}
														type="button"
														onClick={() =>
															applyTemplate(
																template,
															)
														}
														className={cn(
															"group flex w-full flex-col rounded-2xl border p-5 text-left shadow-sm ring-1 transition-all",
															templateModalTheme.card,
															templateModalTheme.cardHover,
															"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
														)}
													>
														<div className="mb-4 flex items-start justify-between gap-3">
															<span
																className={cn(
																	"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-105",
																	templateModalTheme.icon,
																	templateModalTheme.iconHover,
																)}
															>
																<User
																	className={cn(
																		"h-5 w-5",
																		TEMPLATE_MODAL_ICON_GLYPH,
																	)}
																	aria-hidden
																/>
															</span>
															<Badge
																variant="secondary"
																className="shrink-0 border border-sky-300/50 bg-sky-200/50 text-sky-950 dark:border-sky-700 dark:bg-sky-900/80 dark:text-sky-200"
															>
																Custom
															</Badge>
														</div>
														<span className="mb-1 line-clamp-2 font-semibold leading-snug text-sky-950 dark:text-sky-100">
															{template.name}
														</span>
														<p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-sky-900/80 dark:text-sky-400">
															{
																template.description
															}
														</p>
														<div className="mt-auto flex flex-wrap gap-2">
															<span
																className={cn(
																	"rounded-md px-2.5 py-1 text-xs tabular-nums ring-1",
																	templateModalTheme.chip,
																)}
															>
																{phases}{" "}
																{phases === 1
																	? "phase"
																	: "phases"}
															</span>
															<span
																className={cn(
																	"rounded-md px-2.5 py-1 text-xs tabular-nums ring-1",
																	templateModalTheme.chip,
																)}
															>
																{tasks}{" "}
																{tasks === 1
																	? "task"
																	: "tasks"}
															</span>
														</div>
													</button>
												);
											})}
										</div>
									</section>
								)}

								<section
									className="lg:col-span-3"
									aria-labelledby="tpl-scratch"
								>
									<h3
										id="tpl-scratch"
										className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
									>
										Without a template
									</h3>
									<button
										type="button"
										onClick={() =>
											setIsTemplateDialogOpen(false)
										}
										className={cn(
											"flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/15 px-6 py-10 text-center transition-all",
											"hover:border-primary/45 hover:bg-muted/35",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										)}
									>
										<span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground ring-1 ring-border/40">
											<Plus
												className="h-6 w-6"
												aria-hidden
											/>
										</span>
										<span className="text-base font-semibold text-foreground">
											Start from scratch
										</span>
										<span className="mt-1 max-w-md text-sm text-muted-foreground">
											Close this dialog and add phases
											manually in the list below.
										</span>
									</button>
								</section>
							</div>
						)}
					</div>

					<DialogFooter className="gap-2 border-t border-border/60 bg-muted/25 px-6 py-4 sm:justify-end">
						<Button
							type="button"
							variant="outline"
							className={modalButtonCancelClass}
							onClick={() => setIsTemplateDialogOpen(false)}
						>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default TemplateSelectModal;
