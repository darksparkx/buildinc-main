import { formatFriendlyDate } from "@/lib/functions/formatCalendarDate";
import DashboardShortcuts from "../DashboardShortcuts";
import ActiveProjects from "./ActiveProjects";
import QuickAction from "./QuickAction";
import Summary from "./Summary";

export default function A_Dashboard() {
	const today = formatFriendlyDate(new Date());

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-1">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h1 className="hidden text-2xl font-semibold tracking-tight lg:block lg:text-3xl">
								Dashboard
							</h1>
							<p className="max-w-xl text-sm text-muted-foreground lg:mt-1 lg:text-base">
								Overview of projects and organisations at a glance.
							</p>
						</div>
						<p
							className="text-sm text-muted-foreground"
							suppressHydrationWarning
						>
							{today}
						</p>
					</div>
				</header>

				<Summary />
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
					<QuickAction />
					<DashboardShortcuts />
				</div>
				<ActiveProjects />
			</div>
		</div>
	);
}
