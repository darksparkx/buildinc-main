import type { Metadata } from "next";
import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Confirm your email",
	description: "Finish signing up by confirming your email address.",
};

export default function Page() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Card className="bg-secondary text-white">
						<CardHeader>
							<CardTitle className="text-2xl">
								Thank you for signing up!
							</CardTitle>
							<CardDescription className="text-white/90">
								Check your email to confirm
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-6">
							<p className="text-sm text-white/90">
								You&apos;ve successfully signed up. Please check
								your email to confirm your account before
								signing in.
							</p>
							<Button
								asChild
								className="w-full bg-white/70"
							>
								<Link href="/auth/login">Go to login</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
