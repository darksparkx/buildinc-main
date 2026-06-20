import { institutionalPhases, phase, task } from "../blueprintHelpers";
import type { RulePackDefinition } from "../types";

const schoolPhases = institutionalPhases(false).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Classrooms & labs",
				"Classroom blocks, labs, sports, and support fit-out",
				p.weight,
				[
					...p.tasks,
					task("Classroom furniture & boards", "Desks, boards, and lab benches", 0.04, 14),
					task("Sports & playground", "Courts, fields, and equipment", 0.04, 14),
				],
			)
		: p,
);

const hospitalPhases = institutionalPhases(true).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Clinical & support fit-out",
				"OT, wards, diagnostics, and support",
				p.weight,
				[
					...p.tasks,
					task("OT & diagnostics", "Operating theatres and imaging suites", 0.05, 35),
					task("Medical gas terminal units", "Bedhead panels and gas outlets", 0.04, 14),
				],
			)
		: p,
);

const religiousPhases = institutionalPhases(false).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Sacred & community spaces",
				"Main hall, ancillary rooms, and finishes",
				p.weight,
				[
					...p.tasks,
					task("Main hall specialty finishes", "Altar area, acoustics, and seating", 0.05, 14),
				],
			)
		: p,
);

const communityHallPhases = institutionalPhases(false).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Hall & multipurpose fit-out",
				"Auditorium seating, stage, and services",
				p.weight,
				[
					...p.tasks,
					task("Auditorium seating & stage", "Seating, stage, and AV infrastructure", 0.05, 14),
				],
			)
		: p,
);

const governmentPhases = institutionalPhases(false).map((p) =>
	p.name === "Planning & approvals"
		? phase(
				"Planning & approvals",
				"PWD/CPWD norms and clearances",
				p.weight,
				[
					...p.tasks,
					task("PWD compliance review", "Design compliance with government norms", 0.04, 14),
				],
			)
		: p,
);

export const INSTITUTIONAL_PACKS: Record<string, RulePackDefinition> = {
	N1: { projectTypeId: "N1", phases: schoolPhases, benchmarkMultiplier: 1 },
	N2: { projectTypeId: "N2", phases: hospitalPhases, benchmarkMultiplier: 1.18 },
	N3: { projectTypeId: "N3", phases: religiousPhases, benchmarkMultiplier: 0.95 },
	N4: { projectTypeId: "N4", phases: communityHallPhases, benchmarkMultiplier: 0.92 },
	N5: { projectTypeId: "N5", phases: governmentPhases, benchmarkMultiplier: 1.02 },
};
