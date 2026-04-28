import { syncGatewaySubscriptionToEntitlements } from "@/lib/billing/syncGatewaySubscription";
import { getPaymentSdk } from "@/lib/payment/sdkClient";
import { verifySubscriptionWebhookPayload } from "@/lib/payment/verifySubscriptionWebhookPayload";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type WebhookBody = {
	event?: string;
	payload?: {
		subscription?: { entity?: Record<string, unknown> };
	};
};

export async function POST(request: Request) {
	const raw = await request.text();
	const secret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
	if (!secret) {
		console.error("[payment webhook] Missing PAYMENT_WEBHOOK_SECRET");
		return NextResponse.json({ error: "Not configured" }, { status: 500 });
	}

	const signatureHeaderEnv = process.env.PAYMENT_WEBHOOK_SIGNATURE_HEADER?.trim();
	if (!signatureHeaderEnv) {
		console.error("[payment webhook] Missing PAYMENT_WEBHOOK_SIGNATURE_HEADER");
		return NextResponse.json({ error: "Not configured" }, { status: 500 });
	}
	const signature = request.headers.get(signatureHeaderEnv);
	if (
		!verifySubscriptionWebhookPayload(raw, signature, secret)
	) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	let body: WebhookBody;
	try {
		body = JSON.parse(raw) as WebhookBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const event = body.event;
	if (!event || !event.startsWith("subscription.")) {
		return NextResponse.json({ received: true, ignored: true });
	}

	const subPayload = body.payload?.subscription?.entity;
	if (!subPayload || typeof subPayload !== "object") {
		return NextResponse.json({ received: true, ignored: !subPayload });
	}

	const id = subPayload.id;
	if (typeof id !== "string") {
		return NextResponse.json({ error: "No subscription id" }, { status: 400 });
	}

	try {
		const sdk = getPaymentSdk();
		const sub = (await sdk.subscriptions.fetch(id)) as unknown as {
			id: string;
			plan_id: string;
			status: string;
			customer_id: string;
			current_start: number | null;
			current_end: number | null;
			start_at: number | null;
			end_at: number | null;
			notes: Record<string, string> | null;
		};

		const result = await syncGatewaySubscriptionToEntitlements({
			id: sub.id,
			plan_id: sub.plan_id,
			status: (sub.status || "").toLowerCase(),
			customer_id: sub.customer_id,
			current_start: sub.current_start ?? null,
			current_end: sub.current_end ?? null,
			start_at: sub.start_at ?? null,
			end_at: sub.end_at ?? null,
			notes: sub.notes,
		});

		if (!result.ok) {
			console.warn("[payment webhook] sync:", result.reason);
		}
	} catch (e) {
		console.error("[payment webhook]", e);
		return NextResponse.json({ error: "Processing failed" }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}
