import type { ProjectCreationQuestionnaire } from "./types";

export interface ProjectBuildingSpecSnapshot {
	projectTypeId: string;
	projectTypeLabel: string;
	builtUpSqft: number;
	plotAreaSqft: number | null;
	floorCount: number | null;
	basementOrParking: boolean;
	unitsPerFloor: number | null;
	commercialGfaPercent: number | null;
	residentialGfaPercent: number | null;
	deliveryMode: string;
	finishLevel: string;
	structuralSystem: string | null;
	scopeNotes: string;
	targetBudget: number | null;
	targetBudgetPerSqft: number | null;
	answeredAt: string;
}

export function snapshotFromQuestionnaire(
	q: ProjectCreationQuestionnaire,
	typeLabel: string,
): ProjectBuildingSpecSnapshot {
	return {
		projectTypeId: q.projectTypeId,
		projectTypeLabel: typeLabel,
		builtUpSqft: q.builtUpSqft,
		plotAreaSqft: q.plotAreaSqft,
		floorCount: q.floorCount,
		basementOrParking: q.basementOrParking,
		unitsPerFloor: q.unitsPerFloor,
		commercialGfaPercent: q.commercialGfaPercent,
		residentialGfaPercent: q.residentialGfaPercent,
		deliveryMode: q.deliveryMode,
		finishLevel: q.finishLevel,
		structuralSystem: q.structuralSystem,
		scopeNotes: q.scopeNotes,
		targetBudget: q.targetBudget,
		targetBudgetPerSqft: q.targetBudgetPerSqft,
		answeredAt: new Date().toISOString(),
	};
}
