import type { Metadata } from "next";
import { SignUpForm } from "./signUpForm";

export const metadata: Metadata = {
	title: "Sign up",
	description: "Create your BuildInc account.",
};

export default function Page() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<SignUpForm />
			</div>
		</div>
	);
}
