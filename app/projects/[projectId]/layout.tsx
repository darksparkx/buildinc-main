import type { Metadata } from "next";
import type { ReactNode } from "react";
import { projectPageTitle } from "@/lib/metadata/entityPageTitle";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
	const { projectId } = await params;
	const title = await projectPageTitle(projectId);
	return { title };
}

export default function ProjectDetailLayout({
	children,
}: {
	children: ReactNode;
}) {
	return children;
}
