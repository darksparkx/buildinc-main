"use client";
import Approvals from "@/components/approvals/Approvals";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useProfileStore } from "@/lib/store/profileStore";
export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	const ownerShell = useUsesOwnerShell(profile);
	if (!profile) {
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	return <Approvals admin={ownerShell} />;
}
