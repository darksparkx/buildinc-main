import { checkoutPlanIdForTier } from "@/lib/billing/checkoutPlanEnv";
import { parsePublicTier } from "@/lib/billing/tierLimits";
import { getPaymentSdk } from "@/lib/payment/sdkClient";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Long-run subscription billing cycles (SDK max 1000 on common providers). */
const DEFAULT_TOTAL_BILLING_CYCLES = 1000;

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const tier = parsePublicTier(
		typeof body === "object" && body !== null && "tier" in body
			? (body as { tier: unknown }).tier
			: undefined,
	);

	if (!tier) {
		return NextResponse.json(
			{ error: "tier required (starter | professional | enterprise)" },
			{ status: 400 },
		);
	}

	const planId = checkoutPlanIdForTier(tier);
	if (!planId) {
		return NextResponse.json(
			{
				error:
					"Checkout plan id not configured for this tier (set PAYMENT_PLAN_ID_* env)",
			},
			{ status: 400 },
		);
	}

	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user?.id || !user.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const admin = createServiceRoleClient();
	const { data: ent } = await admin
		.from("subscriber_entitlements")
		.select("billing_customer_id")
		.eq("subscriber_id", user.id)
		.maybeSingle();

	let customerId: string | undefined =
		ent?.billing_customer_id ?? undefined;

	try {
		const sdk = getPaymentSdk();
		if (!customerId) {
			const c = (await sdk.customers.create({
				name: user.user_metadata?.name || user.email,
				email: user.email,
				notes: { subscriber_id: user.id },
			})) as { id: string };
			customerId = c.id;
			await admin.from("subscriber_entitlements").upsert(
				{
					subscriber_id: user.id,
					billing_provider: "payment",
					billing_customer_id: customerId,
					updated_at: new Date().toISOString(),
				},
				{ onConflict: "subscriber_id" },
			);
		}

		/* SDK typings may omit optional REST fields below. */
		const sub = (await sdk.subscriptions.create({
			plan_id: planId,
			customer_notify: 1,
			total_count: DEFAULT_TOTAL_BILLING_CYCLES,
			customer_id: customerId,
			notes: { subscriber_id: user.id },
		} as never)) as unknown as { id: string; short_url?: string | null };

		return NextResponse.json({
			subscriptionId: sub.id,
			shortUrl: sub.short_url ?? null,
		});
	} catch (e) {
		console.error("[payment checkout]", e);
		const msg = e instanceof Error ? e.message : "Checkout failed";
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}
