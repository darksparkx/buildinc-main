import SubscriptionBillingSdk from "razorpay";

/** Loads the bundled subscription billing SDK (`PAYMENT_*` env). Replace the module import if you switch providers. */
export function getPaymentSdk() {
	const keyId = process.env.PAYMENT_KEY_ID?.trim();
	const keySecret = process.env.PAYMENT_KEY_SECRET?.trim();
	if (!keyId || !keySecret) {
		throw new Error("Missing PAYMENT_KEY_ID or PAYMENT_KEY_SECRET");
	}
	return new SubscriptionBillingSdk({ key_id: keyId, key_secret: keySecret });
}
