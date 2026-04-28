/** Normalize PostgREST / Postgres errors from subscription limit triggers into a short user string. */
export function subscriptionLimitErrorMessage(error: unknown): string | null {
	if (!error || typeof error !== "object") return null;
	const o = error as {
		message?: string;
		details?: string;
		code?: string;
	};
	const parts = [o.message, o.details].filter(
		(x): x is string => typeof x === "string" && x.length > 0,
	);
	const text = parts.join(" ").trim();
	if (!text) return null;

	if (
		text.includes("/billing") ||
		text.includes("Active subscription") ||
		text.includes("Organisation limit") ||
		text.includes("Organization limit") ||
		text.includes("Project limit") ||
		text.includes("Member limit") ||
		text.includes("subscription is not active") ||
		text.includes("needs an active subscription") ||
		text.includes("SUBSCRIPTION_") ||
		text.includes("ORG_LIMIT") ||
		text.includes("PROJECT_LIMIT") ||
		text.includes("SEAT_LIMIT")
	) {
		return o.message && o.message.length > 0 ? o.message : text;
	}
	return null;
}
