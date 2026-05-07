"use client";
import React from "react";
import Link from "next/link";
import SideBarItems from "./SideBarItems";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { IProfile } from "@/lib/types";
import { LogOutIcon, User } from "lucide-react";
import { logout } from "./UserDropdown";
import { InboxBell } from "./InboxBell";

const SideBar = ({ profile }: { profile: IProfile | null }) => {
	const ownerShell = useUsesOwnerShell(profile);
	if (!profile) {
		// redirect and don't render until profile exists
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	return (
		<div className="flex ">
			<aside className="fixed top-0 left-0 right-0 hidden lg:flex lg:flex-col w-60 z-40 h-screen justify-between border-r border-nav-chrome-border bg-nav-chrome shadow-[4px_0_28px_-14px_hsl(var(--primary)_/_0.12)] dark:shadow-[4px_0_28px_-14px_hsl(0_0%_0%_/_0.45)]">
				<div>
					<div className="flex items-center justify-between gap-2 border-b border-nav-chrome-border px-4 py-8">
						<div className="flex min-w-0 items-center gap-5 font-semibold text-xl">
							<Link href={"/"}>BuildInc</Link>
						</div>
						<InboxBell profile={profile} />
					</div>
					<div className="mt-4">
						<SideBarItems profile={profile} />
					</div>
					<div
						onClick={logout}
						className="flex items-center gap-2 px-3 py-4 cursor-pointer hover:bg-destructive/10 text-destructive text-sm"
					>
						<LogOutIcon className="w-4 h-4 ml-1" />
						<span className="font-medium ml-2 text-sm">
							Sign Out
						</span>
					</div>
				</div>

				<div className="flex items-center gap-3 mb-4 border-t border-nav-chrome-border pt-5 text-sm">
					<div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/25 dark:bg-primary/15 dark:ring-primary/20">
						<User className=" w-5 h-5 text-muted-foreground" />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold truncate">
							{profile?.name}
						</span>
						<span className="text-xs text-muted-foreground">
							{ownerShell ? "Admin" : "Member"}
						</span>
					</div>
				</div>
			</aside>
		</div>
	);
};

export default SideBar;
