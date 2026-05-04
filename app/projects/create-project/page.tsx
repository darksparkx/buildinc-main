"use client";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/base/layout/LoadingSpinner";
import { Button } from "@/components/base/ui/button";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useNeedsSubscriptionRenewal } from "@/lib/hooks/useNeedsSubscriptionRenewal";
import Link from "next/link";

const CreateProject = dynamic(
	() => import("@/components/createProject/CreateProject"),
	{ loading: () => <LoadingSpinner /> },
);

export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	const organisations = useOrganisationStore((state) => state.organisations);
	const ownerShell = useUsesOwnerShell(profile);
	const needsRenewal = useNeedsSubscriptionRenewal();

	if (!profile) return <LoadingSpinner />;
	if (!ownerShell) {
		if (needsRenewal) {
			return (
				<div className="mx-auto max-w-md space-y-4 p-6 text-center">
					<p className="text-muted-foreground text-sm">
						Your subscription is not active, so you can&apos;t create
						projects right now. Renew or unlock a plan under Billing to
						continue.
					</p>
					<Button asChild>
						<Link href="/billing">Open billing</Link>
					</Button>
				</div>
			);
		}
		return (
			<div className="mx-auto max-w-md space-y-4 p-6 text-center">
				<p className="text-muted-foreground text-sm">
					An active subscription is required to create projects. If you were
					invited as a teammate, ask your organisation owner to add you to a
					project.
				</p>
				<p className="text-muted-foreground text-xs">
					Organisation owners manage billing; you don&apos;t need your own
					subscription to work on shared projects.
				</p>
				<Button asChild variant="outline">
					<Link href="/billing">Billing</Link>
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
