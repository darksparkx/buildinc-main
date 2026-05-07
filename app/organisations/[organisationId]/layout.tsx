import type { Metadata } from "next";
import type { ReactNode } from "react";
import { organisationPageTitle } from "@/lib/metadata/entityPageTitle";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organisationId: string }>;
}): Promise<Metadata> {
	const { organisationId } = await params;
	const title = await organisationPageTitle(organisationId);
	return { title };
}

export default function OrganisationDetailLayout({
	children,
}: {
	children: ReactNode;
}) {
	return children;
}
