"use client";

import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { PLAN_OFFERS, PUBLIC_TIER_IDS } from "@/lib/billing/planOffers";
import type { PublicTierId } from "@/lib/billing/tierLimits";
import {
	applyEntitlementsRowToStore,
	fetchSubscriberEntitlementsRowForUser,
} from "@/lib/billing/fetchSubscriberEntitlementsClient";
import { runSessionStoreLoad } from "@/lib/data/runSessionStoreLoad";
import { cn } from "@/lib/functions/utils";
import { useProfileStore } from "@/lib/store/profileStore";
import { Check, CreditCard, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const maxFeatureRows = Math.max(
	...PUBLIC_TIER_IDS.map((id) => PLAN_OFFERS[id].features.length),
);

function planHeaderCardClasses(selected: boolean) {
	return cn(
		"flex h-full min-h-0 w-full flex-col rounded-xl border border-border/60 bg-background/80 text-left shadow-sm ring-1 ring-border/40 outline-none backdrop-blur-sm transition-all",
		"hover:bg-muted/25 focus-visible:ring-2 focus-visible:ring-primary/40",
		selected &&
			"border-primary/50 bg-primary/[0.06] ring-2 ring-primary/35 shadow-md",
	);
}

export default function BillingPage() {
	const router = useRouter();
	const [tier, setTier] = useState<PublicTierId | null>(null);
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!tier) {
			toast.error("Choose a plan first");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/billing/unlock-with-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: code.trim(), tier }),
			});
			const data = (await res.json()) as {
				ok?: boolean;
				plan?: string;
				error?: string;
			};
			if (!res.ok) {
				toast.error(data.error ?? "Something went wrong");
				return;
			}
			toast.success(
				data.plan
					? `Access updated (${data.plan}).`
					: "Access updated.",
			);
			setCode("");
			const profile = useProfileStore.getState().profile;
			if (profile) {
				try {
					const raw = await fetchSubscriberEntitlementsRowForUser(
						profile.id,
					);
					applyEntitlementsRowToStore(raw);
					await runSessionStoreLoad(profile, raw);
				} catch (err) {
					console.error("Refresh after unlock failed:", err);
					toast.message(
						"Plan updated. If the app doesn’t reflect it, refresh the page.",
					);
				}
			}
			router.refresh();
		} catch {
			toast.error("Network error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex items-start gap-3">
								<span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 sm:inline-flex">
									<CreditCard className="h-5 w-5" aria-hidden />
								</span>
								<div className="min-w-0">
									<h1 className="hidden text-2xl font-semibold tracking-tight lg:block lg:text-3xl">
										Billing
									</h1>
								</div>
							</div>
						</div>
					</div>
				</header>

				<section className="space-y-4">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-lg font-semibold tracking-tight sm:text-xl">
							Choose a plan
						</h2>
						<p className="mt-1 text-pretty text-sm text-muted-foreground">
							Tiers control organisation, project, and member limits. Teammates
							use their own logins and don&apos;t need a separate paid
							subscription.
						</p>
					</div>

					{/* Mobile / tablet: stacked full cards */}
					<div className="grid grid-cols-1 gap-4 lg:hidden">
						{PUBLIC_TIER_IDS.map((id) => {
							const o = PLAN_OFFERS[id];
							const selected = tier === id;
							return (
								<button
									key={id}
									type="button"
									onClick={() => setTier(id)}
									aria-pressed={selected}
									className={planHeaderCardClasses(selected)}
								>
									<div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
										<div className="flex min-h-[10.5rem] shrink-0 flex-col text-left">
											<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
												{selected ? "Selected" : "Tap to select"}
											</p>
											<h3 className="mt-1 text-xl font-semibold tracking-tight">
												{o.name}
											</h3>
											<p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
												{o.priceLabel}
											</p>
											<p className="mt-1 flex-1 text-sm leading-snug text-muted-foreground">
												{o.tagline}
											</p>
										</div>
										<ul className="mt-4 w-full space-y-2.5 border-t border-border/50 pt-4 text-left">
											{o.features.map((line) => (
												<li
													key={line}
													className="flex w-full items-start gap-2.5 text-left text-sm leading-snug text-muted-foreground"
												>
													<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
														<Check
															className="h-3 w-3"
															strokeWidth={2.5}
															aria-hidden
														/>
													</span>
													<span className="min-w-0 flex-1 text-left">{line}</span>
												</li>
											))}
										</ul>
									</div>
								</button>
							);
						})}
					</div>

					{/* Desktop: equal header row + aligned feature rows (left-aligned, not centred) */}
					<div className="hidden lg:block">
						<div className="grid grid-cols-3 gap-4 items-stretch">
							{PUBLIC_TIER_IDS.map((id) => {
								const o = PLAN_OFFERS[id];
								const selected = tier === id;
								return (
									<button
										key={id}
										type="button"
										onClick={() => setTier(id)}
										aria-pressed={selected}
										className={planHeaderCardClasses(selected)}
									>
										<div className="flex min-h-[10.5rem] flex-col p-6 text-left">
											<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
												{selected ? "Selected" : "Tap to select"}
											</p>
											<h3 className="mt-1 text-xl font-semibold tracking-tight">
												{o.name}
											</h3>
											<p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
												{o.priceLabel}
											</p>
											<p className="mt-1 flex-1 text-sm leading-snug text-muted-foreground">
												{o.tagline}
											</p>
										</div>
									</button>
								);
							})}
						</div>
						<div className="mt-4 border-t border-border/50 pt-2.5">
							<div className="flex flex-col gap-2.5">
								{Array.from({ length: maxFeatureRows }, (_, rowIdx) => (
									<div
										key={rowIdx}
										className="grid grid-cols-3 gap-4 items-start text-left"
									>
										{PUBLIC_TIER_IDS.map((id) => {
											const line = PLAN_OFFERS[id].features[rowIdx];
											const selected = tier === id;
											return (
												<div
													key={id}
													className={cn(
														"flex min-h-6 w-full items-start gap-2.5 px-1 text-sm leading-snug text-muted-foreground",
														selected && "rounded-lg bg-primary/[0.06] px-3 py-2 ring-1 ring-primary/15",
													)}
												>
													{line ? (
														<>
															<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
																<Check
																	className="h-3 w-3"
																	strokeWidth={2.5}
																	aria-hidden
																/>
															</span>
															<span className="min-w-0 flex-1 text-left">{line}</span>
														</>
													) : (
														<>
															<span
																className="invisible mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
																aria-hidden
															>
																<Check
																	className="h-3 w-3"
																	strokeWidth={2.5}
																	aria-hidden
																/>
															</span>
															<span
																className="invisible flex-1 select-none text-left"
																aria-hidden
															>
																Placeholder
															</span>
														</>
													)}
												</div>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
					<CardHeader className="space-y-3 pb-4 sm:flex-row sm:items-start sm:gap-4">
						<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/25 dark:text-violet-300">
							<KeyRound className="h-5 w-5" aria-hidden />
						</span>
						<div className="min-w-0 space-y-1">
							<CardTitle className="text-lg sm:text-xl">
								Activate with your code
							</CardTitle>
							<CardDescription className="text-pretty">
								{tier ? (
									<>
										You&apos;re unlocking{" "}
										<strong className="text-foreground">
											{PLAN_OFFERS[tier].name}
										</strong>
										. Paste the access code from your invite, invoice, or
										support email.
									</>
								) : (
									<>Select a plan above, then enter your access code.</>
								)}
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="pb-6 sm:px-6">
						<form onSubmit={submit} className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="code">Access code</Label>
								<Input
									id="code"
									type="password"
									autoComplete="off"
									value={code}
									onChange={(e) => setCode(e.target.value)}
									placeholder="Enter code"
									disabled={!tier}
									required={!!tier}
									className="h-11 border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40"
								/>
							</div>
							<Button
								type="submit"
								className="h-11 w-full sm:w-auto"
								disabled={loading || !tier || !code.trim()}
							>
								{loading ? "Checking…" : "Apply code"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
