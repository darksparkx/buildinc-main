import React from "react";
import { UserButton } from "./UserButton";
import { CurrentPage } from "./CurrentPage";
import Link from "next/link";
import { IProfile } from "@/lib/types";
import { InboxBell } from "./InboxBell";

const TopBar = ({ profile }: { profile: IProfile | null }) => {
	return (
		<nav
			className={`${
				profile
					? "px-4 lg:hidden"
					: "min-w-screen px-6"
			} fixed top-0 right-0 z-50 flex h-16 w-full items-center justify-between border-b border-nav-chrome-border bg-nav-chrome py-2.5 shadow-[0_6px_20px_-8px_hsl(var(--primary)_/_0.14)] backdrop-blur-md dark:shadow-[0_8px_28px_-10px_hsl(0_0%_0%_/_0.55)]`}
		>
			{profile ? (
				<CurrentPage />
			) : (
				<div className="flex gap-5 items-center font-semibold md:text-xl h-full">
					<Link href={"/"}>BuildInc</Link>
				</div>
			)}
			<div className="flex items-center gap-2">
				{profile ? <InboxBell profile={profile} /> : null}
				<div className="hidden items-center gap-4 lg:flex">
					<UserButton profile={profile} />
				</div>
			</div>
		</nav>
	);
};

export default TopBar;
