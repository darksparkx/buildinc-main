import SubscriptionBillingSdk from "razorpay";

/** Incoming webhook subscription payload signature verification. */
export function verifySubscriptionWebhookPayload(
	rawBody: string,
	signatureHeader: string | null,
	secret: string,
): boolean {
	if (!signatureHeader) return false;
	try {
		return SubscriptionBillingSdk.validateWebhookSignature(
			rawBody,
			signatureHeader,
			secret,
		);
	} catch {
		return false;
	}
}
