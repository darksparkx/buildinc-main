import type { Metadata } from "next";
import Link from "next/link";
import { WorkspaceQuickLinks } from "@/components/base/layout/WorkspaceQuickLinks";
import { RouteErrorFrame } from "@/components/base/layout/RouteErrorFrame";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "Page not found",
	description: "This page does not exist or has been moved.",
};

export default async function NotFound() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const authed = !!user;

	return (
		<RouteErrorFrame
			variant="fullscreen"
			title="Page not found"
			description={
				authed
					? "That link doesn’t match a page in BuildInc, or your account can’t open it. Check the address, or use a shortcut below."
					: "This page doesn’t exist, or you may need to sign in first."
			}
			primaryHref={authed ? "/dashboard" : "/"}
			primaryLabel={authed ? "Go to dashboard" : "Go to home"}
		>
			{authed ? (
				<WorkspaceQuickLinks />
			) : (
				<p className="text-sm text-white/85">
					Returning user?{" "}
					<Link
						href="/auth/login"
						className="font-medium text-white underline underline-offset-2 hover:text-white"
					>
						Log in
					</Link>
					{" · "}
					<Link
						href="/auth/sign-up"
						className="font-medium text-white underline underline-offset-2 hover:text-white"
					>
						Sign up
					</Link>
				</p>
			)}
		</RouteErrorFrame>
	);
}
