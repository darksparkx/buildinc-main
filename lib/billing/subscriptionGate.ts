import type { IProfile, ISubscriberEntitlementsDB } from "@/lib/types";
import { isActiveSubscriber, isPaidPlan } from "@/lib/billing/subscriberStatus";

/**
 * Soft gate: show billing renewal CTA. True when the account is not a platform
 * admin, subscription is not active, but they still “look like” a payer (tier on
 * file or they own at least one organisation).
 */
export function needsSubscriptionRenewalAttention(
	profile: IProfile | null | undefined,
	entitlements: ISubscriberEntitlementsDB | null | undefined,
	ownedOrganisationCount: number,
): boolean {
	if (!profile || profile.admin) return false;
	if (isActiveSubscriber(entitlements)) return false;
	if (ownedOrganisationCount > 0) return true;
	if (entitlements && isPaidPlan(entitlements.plan)) return true;
	return false;
}
