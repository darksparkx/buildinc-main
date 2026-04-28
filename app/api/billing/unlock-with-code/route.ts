import { parsePublicTier, TIER_LIMITS } from "@/lib/billing/tierLimits";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function timingSafeEqualStrings(a: string, b: string): boolean {
	try {
		const ba = Buffer.from(a, "utf8");
		const bb = Buffer.from(b, "utf8");
		if (ba.length !== bb.length) return false;
		return crypto.timingSafeEqual(ba, bb);
	} catch {
		return false;
	}
}

/** Dev / beta: activate plan by shared secret (no gateway checkout). Swap UI for `/api/payment/checkout` when live. */
export async function POST(request: Request) {
	const expected = process.env.BILLING_UNLOCK_CODE?.trim();
	if (!expected) {
		return NextResponse.json(
			{ error: "Code unlock is not configured" },
			{ status: 503 },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const code =
		typeof body === "object" &&
		body !== null &&
		"code" in body &&
		typeof (body as { code: unknown }).code === "string"
			? (body as { code: string }).code
			: "";

	if (!timingSafeEqualStrings(code.trim(), expected)) {
		return NextResponse.json({ error: "Invalid code" }, { status: 403 });
	}

	const tierRaw =
		typeof body === "object" &&
		body !== null &&
		"tier" in body &&
		(body as { tier: unknown }).tier;
	const tierKey = parsePublicTier(tierRaw);
	if (!tierKey) {
		return NextResponse.json(
			{ error: "Invalid or missing tier (starter | professional | enterprise)" },
			{ status: 400 },
		);
	}

	const limits = TIER_LIMITS[tierKey];

	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const admin = createServiceRoleClient();
	const now = new Date().toISOString();
	const { error } = await admin.from("subscriber_entitlements").upsert(
		{
			subscriber_id: user.id,
			plan: limits.plan,
			status: "active",
			billing_interval: null,
			billing_provider: "manual",
			billing_customer_id: null,
			billing_subscription_id: null,
			current_period_start: now,
			current_period_end: null,
			trial_ends_at: null,
			max_orgs: limits.maxOrgs,
			max_projects: limits.maxProjects,
			max_users: limits.maxUsers,
			updated_at: now,
		},
		{ onConflict: "subscriber_id" },
	);

	if (error) {
		console.error("[billing unlock]", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ ok: true, plan: limits.plan });
}
