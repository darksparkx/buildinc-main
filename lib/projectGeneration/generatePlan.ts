import type {
	EstimatorRateCard,
	GenerationResult,
	MaterialBlueprint,
	PhaseBlueprint,
	ProjectCreationQuestionnaire,
	RulePackDefinition,
	TaskBlueprint,
} from "./types";
import type { IPhaseTemplate, IMaterialTemplate, ITaskTemplate } from "@/lib/types";
import { getProjectType } from "./projectTypes";
import {
	benchmarkPerSqftForType,
	getRateCard,
} from "./rateCard";
import { getRulePack } from "./rulePacks";

function newId(): string {
	return crypto.randomUUID();
}

function materialFromBlueprint(
	bp: MaterialBlueprint,
	sqft: number,
	rateCard: EstimatorRateCard,
): IMaterialTemplate {
	const qty = bp.fixedQty ?? Math.max(1, Math.ceil((bp.qtyPerSqft ?? 0) * sqft));
	const unitCost =
		rateCard.materialUnitCosts[bp.materialId] ?? bp.unitCost;
	return {
		id: newId(),
		materialId: bp.materialId,
		name: bp.name,
		plannedQuantity: qty,
		unit: bp.unit,
		unitCost,
		defaultUnit: bp.unit,
		units: [bp.unit],
	};
}

function taskFromBlueprint(
	bp: TaskBlueprint,
	phaseBudget: number,
	sqft: number,
	rateCard: EstimatorRateCard,
): ITaskTemplate {
	const materials = (bp.materials ?? []).map((m) =>
		materialFromBlueprint(m, sqft, rateCard),
	);
	const materialCost = materials.reduce(
		(sum, m) => sum + m.unitCost * m.plannedQuantity,
		0,
	);
	let plannedBudget = Math.round(phaseBudget * bp.weight);
	if (materialCost > 0 && plannedBudget < materialCost) {
		plannedBudget = Math.round(materialCost * 1.08);
	}
	return {
		id: newId(),
		name: bp.name,
		description: bp.description,
		estimatedDuration: bp.durationDays,
		plannedBudget,
		materials,
	};
}

function phaseFromBlueprint(
	bp: PhaseBlueprint,
	totalBudget: number,
	sqft: number,
	rateCard: EstimatorRateCard,
): IPhaseTemplate {
	const phaseBudget = Math.round(totalBudget * bp.weight);
	const tasks = bp.tasks.map((t) =>
		taskFromBlueprint(t, phaseBudget, sqft, rateCard),
	);
	const taskSum = tasks.reduce((s, t) => s + t.plannedBudget, 0);
	const budget = taskSum > phaseBudget ? taskSum : phaseBudget;
	const estimatedDuration = tasks.reduce((s, t) => s + t.estimatedDuration, 0);
	return {
		id: newId(),
		name: bp.name,
		description: bp.description,
		budget,
		estimatedDuration,
		tasks,
		startDate: null,
		endDate: null,
	};
}

function normalizePhaseWeights(phases: PhaseBlueprint[]): PhaseBlueprint[] {
	const sum = phases.reduce((s, p) => s + p.weight, 0);
	if (sum <= 0) return phases;
	return phases.map((p) => ({ ...p, weight: p.weight / sum }));
}

export function applyRulePack(
	pack: RulePackDefinition,
	totalBudget: number,
	sqft: number,
	rateCard: EstimatorRateCard,
): IPhaseTemplate[] {
	const phases = normalizePhaseWeights(pack.phases);
	return phases.map((p) => phaseFromBlueprint(p, totalBudget, sqft, rateCard));
}

export function generatePlan(
	questionnaire: ProjectCreationQuestionnaire,
	rateCard: EstimatorRateCard = getRateCard(),
): GenerationResult {
	const warnings: string[] = [];
	const typeId = questionnaire.projectTypeId;
	if (!typeId) {
		throw new Error("Project type is required before generation");
	}

	const sqft = questionnaire.builtUpSqft;
	if (!sqft || sqft <= 0) {
		throw new Error("Built-up area (sqft) is required");
	}

	const pack = getRulePack(typeId, questionnaire);
	const finish = questionnaire.finishLevel || "standard";

	let perSqft = benchmarkPerSqftForType(typeId, rateCard, finish);
	if (pack.benchmarkMultiplier) {
		perSqft = Math.round(perSqft * pack.benchmarkMultiplier);
	}

	let budget = Math.round(sqft * perSqft);

	if (questionnaire.targetBudget && questionnaire.targetBudget > 0) {
		const diff =
			Math.abs(questionnaire.targetBudget - budget) / budget;
		if (diff > 0.15) {
			warnings.push(
				`Target budget differs from estimate by ${Math.round(diff * 100)}%; using generated estimate.`,
			);
		}
	}

	if (
		questionnaire.targetBudgetPerSqft &&
		questionnaire.targetBudgetPerSqft > 0
	) {
		const targetTotal = Math.round(
			questionnaire.targetBudgetPerSqft * sqft,
		);
		if (Math.abs(targetTotal - budget) / budget > 0.15) {
			warnings.push(
				"Target ₹/sqft differs from rate card; using generated estimate.",
			);
		}
	}

	if (questionnaire.deliveryMode === "fit_out") {
		budget = Math.round(budget * 0.55);
		perSqft = Math.round(budget / sqft);
		warnings.push("Fit-out only scope: budget scaled to interior/MEP works.");
	} else if (questionnaire.deliveryMode === "renovation") {
		budget = Math.round(budget * 0.72);
		perSqft = Math.round(budget / sqft);
	} else if (questionnaire.deliveryMode === "extension") {
		budget = Math.round(budget * 0.85);
		perSqft = Math.round(budget / sqft);
	}

	const phases = applyRulePack(pack, budget, sqft, rateCard);
	const rolledBudget = phases.reduce((s, p) => s + p.budget, 0);

	return {
		phases,
		budget: rolledBudget,
		budgetPerSqft: Math.round(rolledBudget / sqft),
		totalSqft: sqft,
		generatedFromTypeId: typeId,
		warnings,
	};
}

export function legacyCategoryFromQuestionnaire(
	q: ProjectCreationQuestionnaire,
): import("@/lib/types").category {
	const type = q.projectTypeId ? getProjectType(q.projectTypeId) : null;
	return type?.legacyCategory ?? "Residential";
}
