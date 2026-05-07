"use client";
import { navItems } from "@/lib/constants/navitems";
import { usePathname } from "next/navigation";
import { useOrganisationDetailStore } from "@/lib/store/organisationDetailStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useprojectDetailStore } from "@/lib/store/projectDetailStore";

export function CurrentPage() {
	const pathname = usePathname();
	const organisation = useOrganisationDetailStore((s) => s.organisation);
	const project = useprojectDetailStore((s) => s.project);
	const tasks = useTaskStore((s) => s.tasks);

	const orgDetailMatch = pathname.match(/^\/organisations\/([^/]+)$/);
	if (orgDetailMatch) {
		const title = organisation?.name?.trim() || "Organisation";
		return (
			<div className="min-w-0 max-w-[min(100%,18rem)] sm:max-w-md">
				<p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground leading-none sm:text-xs">
					Organisations
				</p>
				<h2
					className="truncate text-base font-bold leading-tight md:text-lg"
					title={title}
				>
					{title}
				</h2>
			</div>
		);
	}

	const taskDetailMatch = pathname.match(/^\/tasks\/([^/]+)$/);
	if (taskDetailMatch?.[1]) {
		const t = tasks[taskDetailMatch[1]];
		const title = t?.name?.trim() || "Task";
		return (
			<div className="min-w-0 max-w-[min(100%,18rem)] sm:max-w-md">
				<p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground leading-none sm:text-xs">
					Tasks
				</p>
				<h2
					className="truncate text-base font-bold leading-tight md:text-lg"
					title={title}
				>
					{title}
				</h2>
			</div>
		);
	}

	const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
	if (
		projectMatch &&
		projectMatch[1] !== "create-project"
	) {
		const title = project?.name?.trim() || "Project";
		return (
			<div className="min-w-0 max-w-[min(100%,18rem)] sm:max-w-md">
				<p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground leading-none sm:text-xs">
					Projects
				</p>
				<h2
					className="truncate text-base font-bold leading-tight md:text-lg"
					title={title}
				>
					{title}
				</h2>
			</div>
		);
	}

	const currentPage =
		navItems.find((item) => item.href === pathname)?.label ?? "";
	return (
		<h2 className="text-md font-bold md:text-lg">{currentPage}</h2>
	);
}
