import { commentMentionNotificationDB } from "@/lib/supabase/db/commentMentionNotificationDB";
import { ICommentMentionNotificationDB } from "@/lib/types";

export async function getUnreadMentionNotificationCount(
	userId: string,
): Promise<number> {
	return commentMentionNotificationDB.countUnread(userId);
}

export async function listUnreadMentionNotifications(
	userId: string,
): Promise<ICommentMentionNotificationDB[]> {
	return commentMentionNotificationDB.listUnread(userId);
}

export async function markMentionNotificationsReadForTask(
	recipientId: string,
	taskId: string,
): Promise<void> {
	await commentMentionNotificationDB.markReadForTask(recipientId, taskId);
}

export async function markMentionNotificationRead(
	id: string,
	recipientId: string,
): Promise<void> {
	await commentMentionNotificationDB.markRead(id, recipientId);
}
