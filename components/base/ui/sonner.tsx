"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
	return (
		<Sonner
			position="top-right"
			theme="system"
			richColors={false}
			closeButton
			toastOptions={{
				duration: 4500,
				classNames: {
					toast:
						"group border shadow-md backdrop-blur-sm [&_[data-icon]]:shrink-0",
					title: "font-semibold",
					description: "text-[1.05rem] opacity-90",
					success:
						"border-emerald-300/80 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/55 dark:text-emerald-50",
					error:
						"border-red-300/80 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950/55 dark:text-red-50",
					info: "border-sky-300/80 bg-sky-50 text-sky-950 dark:border-sky-700 dark:bg-sky-950/55 dark:text-sky-50",
					warning:
						"border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/55 dark:text-amber-50",
					loading:
						"border-border bg-muted/90 text-foreground dark:bg-muted",
					default:
						"border-border bg-card text-card-foreground dark:bg-card",
				},
			}}
		/>
	);
}
