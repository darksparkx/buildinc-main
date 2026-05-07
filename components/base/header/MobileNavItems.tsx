"use client";
import { navItems } from "@/lib/constants/navitems";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import MobileNavProfile from "./MobileNavProfile";
import { IProfile } from "@/lib/types";

const MobileNavItems = ({ profile }: { profile: IProfile }) => {
	const pathname = usePathname();
	const ownerShell = useUsesOwnerShell(profile);

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-nav-chrome-border bg-nav-chrome p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_-12px_hsl(var(--primary)_/_0.12)] backdrop-blur-md dark:shadow-[0_-10px_32px_-14px_hsl(0_0%_0%_/_0.5)] lg:hidden">
			{navItems.map((item) => {
				const isActive = pathname === item.href;
				if (!item.mobile) return null;
				if (
					(item.admin && ownerShell) ||
					(item.user && !ownerShell)
				) {
					if (item.label === "Profile") {
						return (
							<MobileNavProfile
								profile={profile}
								key={item.href}
							/>
						);
					} else {
						return (
							<Link key={item.href} href={item.href}>
								<item.icon
									className={clsx(
										"h-8 w-8 rounded-full p-2 transition-colors",
										isActive
											? "bg-secondary text-secondary-foreground shadow-sm ring-1 ring-secondary/40"
											: "text-muted-foreground hover:bg-primary/15 hover:text-foreground dark:hover:bg-primary/20",
									)}
								/>
							</Link>
						);
					}
				}
			})}
		</div>
	);
};

export default MobileNavItems;
