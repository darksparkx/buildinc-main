import { taskCommentDB } from "@/lib/supabase/db/taskCommentDB";
import { commentMentionNotificationDB } from "@/lib/supabase/db/commentMentionNotificationDB";
import { IProjectProfile, ITaskCommentDB } from "@/lib/types";

/** Handles match full name (no spaces in @token) or a single word that matches a name part. */
function mentionUserIdsFromBody(
	body: string,
	members: Pick<IProjectProfile, "id" | "name">[],
): string[] {
	const handles =
		body.match(/@([^\s@]+)/gu)?.map((m) => m.slice(1).toLowerCase()) ?? [];
	const ids = new Set<string>();
	for (const h of handles) {
		const compact = h.replace(/\s+/g, "");
		for (const m of members) {
			const nameLower = m.name.trim().toLowerCase();
			const nameCompact = nameLower.replace(/\s+/g, "");
			if (
				nameCompact === compact ||
				nameLower.split(/\s+/).some((part) => part === h)
			) {
				ids.add(m.id);
			}
		}
	}
	return [...ids];
}

export function parseMentionUserIds(
	body: string,
	members: IProjectProfile[],
): string[] {
	return mentionUserIdsFromBody(
		body,
		members.map((m) => ({ id: m.id, name: m.name })),
	);
}

export async function listTaskComments(taskId: string): Promise<ITaskCommentDB[]> {
	return taskCommentDB.listByTask(taskId);
}

export async function addTaskCommentWithMentions(
	taskId: string,
	authorId: string,
	body: string,
	members: IProjectProfile[],
): Promise<ITaskCommentDB> {
	const mentionUserIds = parseMentionUserIds(body, members).filter(
		(id) => id !== authorId,
	);

	const comment = await taskCommentDB.insert({
		taskId,
		authorId,
		body: body.trim(),
		mentionUserIds,
	});

	for (const recipientId of mentionUserIds) {
		try {
			await commentMentionNotificationDB.insert({
				recipientId,
				actorId: authorId,
				taskId,
				commentId: comment.id,
			});
		} catch (e) {
			console.error("[taskComments] mention notification failed:", e);
		}
	}

	return comment;
}
