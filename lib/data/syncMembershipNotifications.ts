import { applyMembershipRemovalFromNotification } from "@/lib/functions/membershipRemovalLocalState";
import {
	listUnreadMembershipNotifications,
	membershipNotificationTitle,
} from "@/lib/middleware/membershipNotifications";
import type { IMembershipNotificationDB } from "@/lib/types";
import { toast } from "sonner";

const MEMBERSHIP_POLL_MS = 12_000;

/** Poll unread membership notifications and toast when new ones arrive. */
export function startMembershipNotificationSync(userId: string): () => void {
	const seenIds = new Set<string>();
	let seeded = false;

	const refresh = () => {
		if (document.visibilityState !== "visible") return;
		void listUnreadMembershipNotifications(userId)
			.then((list) => {
				if (!seeded) {
					for (const n of list) seenIds.add(n.id);
					seeded = true;
					return;
				}
				for (const n of list) {
					if (seenIds.has(n.id)) continue;
					seenIds.add(n.id);
					toast.info(membershipNotificationTitle(n));
					applyMembershipRemovalFromNotification(
						n as IMembershipNotificationDB,
					);
				}
			})
			.catch((error) => {
				console.warn("Error syncing membership notifications:", error);
			});
	};

	refresh();
	const interval = setInterval(refresh, MEMBERSHIP_POLL_MS);
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
};
