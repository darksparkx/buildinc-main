"use client";
import Organisations from "@/components/organisations/Organisations";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { useRequestsSync } from "@/lib/hooks/useRequestsSync";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	const router = useRouter();
	useRequestsSync(profile?.id);
	const organisations = Object.values(
		useOrganisationStore((state) => state.organisations),
	);
	const requests = Object.values(useRequestStore((state) => state.requests));
	const ownerShell = useUsesOwnerShell(profile);

	useEffect(() => {
		if (profile && !ownerShell) {
			router.replace("/workspace");
		}
	}, [profile, ownerShell, router]);

	if (!profile) {
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	if (!ownerShell) {
		return <LoadingSpinner />;
	}

	if (!organisations) return <LoadingSpinner />;
	return (
		<Organisations
			organisations={organisations}
			admin
			requests={requests}
		/>
	);
}
