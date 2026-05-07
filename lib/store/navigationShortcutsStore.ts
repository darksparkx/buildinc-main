import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShortcutKind = "project" | "organisation" | "task";

export type RecentShortcut = {
	kind: ShortcutKind;
	id: string;
	href: string;
	title: string;
	at: number;
};

const MAX_RECENT = 8;

type NavShortcutsState = {
	recent: RecentShortcut[];
	recordVisit: (entry: Omit<RecentShortcut, "at">) => void;
};

export const useNavigationShortcutsStore = create<NavShortcutsState>()(
	persist(
		(set, get) => ({
			recent: [],

			recordVisit: (entry) => {
				const at = Date.now();
				const rest = get().recent.filter(
					(e) => !(e.kind === entry.kind && e.id === entry.id),
				);
				set({ recent: [{ ...entry, at }, ...rest].slice(0, MAX_RECENT) });
			},
		}),
		{
			name: "dashboard-recent-activity-v1",
		},
	),
);
