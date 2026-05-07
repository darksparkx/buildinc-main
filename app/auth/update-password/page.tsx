import type { Metadata } from "next";
import { UpdatePasswordForm } from "./updatePasswordForm";

export const metadata: Metadata = {
	title: "New password",
	description: "Set a new password for your BuildInc account.",
};

export default function Page() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<UpdatePasswordForm />
			</div>
		</div>
	);
}
