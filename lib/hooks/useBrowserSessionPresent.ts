"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

/** `null` until the browser session has been read from Supabase (cookie-backed). */
export function useBrowserSessionPresent(): boolean | null {
	const [hasSession, setHasSession] = useState<boolean | null>(null);
	useEffect(() => {
		let cancelled = false;
		const supabase = createClient();
		void supabase.auth.getSession().then(({ data }) => {
			if (!cancelled) setHasSession(!!data.session);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	return hasSession;
}
