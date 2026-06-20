import {
	fitOutPhases,
	MAT,
	phase,
	standardCivilPhases,
	task,
} from "../blueprintHelpers";
import type {
	ProjectCreationQuestionnaire,
	ProjectTypeId,
	RulePackDefinition,
} from "../types";
import { getProjectType } from "../projectTypes";

/** Minimal generic plan for Priority B types */
export function stubRulePack(typeId: ProjectTypeId): RulePackDefinition {
	const type = getProjectType(typeId);
	const isFitOut =
		type?.group === "Residential renovation" ||
		typeId.startsWith("C8") ||
		typeId.startsWith("C9") ||
		typeId.startsWith("C10") ||
		typeId.startsWith("C11") ||
		typeId === "O1";

	if (isFitOut || typeId === "R9" || typeId === "R10") {
		return {
			projectTypeId: typeId,
			phases: fitOutPhases(),
			benchmarkMultiplier: 0.85,
		};
	}

	if (type?.group === "Infrastructure" || typeId.startsWith("S")) {
		return {
			projectTypeId: typeId,
			phases: [
				phase("Planning & approvals", "Surveys, design, and authority approvals", 0.1, [
					task("Survey & design", "Topography, alignment, and drawings", 0.35, 14),
					task("BOQ & tender", "Estimates, tender, and award", 0.25, 10),
					task("Statutory approvals", "Municipal / utility NOCs", 0.25, 14),
					task("Mobilisation plan", "Traffic, safety, and logistics plan", 0.15, 7),
				]),
				phase("Site mobilisation", "Site establishment and temporary works", 0.08, [
					task("Site office & utilities", "Camp, power, and water", 0.5, 7),
					task("Traffic & safety setup", "Diversion, signage, and barricades", 0.5, 5),
				]),
				phase("Earthwork & structures", "Excavation, culverts, and structures", 0.42, [
					task("Earthwork & grading", "Cut, fill, and compaction", 0.3, 14),
					task("Drainage & culverts", "Storm drains, culverts, and manholes", 0.25, 14, [MAT.pipe, MAT.concrete]),
					task("Pavement & structures", "Roads, retaining walls, and bridges", 0.25, 21, [MAT.concrete, MAT.steel]),
					task("Boundary & fencing", "Compound wall and gates", 0.2, 10, [MAT.cement]),
				]),
				phase("Services & finishing", "Utilities, lighting, and landscape", 0.28, [
					task("Water & sewer lines", "UG water, sewer, and chambers", 0.3, 14, [MAT.pipe]),
					task("Electrical & street lighting", "Cabling, poles, and connections", 0.25, 10, [MAT.wire]),
					task("Landscaping & furniture", "Softscape, furniture, and signage", 0.25, 10),
					task("Testing & commissioning", "Load tests and system commissioning", 0.2, 7),
				]),
				phase("Handover", "Documentation and sign-off", 0.12, [
					task("Snag & defect closure", "Punch list and rework", 0.4, 7),
					task("As-built & manuals", "Drawings and O&M documentation", 0.3, 5),
					task("Final handover", "Authority sign-off and maintenance handover", 0.3, 5),
				]),
			],
		};
	}

	return {
		projectTypeId: typeId,
		phases: standardCivilPhases({
			includeElevator:
				type?.legacyCategory === "Commercial" ||
				type?.group === "Mixed-use",
		}),
		benchmarkMultiplier: 0.9,
	};
}

export function stubPackForQuestionnaire(
	q: ProjectCreationQuestionnaire,
): RulePackDefinition {
	const id = q.projectTypeId as ProjectTypeId;
	return stubRulePack(id);
}
