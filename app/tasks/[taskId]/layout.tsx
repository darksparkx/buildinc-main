import type { Metadata } from "next";
import type { ReactNode } from "react";
import { taskPageTitle } from "@/lib/metadata/entityPageTitle";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ taskId: string }>;
}): Promise<Metadata> {
	const { taskId } = await params;
	const title = await taskPageTitle(taskId);
	return { title };
}

export default function TaskDetailLayout({ children }: { children: ReactNode }) {
	return children;
}
