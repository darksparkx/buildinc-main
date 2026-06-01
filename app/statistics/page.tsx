import StatisticsPageClient from "@/components/statistics/StatisticsPageClient";
import { usesOwnerShell } from "@/lib/billing/ownerShell";
import { parseSubscriberEntitlementsRow } from "@/lib/billing/parseSubscriberEntitlementsRow";
import { createClient } from "@/lib/supabase/server";
import type { IProfile } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function StatisticsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/");
	}

	const { data: profileRow, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user.id)
		.single();

	if (error || !profileRow) {
		redirect("/dashboard");
	}

	const profile = profileRow as IProfile;

	const { data: entRow, error: entError } = await supabase
		.from("subscriber_entitlements")
		.select("*")
		.eq("subscriber_id", user.id)
		.maybeSingle();

	if (entError) {
		console.error("Statistics gate: subscriber_entitlements:", entError);
	}

	const entitlements = entError
		? null
		: parseSubscriberEntitlementsRow(
				entRow ? (entRow as Record<string, unknown>) : null,
			);

	// Only deny access when entitlements loaded successfully; a query failure must
	// not treat subscribers as non-owners (null entitlements → false from usesOwnerShell).
	if (!entError && !usesOwnerShell(profile, entitlements)) {
		redirect("/dashboard");
	}

	return <StatisticsPageClient entitlementsUnavailable={!!entError} />;
}
