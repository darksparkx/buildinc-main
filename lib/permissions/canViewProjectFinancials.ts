import { getOrganisationMembersFromStore } from "@/lib/middleware/organisationMembers";
import { getProjectMembersByProjectIdFromStore } from "@/lib/middleware/projectMembers";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import type { IProject } from "@/lib/types";

/**
 * P4.8 — budget, spend, ₹/sqft, and building-spec financials.
 * Project/org owners and org Admins always see financials.
 * Other project members only when `memberInfo.canSeeBudget` is true.
 */
export function canViewProjectFinancials(
	profileId: string | undefined,
	project: Pick<IProject, "id" | "owner" | "orgId">,
): boolean {
	if (!profileId) return false;
	if (project.owner === profileId) return true;

	if (project.orgId) {
		const org = useOrganisationStore.getState().organisations[project.orgId];
		if (org?.owner === profileId) return true;

		const orgMembers = getOrganisationMembersFromStore(project.orgId);
		const onOrg = orgMembers.find((m) => m.id === profileId);
		if (onOrg?.memberInfo?.role === "Admin") return true;
	}

	const projectMembers = getProjectMembersByProjectIdFromStore(project.id);
	const onProject = projectMembers.find((m) => m.id === profileId);
	return onProject?.memberInfo?.canSeeBudget === true;
}
