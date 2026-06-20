import {
	Card,
	CardHeader,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/base/ui/card";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TemplateSelectModal from "./TemplateSelectModal";
import PhaseTable from "./PhaseTable";
import { phaseCreationFunctions } from "@/lib/functions/projectCreation";
import { IProjectCreationData, IProjectTemplate } from "@/lib/types";
import { IndianRupee, Layers, Plus } from "lucide-react";
import { Button } from "@/components/base/ui/button";
import { getPhaseSectionTheme } from "@/lib/constants/phaseColorThemes";
import { cn } from "@/lib/functions/utils";

const Phases = ({
	projectData,
	setProjectData,
	customTemplates,
	validationErrors,
	setValidationErrors,
	hideTemplatePicker = false,
}: {
	projectData: IProjectCreationData;
	setProjectData: React.Dispatch<React.SetStateAction<IProjectCreationData>>;
	customTemplates: IProjectTemplate[];
	validationErrors: Record<string, string>;
	setValidationErrors: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
	hideTemplatePicker?: boolean;
}) => {
	const { addPhase, getTotalPhaseBudget, handlePhaseDragEnd } =
		phaseCreationFunctions();
	const phaseTheme = getPhaseSectionTheme();

	return (
		<div className="space-y-8">
			{!hideTemplatePicker && (
				<TemplateSelectModal
					projectData={projectData}
					setProjectData={setProjectData}
					customTemplates={customTemplates}
				/>
			)}

			<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
				<CardHeader className="space-y-4 pb-2">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0 space-y-1">
							<CardTitle className="text-lg sm:text-xl">
								Project phases
							</CardTitle>
							<CardDescription className="text-pretty">
								Organize work into ordered phases with budgets
								and dates.
							</CardDescription>
						</div>
						<div className="flex shrink-0 gap-2">
							{/* <Button
					variant="outline"
					onClick={selectAllPhases}
				>
					Select All
				</Button> */}
							<Button
								type="button"
								variant="default"
								className={cn(
									"h-11 px-5 text-base font-medium shadow-sm",
									phaseTheme.primaryAction,
								)}
								onClick={() => addPhase(setProjectData)}
							>
								<Plus className="mr-2 h-4 w-4" aria-hidden />
								Add phase
							</Button>
						</div>
					</div>
					{validationErrors.phases && (
						<p className="text-sm text-destructive">
							{validationErrors.phases}
						</p>
					)}
				</CardHeader>

				<CardContent className="pb-8">
					{projectData.phases.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-8 py-14 text-center">
							<span
								className={cn(
									"mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
									phaseTheme.icon,
								)}
							>
								<Layers className="h-6 w-6" aria-hidden />
							</span>
							<h3 className="mb-2 text-lg font-medium text-foreground">
								No phases yet
							</h3>
							<p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
								Add a phase or pick a template above to
								pre-fill phases and tasks.
							</p>
						</div>
					) : (
						<DragDropContext
							onDragEnd={(result) =>
								handlePhaseDragEnd(
									result,
									projectData,
									setProjectData
								)
							}
						>
							<Droppable droppableId="phases">
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.droppableProps}
										className="space-y-5"
									>
										{projectData.phases.map(
											(phase, index) => (
												<PhaseTable
													validationErrors={
														validationErrors
													}
													setValidationErrors={
														setValidationErrors
													}
													key={phase.id}
													phase={phase}
													index={index}
													projectData={projectData}
													setProjectData={
														setProjectData
													}
												/>
											)
										)}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>
					)}

					{/* Budget Total */}
					{projectData.phases.length > 0 && (
						<div className="mt-6 rounded-xl border border-border/60 bg-muted/40 p-4 ring-1 ring-border/30">
							<div className="flex items-center justify-between gap-3">
								<span className="font-medium text-foreground">
									Total phase budget
								</span>
								<span className="flex items-center gap-1 text-lg font-bold tabular-nums text-foreground">
									{getTotalPhaseBudget(
										projectData
									).toLocaleString("en-IN")}
									<IndianRupee className="h-4 w-4 shrink-0 text-muted-foreground" />
								</span>
							</div>
							{getTotalPhaseBudget(projectData) >
								projectData.budget && (
								<div className="mt-3 text-sm text-destructive">
									Total phase budgets exceed the project
									budget (
									{projectData.budget.toLocaleString("en-IN")}
									).
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Phases;
