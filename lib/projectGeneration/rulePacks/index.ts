import type {
	ProjectCreationQuestionnaire,
	ProjectTypeId,
	RulePackDefinition,
} from "../types";
import { PRIORITY_A_TYPE_IDS } from "../types";
import { RESIDENTIAL_PACKS } from "./residential";
import { COMMERCIAL_PACKS } from "./commercial";
import { MIXED_PACKS } from "./mixed";
import { INDUSTRIAL_PACKS } from "./industrial";
import { INSTITUTIONAL_PACKS } from "./institutional";
import { stubPackForQuestionnaire } from "./stub";

const ALL_PACKS: Partial<Record<ProjectTypeId, RulePackDefinition>> = {
	...RESIDENTIAL_PACKS,
	...COMMERCIAL_PACKS,
	...MIXED_PACKS,
	...INDUSTRIAL_PACKS,
	...INSTITUTIONAL_PACKS,
};

export function getRulePack(
	typeId: ProjectTypeId,
	questionnaire: ProjectCreationQuestionnaire,
): RulePackDefinition {
	if (
		questionnaire.deliveryMode === "fit_out" &&
		["C1", "C2", "C3", "C4", "C5"].includes(typeId)
	) {
		const base = ALL_PACKS[typeId];
		if (base) {
			return {
				...base,
				benchmarkMultiplier: (base.benchmarkMultiplier ?? 1) * 0.55,
			};
		}
	}

	const pack = ALL_PACKS[typeId];
	if (pack) return pack;

	return stubPackForQuestionnaire({
		...questionnaire,
		projectTypeId: typeId,
	});
}

export function isFullRulePack(typeId: ProjectTypeId): boolean {
	return PRIORITY_A_TYPE_IDS.includes(typeId);
}

export function listRulePacks(): RulePackDefinition[] {
	return PRIORITY_A_TYPE_IDS.map(
		(id) => ALL_PACKS[id]!,
	).filter(Boolean);
}
