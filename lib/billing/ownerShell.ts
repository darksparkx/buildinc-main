import { isActiveSubscriber } from "@/lib/billing/subscriberStatus";
import type { IProfile, ISubscriberEntitlementsDB } from "@/lib/types";

/**
 * Who gets the "owner" experience: full data load, admin nav lanes, payer tooling.
 * - Active paid subscriber (`subscriber_entitlements`), or
 * - `profiles.admin` (platform / ops accounts set only via DB or trusted paths).
 */
export function usesOwnerShell(
	profile: IProfile | null | undefined,
	entitlements: ISubscriberEntitlementsDB | null | undefined,
): boolean {
	if (profile?.admin) return true;
	return isActiveSubscriber(entitlements ?? undefined);
}
