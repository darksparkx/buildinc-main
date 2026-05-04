"use client";

import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useProfileStore } from "@/lib/store/profileStore";
import { GalleryHorizontal, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function StatisticsPage() {
	const profile = useProfileStore((s) => s.profile);
	const ownerShell = useUsesOwnerShell(profile);

	if (!profile) {
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	if (!ownerShell) {
		return (
			<div className="mx-auto flex min-h-0 max-w-md flex-1 flex-col justify-center space-y-4 p-6 text-center">
				<p className="text-sm text-muted-foreground">
					Statistics are available to organisation owners. Your dashboard shows
					the tasks and activity that matter for your role.
				</p>
				<Button asChild variant="outline" className="w-full sm:mx-auto sm:w-auto">
					<Link href="/dashboard">Back to dashboard</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col space-y-6">
			<header className="flex items-start gap-3">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
					<GalleryHorizontal className="h-5 w-5" aria-hidden />
				</span>
				<div className="min-w-0 space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
					<p className="text-pretty text-sm text-muted-foreground">
						Summaries across your organisations and projects will live here.
						Reporting depth follows your plan (basic, advanced, or full).
					</p>
				</div>
			</header>

			<Card className="border-border/60 bg-muted/15 shadow-sm ring-1 ring-border/40">
				<CardHeader>
					<CardTitle className="text-base">Coming next</CardTitle>
					<CardDescription className="text-pretty">
						Use the dashboard for live task and progress snapshots while we
						expand analytics for your tier.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild variant="default" className="gap-2">
						<Link href="/dashboard">
							<LayoutDashboard className="h-4 w-4" aria-hidden />
							Open dashboard
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
