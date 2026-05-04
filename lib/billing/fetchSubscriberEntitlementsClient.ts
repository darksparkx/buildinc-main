"use client";

import { createClient } from "@/lib/supabase/client";
import { parseSubscriberEntitlementsRow } from "@/lib/billing/parseSubscriberEntitlementsRow";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";

export async function fetchSubscriberEntitlementsRowForUser(
	userId: string,
): Promise<Record<string, unknown> | null> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("subscriber_entitlements")
		.select("*")
		.eq("subscriber_id", userId)
		.maybeSingle();
	if (error) throw error;
	return data as Record<string, unknown> | null;
}

/** Keep Zustand in sync with the latest row (e.g. after unlock). */
export function applyEntitlementsRowToStore(
	raw: Record<string, unknown> | null,
): void {
	const parsed = parseSubscriberEntitlementsRow(raw);
	if (parsed) useEntitlementsStore.getState().setEntitlements(parsed);
	else useEntitlementsStore.getState().clearEntitlements();
}
