import { industrialShellPhases, MAT, phase, task } from "../blueprintHelpers";
import type { RulePackDefinition } from "../types";

const warehousePhases = industrialShellPhases();

const factoryPhases = industrialShellPhases().map((p) =>
	p.name === "MEP & utilities"
		? phase(
				"MEP, utilities & process",
				"Power, compressed air, process drains, and fire",
				p.weight,
				[
					...p.tasks,
					task("Process utilities package", "Compressed air, trade waste, and gas", 0.06, 14),
				],
			)
		: p,
);

const coldStoragePhases = factoryPhases.map((p) =>
	p.name === "Superstructure"
		? phase(
				"Insulated shell",
				"Insulated panels, cold rooms, and docks",
				p.weight,
				[
					...p.tasks,
					task("Cold room build", "Chambers, doors, and insulated flooring", 0.06, 18),
					task("Loading docks", "Dock levelers and canopies", 0.04, 10),
				],
			)
		: p.name === "MEP, utilities & process"
			? phase(
					"Refrigeration & MEP",
					"Refrigeration plant and electrical",
					p.weight,
					[
						...p.tasks,
						task("Refrigeration plant", "Compressors, condensers, and piping", 0.06, 21),
					],
				)
			: p,
);

const shedPhases = industrialShellPhases().map((p) =>
	p.name === "Superstructure"
		? phase(
				"PEB / shed erection",
				"Pre-engineered building erection",
				p.weight,
				[
					...p.tasks,
					task("PEB erection support", "Crane hire, bolting, and alignment QA", 0.05, 7),
				],
			)
		: p,
);

export const INDUSTRIAL_PACKS: Record<string, RulePackDefinition> = {
	I1: { projectTypeId: "I1", phases: warehousePhases, benchmarkMultiplier: 0.88 },
	I2: { projectTypeId: "I2", phases: factoryPhases, benchmarkMultiplier: 1 },
	I3: { projectTypeId: "I3", phases: coldStoragePhases, benchmarkMultiplier: 1.15 },
	I4: { projectTypeId: "I4", phases: shedPhases, benchmarkMultiplier: 0.82 },
};
