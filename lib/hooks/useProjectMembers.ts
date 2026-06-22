"use client";

import { refreshProjectMembers } from "@/lib/middleware/projectMembers";
import { useProjectMemberStore } from "@/lib/store/projectMemberStore";
import { IProjectProfile } from "@/lib/types";
import { useEffect, useMemo } from "react";

const MEMBER_POLL_MS = 12_000;

/** Live project member list: subscribes to the store and refreshes from the DB periodically. */
export function useProjectMembers(
	projectId: string | undefined,
): IProjectProfile[] {
	const memberMap = useProjectMemberStore((state) =>
		projectId ? state.projectMembers[projectId] : undefined,
	);

	const members = useMemo(
		() => (memberMap ? Object.values(memberMap) : []),
		[memberMap],
	);

	useEffect(() => {
		if (!projectId) return;

		const refresh = () => {
			if (document.visibilityState !== "visible") return;
			void refreshProjectMembers(projectId).catch((error) => {
				console.error("Error syncing project members:", error);
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
	}, [projectId]);

	return members;
}
