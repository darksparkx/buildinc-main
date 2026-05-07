"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";

export function RouteErrorFrame({
	title,
	description,
	primaryHref = "/",
	primaryLabel = "Go to home",
	/** When true, replaces the primary link with a disabled loading control (e.g. while resolving auth). */
	primaryPending = false,
	onRetry,
	retryLabel = "Try again",
	children,
	/** Covers the entire viewport above the app shell (sidebar/top bar) when an error renders inside AppLayout. */
	variant = "inline",
}: {
	title: string;
	description?: ReactNode;
	primaryHref?: string;
	primaryLabel?: string;
	primaryPending?: boolean;
	onRetry?: () => void;
	retryLabel?: string;
	children?: ReactNode;
	variant?: "inline" | "fullscreen";
}) {
	const shell =
		variant === "fullscreen"
			? "fixed inset-0 z-[200] flex w-full items-center justify-center overflow-y-auto bg-background p-6 md:p-10"
			: "flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10";

	return (
		<div
			className={shell}
			role="alert"
		>
			<div className="w-full max-w-sm">
				<Card className="border-0 bg-secondary text-white shadow-lg">
					<CardHeader>
						<CardTitle className="text-2xl text-white">
							{title}
						</CardTitle>
						{description ? (
							<CardDescription className="text-white/90">
								{description}
							</CardDescription>
						) : null}
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						{children}
						<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
							{onRetry ? (
								<Button
									type="button"
									variant="outline"
									className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:order-1"
									onClick={onRetry}
								>
									{retryLabel}
								</Button>
							) : null}
							{primaryPending ? (
								<Button
									type="button"
									disabled
									className="cursor-wait bg-white/90 text-secondary hover:bg-white/90 sm:order-2"
								>
									<Loader2
										className="mr-2 h-4 w-4 shrink-0 animate-spin"
										aria-hidden
									/>
									One moment…
								</Button>
							) : (
								<Button
									asChild
									className="bg-white/90 text-secondary hover:bg-white sm:order-2"
								>
									<Link href={primaryHref}>{primaryLabel}</Link>
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
