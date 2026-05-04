"use client";

import { needsSubscriptionRenewalAttention } from "@/lib/billing/subscriptionGate";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useMemo } from "react";

export function useNeedsSubscriptionRenewal(): boolean {
	const profile = useProfileStore((s) => s.profile);
	const entitlements = useEntitlementsStore((s) => s.entitlements);
	const organisations = useOrganisationStore((s) => s.organisations);

	return useMemo(() => {
		const owned = Object.values(organisations).filter(
			(o) => o.owner === profile?.id,
		).length;
		return needsSubscriptionRenewalAttention(
			profile,
			entitlements,
			owned,
		);
	}, [profile, entitlements, organisations]);
}
