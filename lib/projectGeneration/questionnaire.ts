import type { ProjectCreationQuestionnaire } from "./types";
import { getProjectType } from "./projectTypes";

export function emptyQuestionnaire(): ProjectCreationQuestionnaire {
	return {
		projectTypeId: "",
		name: "",
		description: "",
		organisationId: "",
		supervisor: "",
		supervisorName: "",
		location: "",
		startDate: null,
		endDate: null,
		builtUpSqft: 0,
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

export function validateQuestionnaireStep(
	step: number,
	q: ProjectCreationQuestionnaire,
): Record<string, string> {
	const errors: Record<string, string> = {};

	if (step === 1) {
		if (!q.projectTypeId) errors.projectTypeId = "Select a project type";
	}

	if (step === 2) {
		if (!q.name.trim()) errors.name = "Project name is required";
		if (!q.organisationId) errors.organisationId = "Organisation is required";
		if (!q.supervisor) errors.supervisor = "Supervisor is required";
		if (!q.location.trim()) errors.location = "Site location is required";
		if (!q.startDate) errors.startDate = "Start date is required";
		if (!q.endDate) errors.endDate = "End date is required";
		if (q.startDate && q.endDate && q.endDate <= q.startDate) {
			errors.endDate = "End date must be after start date";
		}
	}

	if (step === 3) {
		if (!q.builtUpSqft || q.builtUpSqft <= 0) {
			errors.builtUpSqft = "Built-up area (sqft) is required";
		}
		const type = q.projectTypeId ? getProjectType(q.projectTypeId) : null;
		if (type?.group === "Mixed-use" && q.projectTypeId === "M2") {
			const c = q.commercialGfaPercent ?? 0;
			const r = q.residentialGfaPercent ?? 0;
			if (c + r !== 100) {
				errors.gfaSplit = "Commercial + residential GFA must total 100%";
			}
		}
		if (
			["R3", "R4", "R5", "R2", "M3"].includes(q.projectTypeId) &&
			(!q.floorCount || q.floorCount < 1)
		) {
			errors.floorCount = "Floor count is required for this type";
		}
	}

	if (step === 4) {
		if (!q.deliveryMode) errors.deliveryMode = "Select delivery scope";
		if (!q.finishLevel) errors.finishLevel = "Select finish level";
	}

	return errors;
}
