import { getRequestsByUserId } from "@/lib/middleware/requests";

/** How often to pull inbox/sent requests while the tab is visible. */
const REQUEST_POLL_MS = 12_000;

function refreshRequests(userId: string) {
	if (document.visibilityState !== "visible") return;
	void getRequestsByUserId(userId).catch((error) => {
		console.error("Error syncing requests:", error);
	});
}

/** Poll + focus/visibility refresh so invites appear without a full page reload. */
export function startRequestSync(userId: string): () => void {
	const onFocus = () => refreshRequests(userId);
	const onVisibility = () => {
		if (document.visibilityState === "visible") refreshRequests(userId);
	};

	window.addEventListener("focus", onFocus);
	document.addEventListener("visibilitychange", onVisibility);
	const interval = setInterval(() => refreshRequests(userId), REQUEST_POLL_MS);

	return () => {
		window.removeEventListener("focus", onFocus);
		document.removeEventListener("visibilitychange", onVisibility);
		clearInterval(interval);
	};
}
