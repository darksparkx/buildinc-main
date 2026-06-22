"use client";

import { refreshOrganisationMembers } from "@/lib/middleware/organisationMembers";
import { useOrganisationMemberStore } from "@/lib/store/organisationMemberStore";
import { IOrganisationProfile } from "@/lib/types";
import { useEffect, useMemo } from "react";

const MEMBER_POLL_MS = 12_000;

/** Live org member list: subscribes to the store and refreshes from the DB periodically. */
export function useOrganisationMembers(
	orgId: string | undefined,
): IOrganisationProfile[] {
	const memberMap = useOrganisationMemberStore((state) =>
		orgId ? state.organisationMembers[orgId] : undefined,
	);

	const members = useMemo(
		() => (memberMap ? Object.values(memberMap) : []),
		[memberMap],
	);

	useEffect(() => {
		if (!orgId) return;

		const refresh = () => {
			if (document.visibilityState !== "visible") return;
			void refreshOrganisationMembers(orgId).catch((error) => {
				console.error("Error syncing organisation members:", error);
			});
		};

		refresh();
		const interval = setInterval(refresh, MEMBER_POLL_MS);
		const onFocus = () => refresh();
		const onVisibility = () => {
			if (document.visibilityState === "visible") refresh();
		};

		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisibility);

		return () => {
			clearInterval(interval);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [orgId]);

	return members;
}
