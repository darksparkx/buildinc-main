"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import {
	useNavigationShortcutsStore,
	type RecentShortcut,
	type ShortcutKind,
} from "@/lib/store/navigationShortcutsStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { cn } from "@/lib/functions/utils";
import { formatDistanceToNow } from "date-fns";
import {
	Building2,
	CheckSquare,
	ChevronRight,
	FolderOpen,
} from "lucide-react";
import Link from "next/link";

function kindIcon(kind: ShortcutKind) {
	switch (kind) {
		case "project":
			return FolderOpen;
		case "organisation":
			return Building2;
		case "task":
			return CheckSquare;
	}
}

function liveTitle(
	entry: RecentShortcut,
	projects: Record<string, { name?: string }>,
) {
	if (entry.kind === "project") {
		const n = projects[entry.id]?.name?.trim();
		return n || entry.title;
	}
	return entry.title;
}

export default function DashboardShortcuts() {
	const projectsRecord = useProjectStore((s) => s.projects);
	const recent = useNavigationShortcutsStore((s) => s.recent);

	return (
		<Card className="flex h-full flex-col border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl">Recent activity</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col pb-6">
				{recent.length === 0 ? (
					<p className="text-sm text-muted-foreground">No recent activity yet.</p>
				) : (
					<div className="h-36 min-h-0 flex-none overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
						<ul className="space-y-1">
						{recent.map((entry) => {
							const Icon = kindIcon(entry.kind);
							const title = liveTitle(entry, projectsRecord);
							return (
								<li key={`${entry.kind}-${entry.id}`}>
									<Link
										href={entry.href}
										className={cn(
											"flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
											"hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										)}
									>
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
											<Icon className="h-4 w-4" aria-hidden />
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate font-medium text-foreground">
												{title}
											</span>
											<span className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(entry.at), {
													addSuffix: true,
												})}
											</span>
										</span>
										<ChevronRight
											className="h-4 w-4 shrink-0 text-muted-foreground"
											aria-hidden
										/>
									</Link>
								</li>
							);
						})}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
