"use client";

import { RouteErrorFrame } from "@/components/base/layout/RouteErrorFrame";
import { WorkspaceQuickLinks } from "@/components/base/layout/WorkspaceQuickLinks";
import { useBrowserSessionPresent } from "@/lib/hooks/useBrowserSessionPresent";
import Link from "next/link";
import { useEffect } from "react";

function ErrorContent({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const hasSession = useBrowserSessionPresent();

	useEffect(() => {
		console.error("[app/error]", error);
	}, [error]);

	useEffect(() => {
		document.title = "Something went wrong – BuildInc";
	}, []);

	const sessionPending = hasSession === null;
	const authed = hasSession === true;

	const description = sessionPending
		? "An unexpected error occurred. You can try again now; we’ll enable the right continue option in a moment."
		: authed
			? "An unexpected error occurred. You can try again, go back to your workspace, or use a shortcut below. If this keeps happening, contact support."
			: "An unexpected error occurred. Try again or return home. If you need to sign in, use the link below.";

	return (
		<RouteErrorFrame
			variant="fullscreen"
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

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return <ErrorContent error={error} reset={reset} />;
}
