"use client";

import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Separator } from "@/components/base/ui/separator";
import {
	formatSubscriptionDate,
	formatSubscriptionStatus,
	subscriptionPlanLabel,
} from "@/lib/billing/subscriptionDisplay";
import { isActiveSubscriber } from "@/lib/billing/subscriberStatus";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { cn } from "@/lib/functions/utils";
import { CreditCard } from "lucide-react";
import Link from "next/link";

function capLine(label: string, value: number | null | undefined) {
	const shown =
		value != null && Number.isFinite(value) ? String(value) : "—";
	return (
		<div className="flex justify-between gap-4 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="tabular-nums text-foreground">{shown}</span>
		</div>
	);
}

export function BillingSettingsCard() {
	const profile = useProfileStore((s) => s.profile);
	const ownerShell = useUsesOwnerShell(profile);
	const entitlements = useEntitlementsStore((s) => s.entitlements);

	if (!profile) return null;

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-3 pb-4">
				<div className="flex items-center gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-800 ring-1 ring-violet-500/25 dark:text-violet-300">
						<CreditCard className="h-4 w-4" aria-hidden />
					</span>
					<CardTitle className="text-lg sm:text-xl">Billing</CardTitle>
				</div>
				<CardDescription className="text-pretty">
					{ownerShell
						? "Unlock or manage your plan, limits, and access for organisations you own."
						: "Your organisation owner manages the subscription. You don’t need a paid plan to work on shared projects."}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pb-6">
				{ownerShell ? (
					<>
						{entitlements ? (
							<div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-left ring-1 ring-border/30">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<span className="text-sm font-medium text-foreground">
										{subscriptionPlanLabel(entitlements.plan)}
									</span>
									<span
										className={cn(
											"rounded-md px-2 py-0.5 text-xs font-medium ring-1",
											isActiveSubscriber(entitlements)
												? "bg-primary/10 text-primary ring-primary/20"
												: "bg-muted text-muted-foreground ring-border",
										)}
									>
										{isActiveSubscriber(entitlements)
											? "Active"
											: formatSubscriptionStatus(entitlements.status)}
									</span>
								</div>
								<dl className="space-y-1.5 text-sm text-muted-foreground">
									{entitlements.billing_provider ? (
										<div className="flex justify-between gap-4">
											<dt>Provider</dt>
											<dd className="text-foreground">
												{entitlements.billing_provider}
											</dd>
										</div>
									) : null}
									{formatSubscriptionDate(
										entitlements.current_period_end,
									) ? (
										<div className="flex justify-between gap-4">
											<dt>Renews / ends</dt>
											<dd className="tabular-nums text-foreground">
												{formatSubscriptionDate(
													entitlements.current_period_end,
												)}
											</dd>
										</div>
									) : null}
									{formatSubscriptionDate(entitlements.trial_ends_at) ? (
										<div className="flex justify-between gap-4">
											<dt>Trial ends</dt>
											<dd className="tabular-nums text-foreground">
												{formatSubscriptionDate(entitlements.trial_ends_at)}
											</dd>
										</div>
									) : null}
								</dl>
								<Separator className="bg-border/60" />
								<div className="space-y-2">
									<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Limits
									</p>
									{capLine("Organisations (max)", entitlements.max_orgs)}
									{capLine("Projects (max)", entitlements.max_projects)}
									{capLine("Members (max)", entitlements.max_users)}
								</div>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No subscription details loaded yet. Open billing to unlock a
								plan or refresh the page.
							</p>
						)}
						<Button asChild variant="outline" className="w-full sm:w-auto">
							<Link href="/billing">Open billing</Link>
						</Button>
					</>
				) : (
					<p className="text-sm text-muted-foreground">
						If you’re setting up BuildInc for your company, you’ll need an
						owner account with an active plan.{" "}
						<Link
							href="/billing"
							className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
						>
							Billing
						</Link>{" "}
						is mainly for organisation owners.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
