import type { ISubscriberEntitlementsDB } from "@/lib/types";
import { create } from "zustand";

interface EntitlementsState {
	entitlements: ISubscriberEntitlementsDB | null;
	setEntitlements: (row: ISubscriberEntitlementsDB | null) => void;
	clearEntitlements: () => void;
}

export const useEntitlementsStore = create<EntitlementsState>()((set) => ({
	entitlements: null,
	setEntitlements: (entitlements) => set({ entitlements }),
	clearEntitlements: () => set({ entitlements: null }),
}));
