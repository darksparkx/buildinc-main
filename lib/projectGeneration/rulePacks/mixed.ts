import { MAT, phase, standardCivilPhases, task } from "../blueprintHelpers";
import type { RulePackDefinition } from "../types";

const mixedPodiumPhases = standardCivilPhases({ includeElevator: true }).map(
	(p) =>
		p.name === "Structure"
			? phase(
					"Structure — retail podium + tower",
					"Podium retail frame and residential tower",
					p.weight,
					[
						...p.tasks,
						task("Retail podium structure", "Podium slabs and retail shell", 0.06, 28),
						task("Transfer slab / girders", "Transfer structure if required", 0.04, 14),
					],
				)
			: p.name === "Finishes & interiors"
				? phase(
						"Dual-use finishes",
						"Retail shell handover and residential fit-out",
						p.weight,
						[
							...p.tasks,
							task("Retail shell handover", "Shell for retail tenants", 0.05, 18),
							task("Residential common areas", "Lobby, corridors, and amenities", 0.05, 14),
						],
					)
				: p,
);

const townshipPhases = [
	phase("Master planning & approvals", "Layout, DP, and bulk permissions", 0.1, [
		task("Master plan & layout", "Plotting, roads, and zoning", 0.25, 28),
		task("Infrastructure planning", "Water, power, STP, and drainage master plan", 0.2, 21),
		task("Statutory approvals", "Development authority and utility NOCs", 0.25, 21),
		task("BOQ & contractor award", "Tendering and phased contractor awards", 0.15, 14),
		task("Mobilisation plan", "Phasing, traffic, and logistics", 0.15, 10),
	]),
	phase("External infrastructure", "Roads, water, power, drainage", 0.22, [
		task("Internal roads & paving", "Roads, SWD, and street lighting", 0.3, 35),
		task("Water & sewer backbone", "UG water, sewer, and pumping", 0.25, 28, [MAT.pipe]),
		task("Power & street lighting", "HT/LT backbone and street lights", 0.25, 21, [MAT.wire]),
		task("STP & utilities", "STP, transformer yards, and chambers", 0.2, 21),
	]),
	phase("Plot development — civil", "Villa/row/plot civil packages", 0.35, [
		task("Plot civil — phase 1", "Foundations and structure — first batch", 0.35, 42, [MAT.concrete, MAT.steel]),
		task("Plot civil — phase 2", "Subsequent plot batches", 0.35, 42, [MAT.concrete, MAT.steel]),
		task("Plot MEP rough-in", "UG services to plot boundaries", 0.15, 21, [MAT.pipe, MAT.wire]),
		task("Plot envelope & roofing", "Roof, facade, and external doors per typology", 0.15, 28),
	]),
	phase("Amenities & clubhouse", "Clubhouse, pool, and landscape", 0.15, [
		task("Clubhouse structure", "Clubhouse civil and shell", 0.3, 21, [MAT.concrete, MAT.steel]),
		task("Clubhouse MEP & finishes", "Clubhouse fit-out and equipment", 0.35, 21),
		task("Landscape & amenities", "Parks, pool, jogging track, lighting", 0.35, 18),
	]),
	phase("Handover & snagging", "Plot handovers and defect closure", 0.08, [
		task("Plot handovers", "Individual plot snag and handover", 0.5, 14),
		task("Estate O&M setup", "Security, billing, and manuals", 0.5, 7),
	]),
	phase("Testing & closeout", "Final inspections and documentation", 0.1, [
		task("Utilities testing", "STP, water, and power testing", 0.4, 7),
		task("Estate snag & defects", "Common area punch list", 0.3, 7),
		task("Final documentation", "As-builts, OC, and compliance", 0.3, 5),
	]),
];

export const MIXED_PACKS: Record<string, RulePackDefinition> = {
	M2: { projectTypeId: "M2", phases: mixedPodiumPhases, benchmarkMultiplier: 1.05 },
	M3: { projectTypeId: "M3", phases: townshipPhases, benchmarkMultiplier: 0.95 },
};
