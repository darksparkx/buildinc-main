"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/base/ui/button";
import clsx from "clsx";
import { navItems } from "@/lib/constants/navitems";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import React from "react";
import { IProfile } from "@/lib/types";

const SideBarItems = ({ profile }: { profile: IProfile }) => {
	const pathname = usePathname();
	const ownerShell = useUsesOwnerShell(profile);
	return (
		<div>
			{navItems.map((item) => {
				const isActive = pathname === item.href;
				if (!item.sidebar) return null;
				if (
					(item.admin && ownerShell) ||
					(item.user && !ownerShell)
				) {
					return (
						<Link
							key={item.href}
							href={item.href}
							className="w-full"
						>
							<Button
								variant="ghost"
								className={clsx(
									"w-full rounded-none px-4 py-7 justify-start text-left font-normal",
									isActive &&
										"bg-secondary font-semibold text-secondary-foreground ring-1 ring-border/50 hover:brightness-110 dark:ring-border",
								)}
							>
								<item.icon className="mr-2 h-5 w-5" />
								{item.label}
							</Button>
						</Link>
					);
				}
			})}
		</div>
	);
};

export default SideBarItems;
