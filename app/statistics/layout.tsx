import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Statistics",
};

export default function StatisticsLayout({ children }: { children: ReactNode }) {
	return children;
}
