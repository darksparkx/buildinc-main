import { create } from "zustand";
import type { EstimatorRateCard } from "@/lib/projectGeneration/types";

type RateCardState = {
	card: EstimatorRateCard | null;
	loaded: boolean;
	setCard: (card: EstimatorRateCard | null) => void;
	setLoaded: (loaded: boolean) => void;
	clear: () => void;
};

export const useRateCardStore = create<RateCardState>((set) => ({
	card: null,
	loaded: false,
	setCard: (card) => set({ card }),
	setLoaded: (loaded) => set({ loaded }),
	clear: () => set({ card: null, loaded: false }),
}));
