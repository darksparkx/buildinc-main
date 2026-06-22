"use client";
import MemberWorkspace from "@/components/workspace/MemberWorkspace";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { useRequestsSync } from "@/lib/hooks/useRequestsSync";
import { useProfileStore } from "@/lib/store/profileStore";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	const router = useRouter();
	useRequestsSync(profile?.id);

	const { projects } = useProjectStore();
	const { phases } = usePhaseStore();
	const organisations = useOrganisationStore((state) => state.organisations);
	const requests = Object.values(useRequestStore((state) => state.requests));
	const ownerShell = useUsesOwnerShell(profile);

	useEffect(() => {
		if (profile && ownerShell) {
			router.replace("/projects");
		}
	}, [profile, ownerShell, router]);

	if (!profile || !projects) return <LoadingSpinner />;

	if (ownerShell) return <LoadingSpinner />;

	return (
		<MemberWorkspace
			organisations={Object.values(organisations)}
			projects={Object.values(projects)}
			phases={Object.values(phases)}
			requests={requests}
			profileId={profile.id}
		/>
	);
}
