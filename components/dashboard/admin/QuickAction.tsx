import { Button } from "@/components/base/ui/button";
import { Package } from "lucide-react";
import React from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import Link from "next/link";

const QuickAction = () => {
	return (
		<Card className="flex h-full flex-col border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl">Quick actions</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col pb-6">
				<div className="grid grid-cols-1 gap-3 sm:max-w-lg">
					<Button
						asChild
						size="lg"
						variant="outline"
						className="h-auto min-h-[4.5rem] w-full flex-col gap-2 border-border/60 bg-background/60 py-4 text-center shadow-none transition-colors hover:bg-primary/5"
					>
						<Link
							href="/projects/create-project"
							className="flex flex-col items-center justify-center gap-2"
						>
							<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
								<Package className="h-5 w-5" aria-hidden />
							</span>
							<span className="text-sm font-medium leading-snug">
								Create new project
							</span>
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default QuickAction;
