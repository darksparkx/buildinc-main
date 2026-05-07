import type { Metadata } from "next";
import { LoginForm } from "./loginForm";

export const metadata: Metadata = {
	title: "Log in",
	description: "Sign in to your BuildInc account.",
};

export default function Page() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</div>
	);
}
