import type {
	MaterialBlueprint,
	PhaseBlueprint,
	TaskBlueprint,
} from "./types";

export const MAT = {
	cement: {
		materialId: "5",
		name: "Cement",
		unit: "bag",
		unitCost: 380,
		qtyPerSqft: 0.08,
	},
	concrete: {
		materialId: "2",
		name: "Concrete Mix",
		unit: "cubic meters",
		unitCost: 5200,
		qtyPerSqft: 0.012,
	},
	steel: {
		materialId: "1",
		name: "Steel Rebar",
		unit: "tons",
		unitCost: 62000,
		qtyPerSqft: 0.0015,
	},
	wire: {
		materialId: "4",
		name: "Electrical Wire",
		unit: "meter",
		unitCost: 45,
		qtyPerSqft: 0.35,
	},
	pipe: {
		materialId: "6",
		name: "PVC Pipe",
		unit: "meter",
		unitCost: 120,
		qtyPerSqft: 0.2,
	},
	tiles: {
		materialId: "7",
		name: "Tiles",
		unit: "sqft",
		unitCost: 85,
		qtyPerSqft: 0.45,
	},
	paint: {
		materialId: "8",
		name: "Paint",
		unit: "litre",
		unitCost: 280,
		qtyPerSqft: 0.06,
	},
	drywall: {
		materialId: "3",
		name: "Drywall Sheets",
		unit: "piece",
		unitCost: 420,
		qtyPerSqft: 0.04,
	},
} as const satisfies Record<string, MaterialBlueprint>;

export function task(
	name: string,
	description: string,
	weight: number,
	durationDays: number,
	materials?: MaterialBlueprint[],
): TaskBlueprint {
	return { name, description, weight, durationDays, materials };
}

export function phase(
	name: string,
	description: string,
	weight: number,
	tasks: TaskBlueprint[],
): PhaseBlueprint {
	return { name, description, weight, tasks };
}

/**
 * End-to-end construction lifecycle: pre-construction through handover.
 * Weights are normalized by the generator if packs adjust them.
 */
export function standardCivilPhases(opts: {
	planningWeight?: number;
	includeElevator?: boolean;
}): PhaseBlueprint[] {
	const planning = opts.planningWeight ?? 0.07;
	const site = 0.11;
	const structure = 0.2;
	const envelope = 0.08;
	const mep = 0.18;
	const interior = 0.22;
	const external = 0.07;
	const closeout = 0.07;

	const coreTask = opts.includeElevator
		? task(
				"Lift shaft & machine room",
				"Lift pit, shaft, machine room, and staircase",
				0.12,
				21,
				[MAT.steel],
			)
		: task(
				"Staircase & service cores",
				"Staircase, lift shaft prep, and service risers",
				0.12,
				14,
				[MAT.steel],
			);

	return [
		phase(
			"Planning & approvals",
			"Pre-construction design, estimates, permits, and contracts",
			planning,
			[
				task("Feasibility & site survey", "Topography, soil investigation, and constraints", 0.1, 14),
				task("Architectural design", "Concept through GFC drawings and coordination", 0.18, 28),
				task("Structural & MEP design", "Structural calculations and service layouts", 0.18, 28),
				task("BOQ & cost planning", "Detailed quantities and budget baseline", 0.12, 10),
				task("Statutory approvals", "Municipal, fire, environment, and utility NOCs", 0.18, 21),
				task("Tender & contractor award", "Tendering, evaluation, and LOA / agreements", 0.12, 14),
				task("Insurance & bonds", "Project insurance, performance bank guarantee", 0.06, 7),
				task("Mobilisation plan", "Master schedule, logistics, and site logistics plan", 0.06, 7),
			],
		),
		phase(
			"Site & foundation",
			"Mobilisation, earthwork, substructure, and grade slab prep",
			site,
			[
				task("Site mobilisation", "Site office, stores, workforce camp, and utilities", 0.1, 7, [MAT.cement]),
				task("Hoarding & safety setup", "Barricades, signage, and HSE compliance", 0.08, 5),
				task("Setting out & excavation", "Survey pegging, excavation, and shoring if required", 0.15, 14, [MAT.concrete]),
				task("Anti-termite & PCC", "Soil treatment, PCC, and blinding concrete", 0.12, 7, [MAT.cement, MAT.concrete]),
				task("Foundations", "Footings, raft, or pile caps to plinth", 0.22, 21, [MAT.steel, MAT.concrete]),
				task("Plinth & grade slab", "Plinth beam, backfill, compaction, and grade slab", 0.18, 14, [MAT.steel, MAT.concrete]),
				task("Underground services", "UG drainage, water lines, and sump tanks", 0.1, 10, [MAT.pipe]),
				task("Substructure waterproofing", "Basement / plinth tanking and protection board", 0.05, 7),
			],
		),
		phase(
			"Structure",
			"Superstructure frame, slabs, and vertical circulation",
			structure,
			[
				task("Columns & shear walls", "RCC columns, walls, and vertical elements", 0.2, 28, [MAT.steel, MAT.concrete]),
				task("Beams & band beams", "Beam shuttering, rebar, and concrete pour", 0.18, 28, [MAT.steel, MAT.concrete]),
				task("Floor slabs (all levels)", "Slab cycles, curing, and structural QA", 0.22, 35, [MAT.steel, MAT.concrete]),
				coreTask,
				task("Block work (shell)", "External / internal block work to lintel level", 0.12, 14, [MAT.cement]),
				task("Parapet & overhead tank", "Parapet, OHT, and terrace structure", 0.08, 10, [MAT.concrete]),
				task("Structural audits", "Cube tests, NDT, and engineer inspections", 0.06, 7),
			],
		),
		phase(
			"Building envelope",
			"Roof, facade, glazing, and weatherproofing",
			envelope,
			[
				task("Roof waterproofing & insulation", "Terrace treatment, insulation, and finishes", 0.22, 14),
				task("External plaster & cladding", "Facade plaster, cladding, or stone", 0.2, 18),
				task("Windows & glazing", "Aluminium / uPVC windows and glazing", 0.18, 14),
				task("External doors & shutters", "Main doors, rolling shutters, and grills", 0.12, 10),
				task("Facade services penetrations", "Sealants and service penetrations in envelope", 0.1, 7),
				task("Rainwater & facade drainage", "Rain pipes, chajjas, and drip details", 0.1, 7, [MAT.pipe]),
				task("External paint & sealants", "Exterior paint and expansion joint sealants", 0.08, 7, [MAT.paint]),
			],
		),
		phase(
			"MEP rough-in",
			"Electrical, plumbing, HVAC, fire, and vertical transport",
			mep,
			[
				task("HT / LT & substation", "Incoming supply, panels, and earthing", 0.12, 14, [MAT.wire]),
				task("Electrical rough-in", "Conduits, wiring, DBs, and lighting loops", 0.16, 18, [MAT.wire]),
				task("Plumbing rough-in", "Soil, waste, vent, and water supply", 0.14, 18, [MAT.pipe]),
				task("HVAC rough-in", "Ducting, refrigerant piping, and equipment bases", 0.14, 14),
				task("Fire fighting systems", "Hydrants, sprinklers, and alarm rough-in", 0.12, 14),
				task("Lift installation", "Lift rails, car, and commissioning prep", opts.includeElevator ? 0.1 : 0.04, opts.includeElevator ? 21 : 7),
				task("Low voltage & security", "Data, CCTV, access control, and BMS cabling", 0.1, 10, [MAT.wire]),
				task("Solar / DG (if applicable)", "Rooftop solar, DG set, and exhaust systems", 0.06, 10),
				task("MEP coordination & inspections", "Clash checks and consultant sign-offs", 0.06, 7),
			],
		),
		phase(
			"Finishes & interiors",
			"Internal build-out from plaster through fixtures",
			interior,
			[
				task("Internal plaster & putty", "Ceiling and wall plaster, putty, and primer", 0.12, 21, [MAT.cement]),
				task("Wet area waterproofing", "Bathrooms, kitchens, and terrace wet areas", 0.08, 10),
				task("False ceiling & partitions", "Gypsum ceiling, grid, and drywall partitions", 0.1, 14, [MAT.drywall]),
				task("Flooring & tiling", "Screed, tiles, stone, and skirting", 0.16, 18, [MAT.tiles]),
				task("Doors & hardware", "Internal doors, frames, and ironmongery", 0.1, 10),
				task("Kitchen & joinery", "Modular kitchen, wardrobes, and counters", 0.12, 14, [MAT.paint]),
				task("Sanitary & plumbing fixtures", "WC, basins, showers, and connections", 0.1, 10, [MAT.pipe]),
				task("Painting & polishing", "Final paint, polish, and touch-ups", 0.12, 14, [MAT.paint]),
				task("Electrical fixtures", "Switches, lights, fans, and appliances", 0.1, 10, [MAT.wire]),
			],
		),
		phase(
			"External works & landscaping",
			"Compound, paving, drainage, and landscape",
			external,
			[
				task("Compound wall & gates", "Boundary wall, gate, and security cabin", 0.22, 14, [MAT.cement]),
				task("External paving & drives", "Roads, parking, and hardscape", 0.2, 14),
				task("External drainage", "Storm water, manholes, and rain harvesting", 0.18, 10, [MAT.pipe]),
				task("Landscaping & irrigation", "Softscape, planters, and irrigation", 0.2, 14),
				task("External lighting & power", "Pole lights, gate power, and signage", 0.12, 7, [MAT.wire]),
				task("Final external cleanup", "Debris removal and external snag", 0.08, 5),
			],
		),
		phase(
			"Testing & handover",
			"Commissioning, snag, documentation, and occupancy",
			closeout,
			[
				task("MEP testing & commissioning", "Pressure tests, TAB, and electrical testing", 0.2, 10),
				task("Fire & life safety testing", "Fire alarm, sprinkler, and evacuation tests", 0.12, 7),
				task("Snag & defect closure", "Joint inspection, punch list, and rework", 0.18, 10),
				task("Statutory completion & OC", "Completion certificate and utility connections", 0.12, 14),
				task("As-built & O&M manuals", "Drawings, warranties, and maintenance manuals", 0.14, 7),
				task("Training & handover", "Client training, keys, and final sign-off", 0.12, 5),
				task("Final accounts & retention", "Measurement, retention release, and close-out", 0.12, 7),
			],
		),
	];
}

export function fitOutPhases(): PhaseBlueprint[] {
	return [
		phase("Design & approvals", "Survey, layout, BOQ, and permits for fit-out", 0.1, [
			task("As-built survey", "Existing conditions and measurements", 0.2, 5),
			task("Layout & MEP design", "Fit-out drawings and service routing", 0.25, 10),
			task("BOQ & procurement plan", "Quantities, vendors, and lead times", 0.2, 7),
			task("Approvals & samples", "Authority submissions and material samples", 0.2, 10),
			task("Mobilisation", "Site access, protection, and logistics", 0.15, 5),
		]),
		phase("Demolition & civil mods", "Dismantling and minor civil changes", 0.12, [
			task("Selective demolition", "Remove existing finishes and services as per plan", 0.35, 7),
			task("Partition walls", "Drywall or block partitions", 0.35, 10, [MAT.drywall]),
			task("Floor preparation", "Screed, waterproofing, and leveling", 0.3, 8, [MAT.tiles]),
		]),
		phase("MEP & services", "Power, data, plumbing, HVAC, and fire", 0.28, [
			task("Electrical distribution", "Panels, cabling, and lighting circuits", 0.25, 12, [MAT.wire]),
			task("Data & low voltage", "Network, CCTV, and access control", 0.15, 8, [MAT.wire]),
			task("Plumbing & drainage", "Supply, waste, and fixture rough-in", 0.2, 10, [MAT.pipe]),
			task("HVAC & ventilation", "AC units, ducting, and exhaust", 0.25, 14),
			task("Fire & safety systems", "Detectors, sprinklers, and signage", 0.15, 7),
		]),
		phase("Finishes & branding", "Surfaces, joinery, furniture, and signage", 0.38, [
			task("False ceiling & lighting", "Ceiling grid, lights, and acoustics", 0.2, 10, [MAT.drywall]),
			task("Flooring & wall finishes", "Tiles, carpet, paint, and wall panels", 0.25, 12, [MAT.tiles, MAT.paint]),
			task("Joinery & counters", "Reception, cabins, pantry, and storage", 0.2, 12, [MAT.paint]),
			task("Branding & signage", "Graphics, wayfinding, and brand elements", 0.15, 7),
			task("FF&E installation", "Furniture, fixtures, and equipment", 0.2, 7),
		]),
		phase("Commissioning & handover", "Testing, snag, and handover", 0.12, [
			task("Functional testing", "MEP, IT, and equipment commissioning", 0.35, 5),
			task("Snag & punch list", "Defects, rework, and reinspection", 0.3, 5),
			task("Handover & documentation", "Manuals, training, and sign-off", 0.35, 3),
		]),
	];
}

export function industrialShellPhases(): PhaseBlueprint[] {
	return [
		phase("Planning & approvals", "Layout, structural design, permits, and contracts", 0.08, [
			task("Master planning & layout", "Plot layout, circulation, and zoning", 0.2, 14),
			task("Structural / PEB design", "Frame design, loads, and drawings", 0.25, 21),
			task("BOQ & tender", "Quantities, tender, and contractor award", 0.2, 14),
			task("Industrial approvals", "Factory, pollution, and fire NOCs", 0.25, 21),
			task("Mobilisation plan", "Equipment, logistics, and schedule", 0.1, 7),
		]),
		phase("Site & foundation", "Grading, foundations, and floor slab", 0.18, [
			task("Site mobilisation & grading", "Leveling, compaction, and temp works", 0.25, 10),
			task("Foundations & pits", "Footings, pile caps, equipment pits", 0.35, 18, [MAT.concrete, MAT.steel]),
			task("Floor hardening / slab", "Grade slab, FM2, or industrial flooring prep", 0.25, 14, [MAT.concrete]),
			task("Underground utilities", "Drains, cables, and utility trenches", 0.15, 10, [MAT.pipe]),
		]),
		phase("Superstructure", "PEB / steel frame and building shell", 0.32, [
			task("Primary steel / PEB frame", "Columns, trusses, and bracing erection", 0.35, 21, [MAT.steel]),
			task("Secondary steel & purlins", "Purlins, girts, and secondary members", 0.2, 14, [MAT.steel]),
			task("Roof sheeting & insulation", "Roof panels, insulation, and skylights", 0.25, 14),
			task("Wall cladding & louvers", "Wall panels, louvers, and doors", 0.2, 14),
		]),
		phase("MEP & utilities", "Power, process utilities, fire, and drainage", 0.28, [
			task("Electrical HT/LT & panels", "Supply, panels, and distribution", 0.25, 14, [MAT.wire]),
			task("Lighting & small power", "Internal / yard lighting and sockets", 0.15, 10, [MAT.wire]),
			task("Fire fighting & alarms", "Hydrants, sprinklers, and detection", 0.2, 12),
			task("Plumbing & industrial drains", "Floor drains, toilets, trade waste", 0.2, 10, [MAT.pipe]),
			task("HVAC / ventilation (if any)", "Ventilation, exhaust, and AC", 0.12, 10),
			task("Process / specialty utilities", "Compressed air, gas, or process lines as scoped", 0.08, 14),
		]),
		phase("Handover", "Testing, commissioning, and occupancy", 0.14, [
			task("Systems commissioning", "Electrical, fire, and utility testing", 0.35, 7),
			task("Snag & safety audit", "HSE audit and defect closure", 0.25, 7),
			task("As-built & manuals", "Drawings, warranties, and O&M", 0.2, 5),
			task("Occupancy & final accounts", "Completion, occupancy, and close-out", 0.2, 7),
		]),
	];
}

export function institutionalPhases(heavyMep = false): PhaseBlueprint[] {
	const civil = standardCivilPhases({ includeElevator: true });
	if (!heavyMep) return civil;
	return civil.map((p) =>
		p.name === "MEP rough-in"
			? phase(
					"MEP & medical gases",
					"Electrical, HVAC, plumbing, and specialty services",
					p.weight,
					[
						...p.tasks,
						task(
							"Specialty services",
							"Medical gases / lab services as applicable",
							0.25,
							21,
						),
					],
				)
			: p,
	);
}
