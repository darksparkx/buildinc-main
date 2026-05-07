"use client";

import { useNavigationShortcutsStore } from "@/lib/store/navigationShortcutsStore";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Records recent org/project/task visits for dashboard shortcuts. No UI.
 */
export function NavigationShortcutsTracker() {
	const pathname = usePathname();
	const recordVisit = useNavigationShortcutsStore((s) => s.recordVisit);

	useEffect(() => {
		const projSeg =
			pathname.startsWith("/projects/") &&
			pathname.slice("/projects/".length).split("/")[0];
		if (
			projSeg &&
			projSeg !== "create-project" &&
			pathname.match(/^\/projects\/[^/]+\/?$/)
		) {
			const p = useProjectStore.getState().getProject(projSeg);
			if (p) {
				recordVisit({
					kind: "project",
					id: p.id,
					href: `/projects/${p.id}`,
					title: p.name?.trim() || "Project",
				});
			}
			return;
		}

		const orgSeg =
			pathname.startsWith("/organisations/") &&
			pathname.slice("/organisations/".length).split("/")[0];
		if (orgSeg && pathname.match(/^\/organisations\/[^/]+\/?$/)) {
			const o = useOrganisationStore.getState().getOrganisation(orgSeg);
			if (o) {
				recordVisit({
					kind: "organisation",
					id: o.id,
					href: `/organisations/${o.id}`,
					title: o.name?.trim() || "Organisation",
				});
			}
			return;
		}

		const taskSeg =
			pathname.startsWith("/tasks/") &&
			pathname.slice("/tasks/".length).split("/")[0];
		if (taskSeg && pathname.match(/^\/tasks\/[^/]+\/?$/)) {
			const t = useTaskStore.getState().getTask(taskSeg);
			if (t) {
				recordVisit({
					kind: "task",
					id: t.id,
					href: `/tasks/${t.id}`,
					title: t.name?.trim() || "Task",
				});
			}
		}
	}, [pathname, recordVisit]);

	return null;
}
