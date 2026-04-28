"use client";
import Organisations from "@/components/organisations/Organisations";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useRequestStore } from "@/lib/store/requestStore";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";

export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	const organisations = Object.values(
		useOrganisationStore((state) => state.organisations)
	);
	const requests = Object.values(useRequestStore((state) => state.requests));

	if (!profile) {
		// redirect and don't render until profile exists
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	if (!organisations) return <LoadingSpinner />;
	const ownerShell = useUsesOwnerShell(profile);
	return (
		<Organisations
			organisations={organisations}
			admin={ownerShell}
			requests={requests}
		/>
	);
}
