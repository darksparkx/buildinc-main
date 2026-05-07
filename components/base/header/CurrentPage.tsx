"use client";
import { navItems } from "@/lib/constants/navitems";
import { usePathname } from "next/navigation";
import { useOrganisationDetailStore } from "@/lib/store/organisationDetailStore";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useprojectDetailStore } from "@/lib/store/projectDetailStore";

export function CurrentPage() {
	const pathname = usePathname();
	const organisation = useOrganisationDetailStore((s) => s.organisation);
	const project = useprojectDetailStore((s) => s.project);

	const orgDetailMatch = pathname.match(/^\/organisations\/([^/]+)$/);
	const taskDetailMatch = pathname.match(/^\/tasks\/([^/]+)$/);
	const taskIdFromPath = taskDetailMatch?.[1];

	const taskForHeader = useTaskStore((s) =>
		taskIdFromPath ? s.tasks[taskIdFromPath] : undefined,
	);
	const phaseLabel = usePhaseStore((s) => {
		const pid = taskForHeader?.phaseId;
		if (!pid) return "";
		return s.phases[pid]?.name?.trim() ?? "";
	});

	const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);

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

	if (taskDetailMatch?.[1]) {
		const t = taskForHeader;
		const title = t?.name?.trim() || "Task";
		const projectLine = t?.projectName?.trim();
		const trail = [projectLine, phaseLabel || undefined]
			.filter(Boolean)
			.join(" · ");
		return (
			<div className="min-w-0 max-w-[min(100%,18rem)] sm:max-w-md">
				{trail ? (
					<p
						className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
						title={trail}
					>
						{trail}
					</p>
				) : (
					<p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground leading-none sm:text-xs">
						Tasks
					</p>
				)}
				<h2
					className="truncate text-base font-bold leading-tight md:text-lg"
					title={title}
				>
					{title}
				</h2>
			</div>
		);
	}

	if (projectMatch && projectMatch[1] !== "create-project") {
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
