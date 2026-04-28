"use client";

import { usesOwnerShell } from "@/lib/billing/ownerShell";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";
import type { IProfile } from "@/lib/types";

/** Subscribes to entitlements + uses profile (typically from props or profile store). */
export function useUsesOwnerShell(profile: IProfile | null): boolean {
	const entitlements = useEntitlementsStore((s) => s.entitlements);
	return usesOwnerShell(profile, entitlements);
}
