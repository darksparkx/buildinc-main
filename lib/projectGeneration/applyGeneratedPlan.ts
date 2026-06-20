import type { IProjectCreationData } from "@/lib/types";
import type { ProjectCreationQuestionnaire } from "./types";
import {
	generatePlan,
	legacyCategoryFromQuestionnaire,
} from "./generatePlan";
import { getProjectType } from "./projectTypes";
import { snapshotFromQuestionnaire } from "./buildingSpec";

export function applyGeneratedPlanToProject(
	questionnaire: ProjectCreationQuestionnaire,
): Pick<
	IProjectCreationData,
	| "phases"
	| "budget"
	| "budgetPerSqft"
	| "totalSqft"
	| "planGenerated"
	| "category"
	| "buildingSpecJson"
> {
	const typeLabel =
		getProjectType(questionnaire.projectTypeId)?.label ?? "Project";
	const result = generatePlan(questionnaire);
	const spec = snapshotFromQuestionnaire(questionnaire, typeLabel);

	return {
		phases: result.phases,
		budget: result.budget,
		budgetPerSqft: result.budgetPerSqft,
		totalSqft: result.totalSqft,
		planGenerated: true,
		category: legacyCategoryFromQuestionnaire(questionnaire),
		buildingSpecJson: JSON.stringify(spec),
	};
}
