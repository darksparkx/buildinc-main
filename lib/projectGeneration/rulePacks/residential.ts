import { MAT, phase, standardCivilPhases, task } from "../blueprintHelpers";
import type { RulePackDefinition } from "../types";

const villaPhases = standardCivilPhases({ includeElevator: false });

const rowHousePhases = standardCivilPhases({ includeElevator: false }).map((p) =>
	p.name === "External works & landscaping"
		? phase(
				"External works & landscaping",
				"Compound, paving, boundary, and landscape",
				p.weight,
				[
					...p.tasks,
					task(
						"Shared boundary works",
						"Party walls and shared drive coordination",
						0.08,
						7,
					),
				],
			)
		: p,
);

const lowRisePhases = standardCivilPhases({ includeElevator: false }).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Finishes & common areas",
				"Flats, lobbies, and common amenities",
				p.weight,
				[
					...p.tasks,
					task(
						"Common amenities",
						"Clubhouse, STP, and common toilets",
						0.08,
						14,
					),
				],
			)
		: p,
);

const midRisePhases = standardCivilPhases({ includeElevator: true }).map((p) =>
	p.name === "Building envelope"
		? phase(
				"Building envelope",
				"Roof, facade, glazing, and waterproofing",
				p.weight,
				[
					...p.tasks,
					task("Tower facade & WP", "High-rise facade and podium waterproofing", 0.08, 21),
				],
			)
		: p,
);

const highRisePhases = midRisePhases.map((p) =>
	p.name === "Planning & approvals"
		? phase(
				"Planning & approvals",
				"Design, fire NOC, and high-rise clearances",
				p.weight,
				[
					...p.tasks,
					task("Fire & high-rise NOC", "Fire department and aviation clearance", 0.06, 21),
				],
			)
		: p,
);

const farmhousePhases = standardCivilPhases({ includeElevator: false }).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Finishes & outdoor",
				"Interiors, pool, and landscape",
				p.weight,
				[
					task("Interiors", "Flooring, paint, kitchens", 0.35, 18, [MAT.tiles, MAT.paint]),
					task("Outdoor & pool", "Deck, pool, and landscape", 0.25, 14),
					task("Electrical fixtures", "Switches, lights, fans, and appliances", 0.1, 10, [MAT.wire]),
					task("Sanitary & plumbing fixtures", "WC, basins, showers, and connections", 0.1, 10, [MAT.pipe]),
					task("Painting & polishing", "Final paint, polish, and touch-ups", 0.1, 14, [MAT.paint]),
					task("Kitchen & joinery", "Modular kitchen, wardrobes, and counters", 0.1, 14),
				],
			)
		: p,
);

export const RESIDENTIAL_PACKS: Record<string, RulePackDefinition> = {
	R1: { projectTypeId: "R1", phases: villaPhases, benchmarkMultiplier: 1 },
	R2: { projectTypeId: "R2", phases: rowHousePhases, benchmarkMultiplier: 0.98 },
	R3: { projectTypeId: "R3", phases: lowRisePhases, benchmarkMultiplier: 1 },
	R4: { projectTypeId: "R4", phases: midRisePhases, benchmarkMultiplier: 1.02 },
	R5: { projectTypeId: "R5", phases: highRisePhases, benchmarkMultiplier: 1.05 },
	R8: { projectTypeId: "R8", phases: farmhousePhases, benchmarkMultiplier: 0.92 },
};
