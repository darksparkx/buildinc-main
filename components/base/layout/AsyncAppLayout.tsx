import { createClient } from "@/lib/supabase/server";
import { IProfile } from "@/lib/types";
import { AppLayout } from "./AppLayout";

export default async function AsyncAppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	let profile: IProfile | null = null;
	let subscriberEntitlementsRaw: Record<string, unknown> | null = null;
	if (user) {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", user.id)
			.single();

		if (error) {
			console.error("Error getting profile:", error);
		} else {
			profile = data as IProfile;
		}

		const { data: entRow, error: entError } = await supabase
			.from("subscriber_entitlements")
			.select("*")
			.eq("subscriber_id", user.id)
			.maybeSingle();

		if (entError) {
			console.error("Error getting subscriber_entitlements:", entError);
		} else if (entRow) {
			subscriberEntitlementsRaw = entRow as Record<string, unknown>;
		}
	}
	return (
		// <ClearDataStorage>
		<AppLayout
			profile={profile}
			subscriberEntitlementsRaw={subscriberEntitlementsRaw}
			user={user}
		>
			{children}
		</AppLayout>
		// </ClearDataStorage>
	);
}
