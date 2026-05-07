import { createClient } from "@/lib/supabase/client";
import { serializeRowForInsert } from "@/lib/supabase/insertSerialize";
import { ICommentMentionNotificationDB } from "@/lib/types";

const supabase = createClient();

export const commentMentionNotificationDB = {
	async countUnread(recipientId: string): Promise<number> {
		const { count, error } = await supabase
			.from("comment_mention_notifications")
			.select("*", { count: "exact", head: true })
			.eq("recipientId", recipientId)
			.is("readAt", null);

		if (error) throw error;
		return count ?? 0;
	},

	async listUnread(
		recipientId: string,
	): Promise<ICommentMentionNotificationDB[]> {
		const { data, error } = await supabase
			.from("comment_mention_notifications")
			.select("*")
			.eq("recipientId", recipientId)
			.is("readAt", null)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return (data ?? []) as ICommentMentionNotificationDB[];
	},

	async insert(
		row: Pick<
			ICommentMentionNotificationDB,
			"recipientId" | "actorId" | "taskId" | "commentId"
		>,
	): Promise<ICommentMentionNotificationDB> {
		const { data, error } = await supabase
			.from("comment_mention_notifications")
			.insert([
				serializeRowForInsert(row as unknown as Record<string, unknown>),
			])
			.select()
			.single();

		if (error) throw error;
		return data as ICommentMentionNotificationDB;
	},

	async markReadForTask(recipientId: string, taskId: string): Promise<void> {
		const { error } = await supabase
			.from("comment_mention_notifications")
			.update({ readAt: new Date().toISOString() })
			.eq("recipientId", recipientId)
			.eq("taskId", taskId)
			.is("readAt", null);

		if (error) throw error;
	},

	async markRead(id: string, recipientId: string): Promise<void> {
		const { error } = await supabase
			.from("comment_mention_notifications")
			.update({ readAt: new Date().toISOString() })
			.eq("id", id)
			.eq("recipientId", recipientId);

		if (error) throw error;
	},
};
