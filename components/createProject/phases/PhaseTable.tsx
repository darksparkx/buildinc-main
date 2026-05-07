"use client";
import { Draggable } from "@hello-pangea/dnd";
import {
	Copy,
	Trash2,
	Calendar as CalendarIcon,
	IndianRupee,
	ChevronDown,
	ChevronRight,
} from "lucide-react";
import { phaseCreationFunctions } from "@/lib/functions/projectCreation";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { Button } from "@/components/base/ui/button";
import { Textarea } from "@/components/base/ui/textarea";
import { useState, useEffect } from "react";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { Calendar } from "@/components/base/ui/calendar";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
} from "@/components/base/ui/dialog";
import { IPhaseTemplate, IProjectCreationData } from "@/lib/types";
import { getPhaseSectionTheme } from "@/lib/constants/phaseColorThemes";
import { cn } from "@/lib/functions/utils";

const PhaseTable = ({
	phase,
	index,
	projectData,
	setProjectData,
	validationErrors,
	setValidationErrors,
}: {
	phase: IPhaseTemplate;
	index: number;
	projectData: IProjectCreationData;
	setProjectData: React.Dispatch<React.SetStateAction<IProjectCreationData>>;
	validationErrors: Record<string, string>;
	setValidationErrors: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
}) => {
	const { duplicatePhase, removePhase, updatePhase } =
		phaseCreationFunctions();
	const [startDialogOpen, setStartDialogOpen] = useState(false);
	const [endDialogOpen, setEndDialogOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);

	// budget input state
	const [budgetInput, setBudgetInput] = useState<string>(
		phase.budget ? new Intl.NumberFormat("en-IN").format(phase.budget) : ""
	);

	// auto budget from tasks
	const [autoBudget, setAutoBudget] = useState(0);

	useEffect(() => {
		if (!phase.tasks || phase.tasks.length === 0) return;

		const taskBudgetTotal = phase.tasks.reduce(
			(sum, t) => sum + (t.plannedBudget || 0),
			0
		);

		setAutoBudget(taskBudgetTotal);

		// sync display budget
		setBudgetInput(
			phase.budget
				? new Intl.NumberFormat("en-IN").format(phase.budget)
				: ""
		);

		// initialize if missing
		if (!phase.budget) {
			updatePhase(phase.id, { budget: taskBudgetTotal }, setProjectData);
		}
	}, [phase.tasks, phase.id, setProjectData, phase.budget]);

	const fieldClass =
		"h-11 border-border/60 bg-background/80 shadow-sm ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-ring";

	const phaseTheme = getPhaseSectionTheme();

	return (
		<Draggable
			draggableId={phase.id.toString()}
			index={index}
		>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					className={cn(
						"group/phase rounded-2xl border p-5 shadow-sm backdrop-blur-sm ring-1 transition-all sm:p-6",
						phaseTheme.card,
						phaseTheme.cardHover,
						snapshot.isDragging &&
							cn("shadow-lg", phaseTheme.drag),
					)}
				>
					{/* Header row */}

					<div
						className="flex items-center justify-between cursor-pointer"
						onClick={() => setExpanded(!expanded)}
					>
						<div className="flex min-w-0 items-center gap-3">
							{/* Drag handle icon */}
							<div
								{...provided.dragHandleProps}
								className="cursor-grab"
							>
								{expanded ? (
									<ChevronDown className="h-5 w-5 text-muted-foreground" />
								) : (
									<ChevronRight className="h-5 w-5 text-muted-foreground" />
								)}
							</div>
							<span
								className={cn(
									"shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
									phaseTheme.chip,
								)}
							>
								{index + 1}
							</span>

							{!expanded && (
								<span className="truncate font-semibold">
									{phase.name || "Unnamed Phase"}
								</span>
							)}
							{expanded && (
								<span className="min-w-0 truncate font-semibold">
									{phase.name || "Unnamed Phase"}
								</span>
							)}
						</div>

						<div className="flex shrink-0 items-center gap-2 sm:gap-3">
							{!expanded && (
								<span className="tabular-nums text-muted-foreground">
									{new Intl.NumberFormat("en-IN").format(
										phase.budget || 0
									)}
									{" ₹"}
								</span>
							)}
							<Button
								variant="outline"
								size="icon"
								className={cn(
									"h-9 w-9 shrink-0",
									phaseTheme.outlineIcon,
								)}
								onClick={(e) => {
									e.stopPropagation();
									duplicatePhase(phase, setProjectData);
								}}
								aria-label="Duplicate phase"
							>
								<Copy className="h-4 w-4" />
							</Button>
							<Button
								variant="destructive"
								size="icon"
								className="h-9 w-9 shrink-0"
								onClick={(e) => {
									e.stopPropagation();
									removePhase(phase.id, setProjectData);
								}}
								aria-label="Remove phase"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
					{/* Expanded details */}
					{expanded && (
						<div className="mt-6 space-y-6 border-t border-border/50 pt-6">
							{/* Phase Details */}
							<div className="grid gap-6 md:grid-cols-2">
								<div className="space-y-2">
									<Label className="font-bold">
										Phase Name
									</Label>
									<Input
										className={fieldClass}
										placeholder="Enter phase name"
										value={phase.name}
										onChange={(e) =>
											updatePhase(
												phase.id,
												{ name: e.target.value },
												setProjectData
											)
										}
									/>
								</div>

								{/* Budget */}
								<div className="space-y-2">
									<Label className="font-bold">Budget</Label>
									<div className="relative">
										<IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											className={cn(fieldClass, "pl-10")}
											type="text"
											inputMode="numeric"
											value={budgetInput}
											onFocus={() =>
												setBudgetInput(
													phase.budget
														? String(phase.budget)
														: ""
												)
											}
											onChange={(e) => {
												const onlyDigits =
													e.target.value.replace(
														/[^\d]/g,
														""
													);
												setBudgetInput(onlyDigits);

												const num =
													onlyDigits === ""
														? 0
														: parseInt(
																onlyDigits,
																10
														  );
												updatePhase(
													phase.id,
													{ budget: num },
													setProjectData
												);
											}}
											onBlur={() =>
												setBudgetInput(
													phase.budget
														? new Intl.NumberFormat(
																"en-IN"
														  ).format(phase.budget)
														: "0"
												)
											}
										/>
									</div>
									{phase.budget !== undefined &&
										phase.budget < autoBudget && (
											<p className="text-orange-500 text-sm">
												⚠ Budget is below total task
												budget (
												{new Intl.NumberFormat(
													"en-IN"
												).format(autoBudget)}
												)
											</p>
										)}
								</div>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<Label className="font-bold">Description</Label>
								<Textarea
									className={cn(
										"min-h-[80px] resize-y",
										fieldClass,
									)}
									placeholder="Describe this phase..."
									rows={2}
									value={phase.description}
									onChange={(e) =>
										updatePhase(
											phase.id,
											{ description: e.target.value },
											setProjectData
										)
									}
								/>
							</div>

							{/* Dates */}
							<div className="grid gap-6 md:grid-cols-2 pb-3">
								{/* Start Date */}
								<div className="space-y-1">
									<Label
										htmlFor="start-date"
										className="font-bold"
									>
										Start Date
									</Label>
									<Dialog
										open={startDialogOpen}
										onOpenChange={setStartDialogOpen}
									>
										<DialogTitle></DialogTitle>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												type="button"
												className="h-11 w-full justify-start border-border/60 bg-background/80 text-left font-normal shadow-sm ring-1 ring-border/30"
											>
												<CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
												{phase.startDate
													? formatCalendarDate(phase.startDate)
													: "Pick a date"}
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[425px] p-6">
											<Calendar
												className="w-full"
												mode="single"
												selected={
													phase.startDate || undefined
												}
												onSelect={(date) => {
													if (!date) return;
													updatePhase(
														phase.id,
														{ startDate: date },
														setProjectData
													);
													setStartDialogOpen(false);
												}}
											/>
										</DialogContent>
									</Dialog>
								</div>

								{/* End Date */}
								<div className="space-y-1">
									<Label
										className="font-bold"
										htmlFor="end-date"
									>
										End Date
									</Label>
									<Dialog
										open={endDialogOpen}
										onOpenChange={setEndDialogOpen}
									>
										<DialogTitle></DialogTitle>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												type="button"
												className="h-11 w-full justify-start border-border/60 bg-background/80 text-left font-normal shadow-sm ring-1 ring-border/30"
											>
												<CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
												{phase.endDate
													? formatCalendarDate(phase.endDate)
													: "Pick a date"}
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[425px] p-6">
											<Calendar
												className="w-full"
												mode="single"
												selected={
													phase.endDate || undefined
												}
												onSelect={(date) => {
													if (!date) return;
													updatePhase(
														phase.id,
														{ endDate: date },
														setProjectData
													);
													setEndDialogOpen(false);
												}}
											/>
										</DialogContent>
									</Dialog>
								</div>
							</div>

							{/* Tasks Section */}
							{/* <TaskList
								phase={phase}
								setProjectData={setProjectData}
							/> */}
						</div>
					)}
				</div>
			)}
		</Draggable>
	);
};

export default PhaseTable;
