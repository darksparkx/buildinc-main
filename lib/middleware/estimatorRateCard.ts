import { DEFAULT_RATE_CARD, mergeRateCard } from "@/lib/projectGeneration/rateCard";
import type { EstimatorRateCard } from "@/lib/projectGeneration/types";
import { estimatorRateCardDB } from "@/lib/supabase/db/estimatorRateCardDB";
import { useRateCardStore } from "@/lib/store/rateCardStore";

export async function loadEstimatorRateCard(
	subscriberId: string,
): Promise<EstimatorRateCard> {
	const fromDb = await estimatorRateCardDB.get(subscriberId);
	const card = mergeRateCard(fromDb ?? undefined);
	useRateCardStore.getState().setCard(card);
	useRateCardStore.getState().setLoaded(true);
	return card;
}

export async function saveEstimatorRateCard(
	subscriberId: string,
	card: EstimatorRateCard,
): Promise<EstimatorRateCard> {
	const merged = mergeRateCard(card);
	await estimatorRateCardDB.upsert(subscriberId, merged);
	useRateCardStore.getState().setCard(merged);
	useRateCardStore.getState().setLoaded(true);
	return merged;
}

export function clearEstimatorRateCardStore(): void {
	useRateCardStore.getState().clear();
}

export function getCachedRateCard(): EstimatorRateCard {
	const cached = useRateCardStore.getState().card;
	return mergeRateCard(cached ?? undefined);
}

export { DEFAULT_RATE_CARD };
