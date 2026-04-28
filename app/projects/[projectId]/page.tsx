// app/projects/[projectId]/page.tsx
"use client";

import { useProfileStore } from "@/lib/store/profileStore";
import ProjectDetails from "@/components/projectDetails/ProjectDetails";
import { useprojectDetailStore } from "@/lib/store/projectDetailStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { use, useEffect } from "react";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useRouter } from "next/navigation";
import { hydrateProjectBoardData } from "@/lib/middleware/phases";

export default function Page({
	params,
}: {
	params: Promise<{ projectId: string }>;
}) {
	const { projectId } = use(params);

	const profile = useProfileStore((state) => state.profile);

	const { setprojectDetails } = useprojectDetailStore();
	const organisations = useOrganisationStore((state) => state.organisations);
	const projects = useProjectStore((store) => store.projects);
	const project = Object.values(projects).find((p) => p.id === projectId);
	const organisation = Object.values(organisations).find(
		(org) => org.id === project?.orgId
	);
	useEffect(() => {
		if (project && organisation) {
			setprojectDetails(project, organisation);
		}
	}, [project, organisation, setprojectDetails]);

	useEffect(() => {
		if (!projectId || !project) return;
		hydrateProjectBoardData(projectId).catch((err) => {
			console.error("Failed to load project board (phases/tasks):", err);
		});
	}, [projectId, project?.id]);

	const router = useRouter();
	if (!profile) {
		// redirect and don't render until profile exists
		window.location.href = "/";
		window.location.reload();
		return null;
	}
	if (!project) return <LoadingSpinner />;

	return <ProjectDetails />;
}
