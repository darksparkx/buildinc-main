"use client";
import React from "react";
import Link from "next/link";
import SideBarItems from "./SideBarItems";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { IProfile } from "@/lib/types";
import { LogOutIcon, User } from "lucide-react";
import { logout } from "./UserDropdown";

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
			<aside className="fixed top-0 left-0 right-0 hidden lg:flex lg:flex-col w-60 z-40 bg-background h-screen border-r border-primary/10 justify-between">
				<div>
					<div className="p-4 flex items-center space-x-3 border-b py-8">
						<div className="flex gap-5 items-center font-semibold text-xl">
							<Link href={"/"}>BuildInc</Link>
						</div>
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

				<div className="flex items-center gap-3 mb-4 text-sm border-t border-primary/20 pt-5">
					<div className="bg-card/60 rounded-full w-10 h-10 flex items-center justify-center ml-2">
						<User className=" w-5 h-5 text-muted-foreground" />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold truncate">
							{profile?.name}
						</span>
						<span className="text-xs text-muted-foreground">
							{ownerShell ? "Admin" : "User"}
						</span>
					</div>
				</div>
			</aside>
		</div>
	);
};

export default SideBar;
