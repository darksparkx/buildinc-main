"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/** Keeps a UI tab in sync with `?tab=` (or `paramName`) for refresh-safe deep links. */
export function useUrlQueryTab<T extends string>(
	validValues: readonly T[],
	defaultValue: T,
	paramName = "tab",
) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	const activeTab = useMemo(() => {
		const raw = searchParams.get(paramName);
		return raw !== null && validValues.includes(raw as T)
			? (raw as T)
			: defaultValue;
		// eslint-disable-next-line react-hooks/exhaustive-deps -- stable union of tab ids
	}, [searchParams, paramName, defaultValue, validValues.join("|")]);

	const setTab = useCallback(
		(value: string) => {
			const next = new URLSearchParams(searchParams.toString());
			if (value === defaultValue) {
				next.delete(paramName);
			} else {
				next.set(paramName, value);
			}
			const q = next.toString();
			router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
		},
		[pathname, router, searchParams, defaultValue, paramName],
	);

	return [activeTab, setTab] as const;
}
