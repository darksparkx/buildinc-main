import {
	fitOutPhases,
	MAT,
	phase,
	standardCivilPhases,
	task,
} from "../blueprintHelpers";
import type { RulePackDefinition } from "../types";

const officePhases = standardCivilPhases({ includeElevator: true }).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Office fit-out & interiors",
				"Partitions, ceilings, workstations, and MEP fit-out",
				p.weight,
				[
					...p.tasks,
					task("Workstations & pantry", "Open office, meeting rooms, and pantry", 0.05, 10),
				],
			)
		: p,
);

function normalizeWeights<T extends { weight: number }>(items: T[]): T[] {
	const total = items.reduce((s, x) => s + x.weight, 0);
	if (total <= 0) return items;
	return items.map((p) => ({ ...p, weight: p.weight / total }));
}

const itCampusPhases = normalizeWeights(
	officePhases.flatMap((p) => {
		if (p.name === "Site & foundation") {
			return [
				p,
				phase("Campus infrastructure", "Roads, utilities, and landscape backbone", 0.06, [
					task("External utilities", "HT/LT, water, and STP backbone", 0.5, 21),
					task("Internal roads & landscape", "Campus roads and softscape", 0.5, 14),
				]),
			];
		}
		return [p];
	}),
);

const retailPhases = standardCivilPhases({ includeElevator: true }).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Retail interiors & MEP",
				"Storefronts, mall common areas, and tenant coordination",
				p.weight,
				[
					...p.tasks,
					task("Storefronts & signage", "Façade and tenant fronts", 0.05, 14),
					task("Tenant coordination", "Shell & core handover to tenants", 0.04, 10),
				],
			)
		: p,
);

const hotelPhases = standardCivilPhases({ includeElevator: true }).map((p) =>
	p.name === "Finishes & interiors"
		? phase(
				"Hospitality fit-out",
				"Guest rooms, F&B, and back-of-house",
				p.weight,
				[
					...p.tasks,
					task("Guest room fit-out", "Rooms, bathrooms, joinery", 0.06, 28, [MAT.tiles, MAT.paint]),
					task("F&B & public areas", "Lobby, restaurant, banquet", 0.05, 21),
					task("BOH & laundry", "Kitchen, laundry, and stores", 0.04, 14),
				],
			)
		: p,
);

const restaurantFitOutPhases = fitOutPhases().map((p) =>
	p.name === "Finishes & branding"
		? phase(
				"Kitchen & F&B fit-out",
				"Kitchen equipment, dining, and branding",
				p.weight,
				[
					...p.tasks,
					task("Commercial kitchen & exhaust", "Kitchen, hood, and gas lines", 0.08, 14),
				],
			)
		: p,
);

const cinemaPhases = standardCivilPhases({ includeElevator: true }).map((p) =>
	p.name === "MEP rough-in"
		? phase(
				"MEP & acoustics",
				"HVAC, electrical, plumbing, and acoustic treatments",
				p.weight,
				[
					...p.tasks,
					task("Acoustic treatments", "Wall treatments and isolation", 0.05, 14),
					task("Projection & seating", "AV infrastructure and seating platforms", 0.04, 10),
				],
			)
		: p,
);

export const COMMERCIAL_PACKS: Record<string, RulePackDefinition> = {
	C1: { projectTypeId: "C1", phases: officePhases, benchmarkMultiplier: 1 },
	C2: { projectTypeId: "C2", phases: itCampusPhases, benchmarkMultiplier: 1.03 },
	C3: { projectTypeId: "C3", phases: retailPhases, benchmarkMultiplier: 1 },
	C4: { projectTypeId: "C4", phases: retailPhases, benchmarkMultiplier: 1.02 },
	C5: { projectTypeId: "C5", phases: hotelPhases, benchmarkMultiplier: 1.08 },
	C6: {
		projectTypeId: "C6",
		phases: restaurantFitOutPhases,
		benchmarkMultiplier: 1.1,
	},
	C7: { projectTypeId: "C7", phases: cinemaPhases, benchmarkMultiplier: 1.12 },
};
