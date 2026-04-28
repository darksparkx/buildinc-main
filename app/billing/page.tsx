"use client";

import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { PLAN_OFFERS, PUBLIC_TIER_IDS } from "@/lib/billing/planOffers";
import type { PublicTierId } from "@/lib/billing/tierLimits";
import { cn } from "@/lib/functions/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function BillingPage() {
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
		} catch {
			toast.error("Network error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto max-w-5xl space-y-8 p-6">
			<div>
				<h1 className="text-2xl font-semibold">Billing</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Tiers drive limits everywhere: manual unlock today, gateway checkout
					later — set `PAYMENT_PLAN_ID_*` once per tier in env rather than duplicating tiers per vendor.
				</p>
			</div>

			<section className="space-y-3">
				<h2 className="font-medium text-sm">Choose a plan</h2>
				<div className="grid gap-4 sm:grid-cols-3">
					{PUBLIC_TIER_IDS.map((id) => {
						const o = PLAN_OFFERS[id];
						const selected = tier === id;
						return (
							<Card
								key={id}
								tabIndex={0}
								onClick={() => setTier(id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setTier(id);
									}
								}}
								className={cn(
									"cursor-pointer outline-none transition-colors",
									selected
										? "ring-2 ring-primary"
										: "hover:bg-muted/40",
								)}
							>
								<CardHeader>
									<CardTitle className="text-lg">{o.name}</CardTitle>
									<p className="font-semibold text-base">{o.priceLabel}</p>
									<CardDescription className="text-xs">{o.blurb}</CardDescription>
								</CardHeader>
								{selected ? (
									<CardFooter className="pt-0 text-primary text-xs">
										Selected
									</CardFooter>
								) : (
									<CardFooter className="pt-0 text-muted-foreground text-xs">
										Click to select
									</CardFooter>
								)}
							</Card>
						);
					})}
				</div>
			</section>

			<Card>
				<CardHeader>
					<CardTitle>Activate access</CardTitle>
					<CardDescription>
						{tier ? (
							<>
								You&apos;re activating{" "}
								<strong>{PLAN_OFFERS[tier].name}</strong>. Enter the code you
								were given (beta / invoiced customers).
							</>
						) : (
							<>Select a plan above, then enter your access code.</>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={submit}
						className="space-y-4"
					>
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
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={loading || !tier || !code.trim()}
						>
							{loading ? "Checking…" : "Submit"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
