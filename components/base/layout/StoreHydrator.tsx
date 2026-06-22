"use client";

import { runSessionStoreLoad } from "@/lib/data/runSessionStoreLoad";
import { startMembershipNotificationSync } from "@/lib/data/syncMembershipNotifications";
import { startRequestSync } from "@/lib/data/syncRequests";
import { parseSubscriberEntitlementsRow } from "@/lib/billing/parseSubscriberEntitlementsRow";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";
import { useProfileStore } from "@/lib/store/profileStore";
import {
	cleanupRealtimeListeners,
	initRealtimeListeners,
} from "@/lib/supabase/realtimeClient";
import { IProfile } from "@/lib/types";
import { useEffect } from "react";

export const StoreHydrator = ({
	profile,
	subscriberEntitlementsRaw,
}: {
	profile: IProfile | null;
	subscriberEntitlementsRaw: Record<string, unknown> | null;
}) => {
	const { setProfile } = useProfileStore();

	useEffect(() => {
		if (!subscriberEntitlementsRaw) {
			useEntitlementsStore.getState().clearEntitlements();
			return;
		}
		const parsed = parseSubscriberEntitlementsRow(subscriberEntitlementsRaw);
		useEntitlementsStore.getState().setEntitlements(parsed);
	}, [subscriberEntitlementsRaw]);

	useEffect(() => {
		const handleActivity = () => {
			localStorage.setItem("lastActiveAt", Date.now().toString());
		};

		window.addEventListener("click", handleActivity);
		window.addEventListener("mousemove", handleActivity);
		window.addEventListener("keydown", handleActivity);

		return () => {
			window.removeEventListener("click", handleActivity);
			window.removeEventListener("mousemove", handleActivity);
			window.removeEventListener("keydown", handleActivity);
		};
	}, []);

	useEffect(() => {
		if (!profile) return;
		setProfile(profile);
		(async () => {
			try {
				await runSessionStoreLoad(profile, subscriberEntitlementsRaw);
			} catch (error) {
				console.error("Error loading user data:", error);
			}
		})();
		initRealtimeListeners(profile);
		const stopRequestSync = startRequestSync(profile.id);
		const stopMembershipSync = startMembershipNotificationSync(profile.id);
		return () => {
			stopRequestSync();
			stopMembershipSync();
			cleanupRealtimeListeners();
		};
	}, [profile, subscriberEntitlementsRaw]);

	return null;
};
