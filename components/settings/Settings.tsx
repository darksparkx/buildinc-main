"use client";

import { TabsTriggerList } from "@/components/base/general/TabsTriggerList";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/base/ui/alert-dialog";
import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/base/ui/table";
import { Tabs, TabsContent } from "@/components/base/ui/tabs";
import {
	modalButtonCancelClass,
	modalButtonDangerClass,
} from "@/lib/functions/modalButtonStyles";
import { cn, RupeeIcon } from "@/lib/functions/utils";
import { deleteMaterialPricing } from "@/lib/middleware/materialPricing";
import { useProfileStore } from "@/lib/store/profileStore";
import { LayoutGrid, Palette, Settings2, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMaterialPricingStore } from "@/lib/store/materialPricingStore";
import AddMaterialModal from "./AddMaterialModal";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/constants/contact";
import { AccountSettingsCard } from "./AccountSettingsCard";
import { AppearanceSettingsCard } from "./AppearanceSettingsCard";
import { BillingSettingsCard } from "./BillingSettingsCard";

export default function Settings() {
	const profile = useProfileStore((s) => s.profile);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const materialMap = useMaterialPricingStore(
		(s) => s.materialPricings ?? {},
	);
	const materials = useMemo(() => Object.values(materialMap), [materialMap]);

	const removeMaterial = (id: string) => {
		deleteMaterialPricing(id);
		toast.success("Material removed.");
	};

	if (!profile) return null;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-4">
					<div className="hidden flex-col gap-4 lg:flex lg:flex-row lg:items-end lg:justify-between">
						<div className="min-w-0 flex-1">
							<div className="flex items-start gap-3">
								<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
									<Settings2 className="h-5 w-5" aria-hidden />
								</span>
								<div className="min-w-0">
									<h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
										Settings
									</h1>
									<p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
										Account, appearance, and default material pricing.
									</p>
									<p className="mt-2 text-sm text-muted-foreground">
										Need help?{" "}
										<a
											href={supportMailto}
											className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
										>
											{SUPPORT_EMAIL}
										</a>
									</p>
									<p className="mt-1 text-xs text-muted-foreground/90">
										{profile.email}
									</p>
								</div>
							</div>
						</div>
					</div>
				</header>

				<Tabs defaultValue="account" className="w-full">
					<TabsTriggerList
						triggers={[
							{ value: "account", label: "Account" },
							{ value: "appearance", label: "Appearance" },
							{ value: "materials", label: "Materials" },
						]}
					/>

					<TabsContent value="account" className="mt-0 space-y-4">
						<div className="flex items-center gap-2 text-muted-foreground lg:hidden">
							<User className="h-4 w-4 shrink-0" aria-hidden />
							<span className="text-sm font-medium text-foreground">Account</span>
						</div>
						<AccountSettingsCard />
						<BillingSettingsCard />
					</TabsContent>

					<TabsContent value="appearance" className="mt-0 space-y-4">
						<div className="flex items-center gap-2 text-muted-foreground lg:hidden">
							<Palette className="h-4 w-4 shrink-0" aria-hidden />
							<span className="text-sm font-medium text-foreground">
								Appearance
							</span>
						</div>
						<AppearanceSettingsCard />
					</TabsContent>

					<TabsContent value="materials" className="mt-0 space-y-4">
						<div className="flex items-center gap-2 text-muted-foreground lg:hidden">
							<LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
							<span className="text-sm font-medium text-foreground">
								Materials
							</span>
						</div>
						<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
							<CardHeader className="space-y-3 pb-4">
								<div className="flex items-center justify-between gap-3">
									<div className="flex min-w-0 items-center gap-3">
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-400">
											<LayoutGrid className="h-4 w-4" aria-hidden />
										</span>
										<CardTitle className="text-lg sm:text-xl">
											Material pricing
										</CardTitle>
									</div>
									<div className="shrink-0">
										<AddMaterialModal
											isOpen={isCreateDialogOpen}
											onOpenChange={setIsCreateDialogOpen}
										/>
									</div>
								</div>
								<CardDescription className="text-pretty">
									Default unit prices when you add materials to tasks. You can
									still override per project where needed.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 pb-6">
								<ul className="space-y-3 sm:hidden">
									{materials.length === 0 ? (
										<li className="flex min-h-[6rem] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
											No materials yet. Add your first price above.
										</li>
									) : (
										materials.map((m) => (
											<li
												key={m.id}
												className="rounded-xl border border-border/60 bg-muted/10 p-4 ring-1 ring-border/30"
											>
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0">
														<p className="font-medium leading-snug">{m.name}</p>
														<p className="mt-0.5 text-xs text-muted-foreground">
															Per {m.unit}
														</p>
													</div>
													<RemoveMaterialButton
														name={m.name}
														onConfirm={() => removeMaterial(m.id)}
													/>
												</div>
												<p className="mt-3 flex items-center gap-1 font-mono text-sm tabular-nums text-foreground">
													{m.price}
													<RupeeIcon />
												</p>
											</li>
										))
									)}
								</ul>

								<div className="hidden overflow-hidden rounded-xl border border-border/60 sm:block">
									<Table>
										<TableHeader>
											<TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
												<TableHead className="font-medium">Material</TableHead>
												<TableHead className="font-medium">Default unit</TableHead>
												<TableHead className="text-right font-medium">
													Price / unit
												</TableHead>
												<TableHead className="w-[100px] text-right font-medium">
													<span className="sr-only">Actions</span>
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{materials.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={4}
														className="h-24 text-center text-sm text-muted-foreground"
													>
														No materials yet. Add your first price above.
													</TableCell>
												</TableRow>
											) : (
												materials.map((m) => (
													<TableRow
														key={m.id}
														className="border-border/40 hover:bg-muted/30"
													>
														<TableCell className="font-medium">{m.name}</TableCell>
														<TableCell className="text-muted-foreground">
															{m.unit}
														</TableCell>
														<TableCell className="text-right font-mono tabular-nums">
															{m.price}
															<RupeeIcon />
														</TableCell>
														<TableCell className="text-right">
															<RemoveMaterialButton
																name={m.name}
																onConfirm={() => removeMaterial(m.id)}
															/>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

function RemoveMaterialButton({
	name,
	onConfirm,
}: {
	name: string;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="icon"
					className={cn(
						"h-9 w-9 shrink-0 border-rose-500/40 text-rose-700 shadow-sm ring-1 ring-rose-500/25 hover:bg-rose-500/10 dark:text-rose-400",
					)}
					aria-label={`Remove ${name}`}
				>
					<Trash2 className="h-4 w-4" aria-hidden />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="border-border/60">
				<AlertDialogHeader>
					<AlertDialogTitle>Remove material?</AlertDialogTitle>
					<AlertDialogDescription>
						“{name}” will be removed from your default prices. Existing projects
						are not changed.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="gap-2 sm:gap-2">
					<AlertDialogCancel className={cn(modalButtonCancelClass, "mt-0")}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className={modalButtonDangerClass}
					>
						Remove
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
