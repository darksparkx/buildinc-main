"use client";
import Projects from "@/components/projects/Projects";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { useProfileStore } from "@/lib/store/profileStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
export default function Page() {
	const profile = useProfileStore((state) => state.profile);

	const { projects } = useProjectStore();
	const { phases } = usePhaseStore();
	const requests = Object.values(useRequestStore((state) => state.requests));

	if (!profile || !projects) return <LoadingSpinner />;

	const ownerShell = useUsesOwnerShell(profile);

	return (
		<Projects
			projects={Object.values(projects)}
			phases={Object.values(phases)}
			admin={ownerShell}
			requests={requests}
		/>
	);
}
