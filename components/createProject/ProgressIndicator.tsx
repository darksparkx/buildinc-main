import React, { Dispatch, SetStateAction, Fragment } from "react";
import { Button } from "@/components/base/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { IProjectCreationData } from "@/lib/types";
import { cn } from "@/lib/functions/utils";
import type { ProjectCreationQuestionnaire } from "@/lib/projectGeneration/types";
import { applyGeneratedPlanToProject } from "@/lib/projectGeneration/applyGeneratedPlan";

type ProgressIndicatorProps = {
	currentStep: number;
	steps: string[];
	totalSteps: number;
	setCurrentStep: Dispatch<SetStateAction<number>>;
	projectData: IProjectCreationData;
	setProjectData: Dispatch<SetStateAction<IProjectCreationData>>;
	setValidationErrors: Dispatch<SetStateAction<Record<string, string>>>;
	validationErrors?: Record<string, string>;
	questionnaireSubStep?: number;
	setQuestionnaireSubStep?: Dispatch<SetStateAction<number>>;
	questionnaire?: ProjectCreationQuestionnaire;
	validateFullQuestionnaire?: (
		q: ProjectCreationQuestionnaire,
	) => Record<string, string>;
};

const ProgressIndicator = ({
	currentStep,
	setCurrentStep,
	projectData,
	setProjectData,
	steps,
	totalSteps,
	setValidationErrors,
	validationErrors = {},
	questionnaireSubStep = 5,
	setQuestionnaireSubStep,
	questionnaire,
	validateFullQuestionnaire,
}: ProgressIndicatorProps) => {
	const validatePhasesAndTasks = (includeMaterials: boolean) => {
		const errors: Record<string, string> = {};
		if (!projectData.phases || projectData.phases.length === 0) {
			errors.phases = "At least one phase with tasks is required";
			return errors;
		}
		projectData.phases.forEach((phase, pIdx) => {
			const phaseBudget = Number(phase?.budget ?? 0);
			if (!phase?.budget || phaseBudget <= 0) {
				errors[`phase_${pIdx}_budget`] = `Phase ${pIdx + 1} budget is required`;
			}
			if (!phase.tasks || phase.tasks.length === 0) {
				errors[`phase_${pIdx}_tasks`] = `Phase ${pIdx + 1} must have at least one task`;
				return;
			}
			let tasksTotal = 0;
			phase.tasks.forEach((task, tIdx) => {
				const taskBudget = Number(task?.plannedBudget ?? 0);
				if (!task?.plannedBudget || taskBudget <= 0) {
					errors[`phase_${pIdx}_task_${tIdx}_budget`] =
						`Task ${tIdx + 1} in phase ${pIdx + 1} requires a valid budget`;
				}
				tasksTotal += taskBudget;
				if (includeMaterials) {
					const materials = Array.isArray(task?.materials) ? task.materials : [];
					const materialTotal = materials.reduce((sum, m) => {
						return (
							sum +
							Number(m?.unitCost ?? 0) * Number(m?.plannedQuantity ?? 1)
						);
					}, 0);
					if (taskBudget < materialTotal) {
						errors.Error = `Task ${tIdx + 1} in phase ${pIdx + 1}: planned budget is below material cost`;
					}
				}
			});
			if (phaseBudget > 0 && tasksTotal > phaseBudget) {
				errors[`phase_${pIdx + 1}`] = `Task budgets exceed phase ${pIdx + 1} budget`;
			}
		});
		return errors;
	};

	const validateStep = (step: number) => {
		let errors: Record<string, string> = {};

		if (step === 1 && questionnaire && validateFullQuestionnaire) {
			if (questionnaireSubStep < 5) {
				errors.questionnaire = "Complete all 5 questionnaire steps (use Continue)";
				setValidationErrors(errors);
				return false;
			}
			errors = validateFullQuestionnaire(questionnaire);
		}

		if (step === 3) {
			errors = { ...errors, ...validatePhasesAndTasks(false) };
		}

		if (step === 4) {
			errors = { ...errors, ...validatePhasesAndTasks(true) };
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const nextStep = () => {
		if (!validateStep(currentStep)) return;

		if (currentStep === 2 && questionnaire) {
			try {
				const generated = applyGeneratedPlanToProject(questionnaire);
				setProjectData((prev) => ({
					...prev,
					...generated,
					questionnaire,
					name: questionnaire.name,
					description: questionnaire.description,
					organisationId: questionnaire.organisationId,
					supervisor: questionnaire.supervisor,
					supervisorName: questionnaire.supervisorName,
					location: questionnaire.location,
					startDate: questionnaire.startDate,
					endDate: questionnaire.endDate,
					projectTypeId: questionnaire.projectTypeId,
				}));
			} catch (e) {
				setValidationErrors({
					generate:
						e instanceof Error ? e.message : "Could not generate plan",
				});
				return;
			}
		}

		if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
	};

	const prevStep = () => {
		if (currentStep === 1 && questionnaireSubStep > 1 && setQuestionnaireSubStep) {
			setQuestionnaireSubStep(questionnaireSubStep - 1);
			return;
		}
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	};

	const prevDisabled = currentStep === 1 && questionnaireSubStep <= 1;

	return (
		<div className="space-y-6">
			<nav aria-label="Create project steps" className="w-full">
				<div className="flex w-full items-center">
					{steps.map((_, i) => {
						const step = i + 1;
						const isActive = step === currentStep;
						const isDone = step < currentStep;

						return (
							<Fragment key={step}>
								<div className="relative z-[2] flex shrink-0 flex-col items-center">
									<div
										className={cn(
											"flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors sm:h-11 sm:w-11",
											isDone &&
												"border-blue-600 bg-blue-600 text-white shadow-md dark:border-blue-500 dark:bg-blue-600",
											isActive &&
												!isDone &&
												"border-blue-600 bg-blue-600 text-white shadow-md ring-4 ring-blue-500/35 dark:ring-blue-500/25",
											!isActive &&
												!isDone &&
												"border-border bg-muted/70 text-muted-foreground",
										)}
									>
										{isDone ? (
											<Check
												className="h-5 w-5"
												strokeWidth={2.5}
												aria-hidden
											/>
										) : (
											<span>{step}</span>
										)}
									</div>
								</div>

								{step < totalSteps && (
									<div
										className={cn(
											"relative z-[1] mx-[-6px] min-h-[3px] min-w-[0.5rem] flex-1 rounded-full sm:mx-[-8px] sm:min-h-[4px]",
											step < currentStep
												? "bg-blue-500 dark:bg-blue-500"
												: "bg-border",
										)}
										aria-hidden
									/>
								)}
							</Fragment>
						);
					})}
				</div>
			</nav>

			{validationErrors.questionnaire && currentStep === 1 && (
				<p className="text-center text-sm text-destructive">
					{validationErrors.questionnaire}
				</p>
			)}
			{validationErrors.generate && currentStep === 2 && (
				<p className="text-center text-sm text-destructive">
					{validationErrors.generate}
				</p>
			)}

			<div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-3 py-3 ring-1 ring-border/40 sm:px-4">
				<Button
					variant="outline"
					type="button"
					onClick={prevStep}
					disabled={prevDisabled}
					className="h-10 w-10 shrink-0 rounded-full border-slate-400/50 bg-slate-50 p-0 text-slate-700 shadow-sm ring-1 ring-slate-400/30 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-800"
					aria-label="Previous step"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>

				<p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground sm:text-base">
					{steps[currentStep - 1]}
					<span className="mt-0.5 block text-xs font-normal text-muted-foreground sm:mt-1">
						Step {currentStep} of {totalSteps}
						{currentStep === 1 && questionnaireSubStep < 5
							? ` · Question ${questionnaireSubStep}/5`
							: ""}
						{currentStep === 2 ? " · Next builds your plan" : ""}
					</span>
				</p>

				<Button
					type="button"
					onClick={nextStep}
					className={cn(
						"h-10 w-10 shrink-0 rounded-full p-0 shadow-sm",
						currentStep === totalSteps
							? "border border-border/60 bg-muted/50 text-muted-foreground ring-1 ring-border/30 hover:bg-muted/70"
							: "border border-blue-500/45 bg-blue-600 text-white ring-1 ring-blue-500/30 hover:bg-blue-700 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-500",
					)}
					aria-label={
						currentStep === totalSteps
							? "Continue on this step"
							: currentStep === 2
								? "Generate plan and continue"
								: "Next step"
					}
				>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default ProgressIndicator;
