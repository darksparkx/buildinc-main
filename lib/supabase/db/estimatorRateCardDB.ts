import { createClient } from "@/lib/supabase/client";
import type { EstimatorRateCard } from "@/lib/projectGeneration/types";

const supabase = createClient();

export const estimatorRateCardDB = {
	async get(subscriberId: string): Promise<EstimatorRateCard | null> {
		const { data, error } = await supabase
			.from("estimator_rate_cards")
			.select("card")
			.eq("subscriber_id", subscriberId)
			.maybeSingle();

		if (error) throw error;
		if (!data?.card || typeof data.card !== "object") return null;
		return data.card as EstimatorRateCard;
	},

	async upsert(subscriberId: string, card: EstimatorRateCard): Promise<void> {
		const { error } = await supabase.from("estimator_rate_cards").upsert(
			{
				subscriber_id: subscriberId,
				card,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "subscriber_id" },
		);

		if (error) throw error;
	},
};
