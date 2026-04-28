import type { SubscriptionPlan } from "@/lib/types";
import { entitlementsForExternalPlanId } from "@/lib/billing/externalPlanCatalog";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

type SubscriptionNotes = { subscriber_id?: string } & Record<
	string,
	string | undefined
>;

/** Shape we normalize from webhook SDK fetch + payloads. */
type GatewaySubscriptionInput = {
	id: string;
	plan_id: string;
	status: string;
	customer_id: string;
	current_start: number | null;
	current_end: number | null;
	start_at: number | null;
	end_at: number | null;
	notes: SubscriptionNotes | null;
};

function unixToIso(s: number | null | undefined): string | null {
	if (s == null) return null;
	return new Date(s * 1000).toISOString();
}

/** Active / paying subscription states supported by typical subscription APIs. */
function isPaidSubscriptionStatus(status: string) {
	return (
		status === "active" ||
		status === "authenticated" ||
		status === "resumed"
	);
}

/**
 * Persist subscription lifecycle from webhook / API polling into `subscriber_entitlements`.
 */
export async function syncGatewaySubscriptionToEntitlements(
	sub: GatewaySubscriptionInput,
): Promise<{ ok: true } | { ok: false; reason: string }> {
	const rawNotes = sub.notes;
	const subscriberId =
		typeof rawNotes?.subscriber_id === "string"
			? rawNotes.subscriber_id.trim()
			: "";
	if (!subscriberId) {
		return { ok: false, reason: "missing notes.subscriber_id on subscription" };
	}

	const limits = entitlementsForExternalPlanId(sub.plan_id);
	const status = (sub.status || "").toLowerCase();

	let plan: SubscriptionPlan;
	let rowStatus: string;
	let maxOrgs: number | null;
	let maxProjects: number | null;
	let maxUsers: number | null;

	if (status === "paused" || !isPaidSubscriptionStatus(status)) {
		plan = "none";
		rowStatus = status || "inactive";
		maxOrgs = 0;
		maxProjects = 0;
		maxUsers = 0;
	} else if (limits) {
		plan = limits.plan;
		rowStatus = status;
		maxOrgs = limits.maxOrgs;
		maxProjects = limits.maxProjects;
		maxUsers = limits.maxUsers;
	} else {
		plan = "custom";
		rowStatus = status;
		maxOrgs = null;
		maxProjects = null;
		maxUsers = null;
	}

	const row = {
		subscriber_id: subscriberId,
		plan,
		status: rowStatus,
		billing_interval: null as string | null,
		billing_provider: "payment" as const,
		billing_customer_id: sub.customer_id,
		billing_subscription_id: sub.id,
		current_period_start: unixToIso(
			sub.current_start ?? sub.start_at ?? null,
		),
		current_period_end: unixToIso(sub.current_end ?? sub.end_at ?? null),
		trial_ends_at: null as string | null,
		max_orgs: maxOrgs,
		max_projects: maxProjects,
		max_users: maxUsers,
		updated_at: new Date().toISOString(),
	};

	const supabase = createServiceRoleClient();
	const { error } = await supabase.from("subscriber_entitlements").upsert(row, {
		onConflict: "subscriber_id",
	});

	if (error) {
		console.error("[payment sync]", error);
		return { ok: false, reason: error.message };
	}
	return { ok: true };
}
