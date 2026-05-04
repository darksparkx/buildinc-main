"use client";
import { createClient } from "@/lib/supabase/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { LogOutIcon, User } from "lucide-react";
import { Button } from "../ui/button";
import { IProfile } from "@/lib/types";
import { ClearData } from "@/lib/functions/utils";

export const logout = async () => {
	const supabase = createClient();
	try {
		await supabase.auth.signOut();
		ClearData();
	} catch (error) {
		console.error("Error signing out:", error);
	} finally {
		window.location.href = "/";
	}
};

const UserDropdown = ({ profile }: { profile: IProfile }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="default"
					size="icon"
					className="mt-0 rounded-full "
				>
					<User className="w-4 h-4 text-button-primary-foreground" />
				</Button>
			</DropdownMenuTrigger>

			{/* Fixed Content with Theme Variables */}
			<DropdownMenuContent
				className="w-64 rounded-xl p-2 shadow-lg border border-border bg-card text-card-foreground mt-3"
				align="end"
			>
				<DropdownMenuLabel className="p-3">
					<div className="flex items-center gap-3">
						<div className="bg-muted border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
							<User className="w-5 h-5 text-muted-foreground" />
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
				</DropdownMenuLabel>

				<DropdownMenuSeparator className="bg-border" />

				<Link href="/settings">
					<DropdownMenuItem className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors">
						<User className="w-4 h-4 text-muted-foreground mb-1" />
						<span>Settings</span>
					</DropdownMenuItem>
				</Link>

				<DropdownMenuSeparator className="bg-border" />

				<DropdownMenuItem
					onClick={logout}
					className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-destructive/10 text-destructive transition-colors"
				>
					<LogOutIcon />
					<span className="font-medium">Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserDropdown;
