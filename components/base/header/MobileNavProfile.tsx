"use client";
import { createClient } from "@/lib/supabase/client";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { Button } from "../ui/button";
import { IProfile } from "@/lib/types";
import { useState } from "react";
import { ClearData } from "@/lib/functions/utils";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import clsx from "clsx";

const MobileNavProfile = ({ profile }: { profile: IProfile }) => {
	const pathname = usePathname();
	const ownerShell = useUsesOwnerShell(profile);
	const accountOpen =
		pathname === "/settings" ||
		pathname === "/billing" ||
		pathname === "/profile";

	const logout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		ClearData();
		window.location.href = "/";
	};
	const [open, setOpen] = useState(false);
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button
					type="button"
					className="inline-flex shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Account menu"
				>
					<User
						className={clsx(
							"h-8 w-8 rounded-full p-2",
							accountOpen
								? "bg-secondary text-secondary-foreground"
								: "text-muted-foreground",
						)}
					/>
				</button>
			</SheetTrigger>

			<SheetContent side="bottom" className="rounded-t-2xl">
				<SheetHeader className="mb-6 text-left">
					<SheetTitle>Account</SheetTitle>
				</SheetHeader>

				<div className="mx-3 mb-3 flex flex-col gap-2">
					<div className="mb-4 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed bg-muted ">
							<User className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="flex min-w-0 flex-1 flex-col">
							<span className="font-semibold truncate">
								{profile.name?.trim() || "Account"}
							</span>
							<span className="truncate text-xs text-muted-foreground">
								{profile.email}
							</span>
						</div>
					</div>

					<Link href="/settings" onClick={() => setOpen(false)}>
						<Button
							variant="ghost"
							className="w-full justify-start gap-2 rounded-lg p-3"
						>
							<Settings className="mb-1 h-4 w-4 text-muted-foreground" />
							<span>Settings</span>
						</Button>
					</Link>

					{ownerShell ? (
						<Link href="/billing" onClick={() => setOpen(false)}>
							<Button
								variant="ghost"
								className="w-full justify-start gap-2 rounded-lg p-3"
							>
								<CreditCard className="mb-1 h-4 w-4 text-muted-foreground" />
								<span>Billing</span>
							</Button>
						</Link>
					) : null}

					<Button
						variant="ghost"
						className="w-full justify-start gap-2 rounded-lg p-3 text-destructive hover:text-destructive"
						onClick={logout}
					>
						<LogOut />
						<span className="font-medium">Sign Out</span>
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default MobileNavProfile;
