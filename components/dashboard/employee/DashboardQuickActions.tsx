import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { CheckSquare, Package, CreditCard, AlertCircle } from "lucide-react";

const actionItems = [
	{
		label: "View tasks",
		icon: CheckSquare,
		accent: "primary" as const,
	},
	{
		label: "Log materials",
		icon: Package,
		accent: "secondary" as const,
	},
	{
		label: "Log payment",
		icon: CreditCard,
		accent: "emerald" as const,
	},
	{
		label: "Report issue",
		icon: AlertCircle,
		accent: "amber" as const,
	},
];

const accentRing: Record<
	(typeof actionItems)[number]["accent"],
	string
> = {
	primary: "bg-primary/15 text-primary ring-primary/20",
	secondary: "bg-secondary/15 text-secondary ring-secondary/25",
	emerald:
		"bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
	amber: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-400",
};

const DashboardQuickActions = () => {
	return (
		<Card className="flex h-full flex-col border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl">Quick actions</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col pb-6">
				<div className="grid grid-cols-2 gap-3">
					{actionItems.map(({ label, icon: Icon, accent }) => (
						<Button
							key={label}
							type="button"
							size="lg"
							variant="outline"
							className="h-auto min-h-[4.5rem] flex-col gap-2 border-border/60 bg-background/60 py-4 shadow-none transition-colors hover:bg-primary/5"
						>
							<span
								className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accentRing[accent]}`}
							>
								<Icon className="h-5 w-5" aria-hidden />
							</span>
							<span className="text-center text-sm font-medium leading-snug">
								{label}
							</span>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default DashboardQuickActions;
