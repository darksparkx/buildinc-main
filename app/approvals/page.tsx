"use client";
import Approvals from "@/components/approvals/Approvals";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useProfileStore } from "@/lib/store/profileStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	const router = useRouter();
	const ownerShell = useUsesOwnerShell(profile);

	useEffect(() => {
		if (profile && !ownerShell) {
			router.replace("/tasks");
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

	return <Approvals admin />;
}
