import type { Metadata } from "next";
import { RouteErrorFrame } from "@/components/base/layout/RouteErrorFrame";
import { userFacingAuthErrorMessage } from "@/lib/authErrorMessage";

export const metadata: Metadata = {
	title: "Sign-in issue",
	description: "We could not complete this sign-in step.",
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const params = await searchParams;
	const raw = params?.error;
	const message = userFacingAuthErrorMessage(raw);

	return (
		<RouteErrorFrame
			title="We couldn&apos;t complete that step"
			description={message}
			primaryHref="/auth/login"
			primaryLabel="Go to login"
		>
			{raw ? (
				<details className="rounded-md border border-white/20 bg-white/5 p-3 text-left text-xs text-white/80">
					<summary className="cursor-pointer font-medium text-white/90">
						Details for support
					</summary>
					<p className="mt-2 break-all font-mono text-[0.825rem] leading-relaxed text-white/70">
						{raw}
					</p>
				</details>
			) : null}
		</RouteErrorFrame>
	);
}
