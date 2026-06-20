import type { category, IPhaseTemplate } from "@/lib/types";

export type ProjectTypePriority = "A" | "B";

export type ProjectTypeId =
	| "R1"
	| "R2"
	| "R3"
	| "R4"
	| "R5"
	| "R6"
	| "R7"
	| "R8"
	| "R9"
	| "R10"
	| "R11"
	| "C1"
	| "C2"
	| "C3"
	| "C4"
	| "C5"
	| "C6"
	| "C7"
	| "C8"
	| "C9"
	| "C10"
	| "C11"
	| "M1"
	| "M2"
	| "M3"
	| "I1"
	| "I2"
	| "I3"
	| "I4"
	| "I5"
	| "N1"
	| "N2"
	| "N3"
	| "N4"
	| "N5"
	| "S1"
	| "S2"
	| "S3"
	| "S4"
	| "S5"
	| "O1"
	| "O2"
	| "O3"
	| "O4";

export type DeliveryMode =
	| "new_build"
	| "extension"
	| "renovation"
	| "fit_out";

export type FinishLevel = "basic" | "standard" | "premium";

export type StructuralSystem =
	| "rcc"
	| "steel_frame"
	| "load_bearing"
	| "other";

export interface ProjectTypeDefinition {
	id: ProjectTypeId;
	label: string;
	group: string;
	priority: ProjectTypePriority;
	legacyCategory: category;
	/** ₹/sqft benchmark when rate card has no override */
	defaultBenchmarkPerSqft: number;
}

export interface MaterialBlueprint {
	materialId: string;
	name: string;
	unit: string;
	/** Planned quantity = sqft * qtyPerSqft (min 1) */
	qtyPerSqft?: number;
	fixedQty?: number;
	unitCost: number;
}

export interface TaskBlueprint {
	name: string;
	description: string;
	/** Share of phase budget (sums to ~1 per phase) */
	weight: number;
	durationDays: number;
	materials?: MaterialBlueprint[];
}

export interface PhaseBlueprint {
	name: string;
	description: string;
	/** Share of total project budget */
	weight: number;
	tasks: TaskBlueprint[];
}

export interface RulePackDefinition {
	projectTypeId: ProjectTypeId;
	phases: PhaseBlueprint[];
	/** Multiplier on benchmark ₹/sqft for this type */
	benchmarkMultiplier?: number;
}

export interface ProjectCreationQuestionnaire {
	projectTypeId: ProjectTypeId | "";
	name: string;
	description: string;
	organisationId: string;
	supervisor: string;
	supervisorName: string;
	location: string;
	startDate: Date | null;
	endDate: Date | null;
	builtUpSqft: number;
	plotAreaSqft: number | null;
	floorCount: number | null;
	basementOrParking: boolean;
	unitsPerFloor: number | null;
	commercialGfaPercent: number | null;
	residentialGfaPercent: number | null;
	deliveryMode: DeliveryMode;
	finishLevel: FinishLevel;
	structuralSystem: StructuralSystem | null;
	scopeNotes: string;
	targetBudget: number | null;
	targetBudgetPerSqft: number | null;
}

export interface EstimatorRateCard {
	materialUnitCosts: Record<string, number>;
	/** Fallback ₹/sqft by project type id */
	benchmarkPerSqft: Partial<Record<ProjectTypeId, number>>;
	finishMultipliers: Record<FinishLevel, number>;
}

export interface GenerationResult {
	phases: IPhaseTemplate[];
	budget: number;
	budgetPerSqft: number;
	totalSqft: number;
	generatedFromTypeId: ProjectTypeId;
	warnings: string[];
}

export const PRIORITY_A_TYPE_IDS: ProjectTypeId[] = [
	"R1",
	"R2",
	"R3",
	"R4",
	"R5",
	"R8",
	"C1",
	"C2",
	"C3",
	"C4",
	"C5",
	"C6",
	"C7",
	"M2",
	"M3",
	"I1",
	"I2",
	"I3",
	"I4",
	"N1",
	"N2",
	"N3",
	"N4",
	"N5",
];
