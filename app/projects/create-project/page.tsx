"use client";
import CreateProject from "@/components/createProject/CreateProject";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { Button } from "@/components/base/ui/button";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import Link from "next/link";
import React from "react";

export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	const organisations = useOrganisationStore((state) => state.organisations);
	const ownerShell = useUsesOwnerShell(profile);

	if (!profile) return <LoadingSpinner />;
	if (!ownerShell) {
		return (
			<div className="mx-auto max-w-md space-y-4 p-6 text-center">
				<p className="text-muted-foreground text-sm">
					An active subscription is required to create projects. If you were
					invited as a teammate, ask your organisation owner to add you to a
					project.
				</p>
				<Button asChild>
					<Link href="/billing">View billing</Link>
				</Button>
			</div>
		);
	}

	return (
		<CreateProject
			profile={profile}
			organisations={Object.values(organisations)}
		/>
	);
}
