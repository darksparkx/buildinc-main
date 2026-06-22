import { membershipNotificationDB } from "@/lib/supabase/db/membershipNotificationDB";
import { useProfileStore } from "@/lib/store/profileStore";
import { IMembershipNotificationDB } from "@/lib/types";

export async function getUnreadMembershipNotificationCount(
	userId: string,
): Promise<number> {
	return membershipNotificationDB.countUnread(userId);
}

export async function listUnreadMembershipNotifications(
	userId: string,
): Promise<IMembershipNotificationDB[]> {
	const rows = await membershipNotificationDB.listUnread(userId);
	return rows as IMembershipNotificationDB[];
}

export async function markMembershipNotificationRead(
	id: string,
	recipientId: string,
): Promise<void> {
	await membershipNotificationDB.markRead(id, recipientId);
}

export function membershipNotificationTitle(
	notification: IMembershipNotificationDB,
): string {
	if (notification.kind === "removed_from_organisation") {
		return `Removed from ${notification.entityName}`;
	}
	return `Removed from ${notification.entityName}`;
}

export function membershipNotificationSubtitle(
	notification: IMembershipNotificationDB,
	actorName: string,
): string {
	if (notification.kind === "removed_from_organisation") {
		return `${actorName} removed you from this organisation`;
	}
	return `${actorName} removed you from this project`;
}

export async function notifyRemovedFromOrganisation({
	recipientId,
	orgId,
	orgName,
}: {
	recipientId: string;
	orgId: string;
	orgName: string;
}): Promise<void> {
	const actorId = useProfileStore.getState().profile?.id;
	if (!actorId || actorId === recipientId) return;

	try {
		await membershipNotificationDB.notifyRemovedFromOrganisation({
			recipientId,
			actorId,
			orgId,
			orgName,
		});
	} catch (error) {
		console.warn("[membershipNotifications] org removal notify failed:", error);
	}
}

export async function notifyRemovedFromProject({
	recipientId,
	projectId,
	projectName,
}: {
	recipientId: string;
	projectId: string;
	projectName: string;
}): Promise<void> {
	const actorId = useProfileStore.getState().profile?.id;
	if (!actorId || actorId === recipientId) return;

	try {
		await membershipNotificationDB.notifyRemovedFromProject({
			recipientId,
			actorId,
			projectId,
			projectName,
		});
	} catch (error) {
		console.warn(
			"[membershipNotifications] project removal notify failed:",
			error,
		);
	}
}
