"use client";

import { RouteErrorFrame } from "@/components/base/layout/RouteErrorFrame";
import { WorkspaceQuickLinks } from "@/components/base/layout/WorkspaceQuickLinks";
import { useBrowserSessionPresent } from "@/lib/hooks/useBrowserSessionPresent";
import { Quicksand } from "next/font/google";
import Link from "next/link";
import { useEffect } from "react";
import "./globals.css";

const quicksand = Quicksand({
	subsets: ["latin"],
	display: "swap",
});

function GlobalErrorInner({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const hasSession = useBrowserSessionPresent();

	useEffect(() => {
		console.error("[app/global-error]", error);
	}, [error]);

	useEffect(() => {
		document.title = "Something went wrong – BuildInc";
	}, []);

	const sessionPending = hasSession === null;
	const authed = hasSession === true;

	const description = sessionPending
		? "BuildInc hit a serious error. Try again now; we’ll enable the right continue option in a moment."
		: authed
			? "BuildInc hit a serious error. Try again or return to your workspace. If the problem continues, contact support."
			: "BuildInc hit a serious error loading the page shell. Try again or go home. Use Log in if you need your account.";

	return (
		<RouteErrorFrame
			title="Something went wrong"
			description={description}
			primaryPending={sessionPending}
			primaryHref={authed ? "/dashboard" : "/"}
			primaryLabel={authed ? "Go to dashboard" : "Go to home"}
			onRetry={reset}
			retryLabel="Try again"
		>
			{!sessionPending && authed ? <WorkspaceQuickLinks /> : null}
			{!sessionPending && !authed ? (
				<p className="text-sm text-white/85">
					<Link
						href="/auth/login"
						className="font-medium text-white underline underline-offset-2 hover:text-white"
					>
						Log in
					</Link>
				</p>
			) : null}
			{error.digest ? (
				<p className="font-mono text-xs text-white/60">
					Reference: {error.digest}
				</p>
			) : null}
		</RouteErrorFrame>
	);
}

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body
				className={`${quicksand.className} bg-background antialiased text-md text-foreground`}
			>
				<GlobalErrorInner error={error} reset={reset} />
			</body>
		</html>
	);
}
