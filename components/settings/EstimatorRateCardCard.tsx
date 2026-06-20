"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Button } from "@/components/base/ui/button";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { DEFAULT_RATE_CARD } from "@/lib/projectGeneration/rateCard";
import { PROJECT_TYPES } from "@/lib/projectGeneration/projectTypes";
import type { EstimatorRateCard, FinishLevel, ProjectTypeId } from "@/lib/projectGeneration/types";
import {
	getCachedRateCard,
	loadEstimatorRateCard,
	saveEstimatorRateCard,
} from "@/lib/middleware/estimatorRateCard";
import { useProfileStore } from "@/lib/store/profileStore";
import { Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";

const FINISH_LEVELS: FinishLevel[] = ["basic", "standard", "premium"];

const BENCHMARK_EDIT_TYPES = PROJECT_TYPES.filter((t) =>
	["R1", "R3", "R4", "C1", "C3", "I1", "N1"].includes(t.id),
) as typeof PROJECT_TYPES;

export function EstimatorRateCardCard() {
	const profile = useProfileStore((s) => s.profile);
	const [card, setCard] = useState<EstimatorRateCard>(DEFAULT_RATE_CARD);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!profile?.id) return;
		setLoading(true);
		loadEstimatorRateCard(profile.id)
			.then(setCard)
			.catch(() => setCard(getCachedRateCard()))
			.finally(() => setLoading(false));
	}, [profile?.id]);

	const save = async () => {
		if (!profile?.id) return;
		setSaving(true);
		try {
			const saved = await saveEstimatorRateCard(profile.id, card);
			setCard(saved);
			toast.success("Estimator rate card saved.");
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "Could not save rate card",
			);
		} finally {
			setSaving(false);
		}
	};

	const setFinishMultiplier = (level: FinishLevel, value: string) => {
		const n = Number(value);
		if (!Number.isFinite(n) || n <= 0) return;
		setCard((c) => ({
			...c,
			finishMultipliers: { ...c.finishMultipliers, [level]: n },
		}));
	};

	const setBenchmark = (typeId: ProjectTypeId, value: string) => {
		const n = Number(value);
		if (!Number.isFinite(n) || n <= 0) return;
		setCard((c) => ({
			...c,
			benchmarkPerSqft: { ...c.benchmarkPerSqft, [typeId]: n },
		}));
	};

	if (!profile) return null;

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-3 pb-4">
				<div className="flex items-center gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/25 dark:text-violet-300">
						<Calculator className="h-4 w-4" aria-hidden />
					</span>
					<div>
						<CardTitle className="text-lg sm:text-xl">
							Estimator rate card
						</CardTitle>
						<CardDescription>
							Defaults for project plan generation (₹/sqft benchmarks and
							finish multipliers). Material unit costs use your Materials tab
							where IDs match.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 pb-6">
				{loading ? (
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading rate card…
					</p>
				) : (
					<>
						<div className="space-y-3">
							<Label className="text-sm font-medium">Finish multipliers</Label>
							<div className="grid gap-3 sm:grid-cols-3">
								{FINISH_LEVELS.map((level) => (
									<div key={level} className="space-y-1">
										<Label className="text-xs capitalize text-muted-foreground">
											{level}
										</Label>
										<Input
											type="number"
											step="0.01"
											min={0.5}
											max={2}
											value={card.finishMultipliers[level]}
											onChange={(e) =>
												setFinishMultiplier(level, e.target.value)
											}
										/>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<Label className="text-sm font-medium">
								₹/sqft benchmarks (sample types)
							</Label>
							<p className="text-xs text-muted-foreground">
								Other types use catalog defaults until you expand this list in a
								future release.
							</p>
							<div className="grid gap-3 sm:grid-cols-2">
								{BENCHMARK_EDIT_TYPES.map((t) => (
									<div key={t.id} className="space-y-1">
										<Label className="text-xs text-muted-foreground">
											{t.id} — {t.label}
										</Label>
										<Input
											type="number"
											min={100}
											value={
												card.benchmarkPerSqft[t.id as ProjectTypeId] ??
												t.defaultBenchmarkPerSqft
											}
											onChange={(e) =>
												setBenchmark(t.id as ProjectTypeId, e.target.value)
											}
										/>
									</div>
								))}
							</div>
						</div>

						<Button type="button" onClick={save} disabled={saving}>
							{saving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving…
								</>
							) : (
								"Save rate card"
							)}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}
