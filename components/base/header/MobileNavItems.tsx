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
		<div className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-primary/10 bg-background p-2 lg:hidden ">
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
										"h-8 w-8 rounded-full p-2",
										isActive
											? "bg-secondary text-secondary-foreground"
											: "text-muted-foreground",
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
