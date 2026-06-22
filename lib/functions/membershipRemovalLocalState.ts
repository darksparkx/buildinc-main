import { useOrganisationMemberStore } from "@/lib/store/organisationMemberStore";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useProjectMemberStore } from "@/lib/store/projectMemberStore";
import { useProjectStore } from "@/lib/store/projectStore";
import type { IMembershipNotificationDB } from "@/lib/types";

/** Drop org membership from local stores for the signed-in user. */
export function applyRemovedFromOrganisationLocally(orgId: string): void {
	const profileId = useProfileStore.getState().profile?.id;
	if (!profileId) return;

	useOrganisationMemberStore
		.getState()
		.removeOrganisationMember(orgId, profileId);
	useOrganisationStore.getState().deleteOrganisation(orgId);
}

/** Drop project membership from local stores for the signed-in user. */
export function applyRemovedFromProjectLocally(projectId: string): void {
	const profileId = useProfileStore.getState().profile?.id;
	if (!profileId) return;

	useProjectMemberStore
		.getState()
		.removeProjectMember(projectId, profileId);
	useProjectStore.getState().deleteProject(projectId);
}

export function applyMembershipRemovalFromNotification(
	notification: IMembershipNotificationDB,
): void {
	if (notification.kind === "removed_from_organisation" && notification.orgId) {
		applyRemovedFromOrganisationLocally(notification.orgId);
		return;
	}
	if (notification.kind === "removed_from_project" && notification.projectId) {
		applyRemovedFromProjectLocally(notification.projectId);
	}
}
