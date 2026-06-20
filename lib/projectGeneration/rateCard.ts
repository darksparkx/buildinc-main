import { PROJECT_TYPES } from "./projectTypes";
import { useRateCardStore } from "@/lib/store/rateCardStore";
import type {
	EstimatorRateCard,
	FinishLevel,
	ProjectTypeId,
} from "./types";

const STORAGE_KEY = "buildinc-estimator-rate-card";

export const DEFAULT_RATE_CARD: EstimatorRateCard = {
	materialUnitCosts: {
		"1": 62000,
		"2": 5200,
		"3": 420,
		"4": 45,
		"5": 380,
		"6": 120,
		"7": 85,
		"8": 280,
	},
	benchmarkPerSqft: Object.fromEntries(
		PROJECT_TYPES.map((t) => [t.id, t.defaultBenchmarkPerSqft]),
	) as Partial<Record<ProjectTypeId, number>>,
	finishMultipliers: {
		basic: 0.88,
		standard: 1,
		premium: 1.22,
	},
};

export function mergeRateCard(
	partial?: Partial<EstimatorRateCard> | null,
): EstimatorRateCard {
	if (!partial) return { ...DEFAULT_RATE_CARD };
	return {
		...DEFAULT_RATE_CARD,
		...partial,
		finishMultipliers: {
			...DEFAULT_RATE_CARD.finishMultipliers,
			...partial.finishMultipliers,
		},
		materialUnitCosts: {
			...DEFAULT_RATE_CARD.materialUnitCosts,
			...partial.materialUnitCosts,
		},
		benchmarkPerSqft: {
			...DEFAULT_RATE_CARD.benchmarkPerSqft,
			...partial.benchmarkPerSqft,
		},
	};
}

/** Client-side rate card: DB cache (session) → localStorage fallback → defaults. */
export function getRateCard(): EstimatorRateCard {
	const fromStore = useRateCardStore.getState().card;
	if (fromStore) return mergeRateCard(fromStore);

	if (typeof window === "undefined") return DEFAULT_RATE_CARD;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_RATE_CARD;
		return mergeRateCard(JSON.parse(raw) as EstimatorRateCard);
	} catch {
		return DEFAULT_RATE_CARD;
	}
}

export function saveRateCardLocal(card: EstimatorRateCard): void {
	if (typeof window === "undefined") return;
	const merged = mergeRateCard(card);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
	useRateCardStore.getState().setCard(merged);
}

export function hasUsableRateCard(card: EstimatorRateCard = getRateCard()): boolean {
	return Object.keys(card.materialUnitCosts).length > 0;
}

export function benchmarkPerSqftForType(
	typeId: ProjectTypeId,
	card: EstimatorRateCard,
	finish: FinishLevel,
): number {
	const base =
		card.benchmarkPerSqft[typeId] ??
		PROJECT_TYPES.find((t) => t.id === typeId)?.defaultBenchmarkPerSqft ??
		2000;
	return Math.round(base * card.finishMultipliers[finish]);
}
