"use client";

import { Button } from "@/components/base/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function SubscriptionRenewalBanner() {
	return (
		<div
			role="status"
			className="border-b border-amber-500/35 bg-amber-500/10 px-4 py-3 text-amber-950 dark:bg-amber-500/15 dark:text-amber-50"
		>
			<div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
				<div className="flex min-w-0 gap-3">
					<span className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-100 sm:inline-flex">
						<AlertTriangle className="h-4 w-4" aria-hidden />
					</span>
					<p className="min-w-0 text-sm leading-snug">
						<span className="font-medium">Subscription not active.</span>{" "}
						Renew or unlock a plan under Billing to restore full owner
						access (creating organisations and projects, and inviting at your
						limits). You can still use workspaces you already belong to.
					</p>
				</div>
				<Button
					asChild
					size="sm"
					variant="outline"
					className="shrink-0 border-amber-700/40 bg-background/80 text-amber-950 hover:bg-amber-500/10 dark:border-amber-300/40 dark:text-amber-50"
				>
					<Link href="/billing">Open billing</Link>
				</Button>
			</div>
		</div>
	);
}
