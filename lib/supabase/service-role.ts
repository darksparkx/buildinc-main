import { createClient } from "@supabase/supabase-js";

/** Server-only: billing and webhooks. Never import from client components. */
export function createServiceRoleClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url?.trim() || !key?.trim()) {
		throw new Error(
			"Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
		);
	}
	return createClient(url, key);
}
