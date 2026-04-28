import type {
	IOrganisation,
	IProfile,
	IProject,
	ISubscriberEntitlementsDB,
} from "@/lib/types";
import { isActiveSubscriber, resolveMaxCap } from "@/lib/billing/subscriberStatus";

export type PreflightFail = { ok: false; message: string };
export type PreflightOk = { ok: true };
export type PreflightResult = PreflightOk | PreflightFail;

const MSG_SUB =
	"Active subscription required. Open Billing (/billing) to activate.";
const MSG_ORG_CAP =
	"Organisation limit reached for your plan. Upgrade under Billing (/billing).";
const MSG_PROJ_CAP =
	"Project limit reached for this subscription. Upgrade under Billing (/billing).";

/** Client-side guard before insert; DB triggers remain authoritative. */
export function preflightCreateOrganisation(params: {
	profile: IProfile | null;
	entitlements: ISubscriberEntitlementsDB | null;
	ownerId: string;
	ownedOrganisations: IOrganisation[];
}): PreflightResult {
	const { profile, entitlements, ownerId, ownedOrganisations } = params;
	if (profile?.admin) return { ok: true };
	if (!entitlements || !isActiveSubscriber(entitlements)) {
		return { ok: false, message: MSG_SUB };
	}
	const maxOrgs = resolveMaxCap(entitlements.max_orgs, "deny");
	if (maxOrgs === null) return { ok: true };
	const ownedCount = ownedOrganisations.filter(
		(o) => o.owner === ownerId,
	).length;
	if (ownedCount >= maxOrgs) {
		return {
			ok: false,
			message: `${MSG_ORG_CAP} (limit ${maxOrgs})`,
		};
	}
	return { ok: true };
}

/**
 * When `billingSubscriberId !== currentUserId`, skips numeric checks (member flow;
 * org owner entitlements are not on the client).
 */
export function preflightCreateProject(params: {
	profile: IProfile | null;
	entitlements: ISubscriberEntitlementsDB | null;
	billingSubscriberId: string;
	currentUserId: string;
	ownedOrgIds: string[];
	projects: IProject[];
}): PreflightResult {
	const {
		profile,
		entitlements,
		billingSubscriberId,
		currentUserId,
		ownedOrgIds,
		projects,
	} = params;

	if (billingSubscriberId !== currentUserId) {
		return { ok: true };
	}

	if (profile?.admin) return { ok: true };
	if (!entitlements || !isActiveSubscriber(entitlements)) {
		return {
			ok: false,
			message:
				"An active subscription is required on the account that owns this organisation.",
		};
	}
	const maxProjects = resolveMaxCap(entitlements.max_projects, "deny");
	if (maxProjects === null) return { ok: true };

	const ownedSet = new Set(ownedOrgIds);
	const count = projects.filter(
		(p) =>
			(p.orgId != null &&
				p.orgId !== "" &&
				ownedSet.has(String(p.orgId))) ||
			((p.orgId == null || p.orgId === "") &&
				p.owner === billingSubscriberId),
	).length;

	if (count >= maxProjects) {
		return {
			ok: false,
			message: `${MSG_PROJ_CAP} (limit ${maxProjects})`,
		};
	}
	return { ok: true };
}
