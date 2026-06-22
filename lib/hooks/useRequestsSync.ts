"use client";

import { getRequestsByUserId } from "@/lib/middleware/requests";
import { useEffect } from "react";

/** Refetch requests when a page that lists invitations mounts. */
export function useRequestsSync(userId: string | undefined) {
	useEffect(() => {
		if (!userId) return;
		void getRequestsByUserId(userId).catch((error) => {
			console.error("Error loading requests:", error);
		});
	}, [userId]);
}
