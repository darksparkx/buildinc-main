import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgotPasswordForm";

export const metadata: Metadata = {
	title: "Reset password",
	description: "Request a password reset link for your BuildInc account.",
};

export default function Page() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<ForgotPasswordForm />
			</div>
		</div>
	);
}
