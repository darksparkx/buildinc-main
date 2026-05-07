"use client";

import Link from "next/link";

const linkClass =
	"font-medium text-white underline underline-offset-2 hover:text-white";

/** Secondary navigation when the user is signed in (404 / error recovery). */
export function WorkspaceQuickLinks() {
	return (
		<nav
			className="flex flex-col gap-2 border-t border-white/15 pt-3 text-sm text-white/85"
			aria-label="Workspace shortcuts"
		>
			<Link href="/dashboard" className={linkClass}>
				Dashboard
			</Link>
			<Link href="/organisations" className={linkClass}>
				Organisations
			</Link>
			<Link href="/projects" className={linkClass}>
				Projects
			</Link>
			<Link href="/tasks" className={linkClass}>
				Tasks
			</Link>
		</nav>
	);
}
