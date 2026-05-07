import { createClient } from "@/lib/supabase/client";
import { serializeRowForInsert } from "@/lib/supabase/insertSerialize";
import { ITaskCommentDB } from "@/lib/types";

const supabase = createClient();

export const taskCommentDB = {
	async listByTask(taskId: string): Promise<ITaskCommentDB[]> {
		const { data, error } = await supabase
			.from("task_comments")
			.select("*")
			.eq("taskId", taskId)
			.order("created_at", { ascending: true });

		if (error) throw error;
		return (data ?? []) as ITaskCommentDB[];
	},

	async insert(
		row: Pick<ITaskCommentDB, "taskId" | "authorId" | "body" | "mentionUserIds">,
	): Promise<ITaskCommentDB> {
		const { data, error } = await supabase
			.from("task_comments")
			.insert([
				serializeRowForInsert({
					...row,
					mentionUserIds: row.mentionUserIds ?? [],
				} as unknown as Record<string, unknown>),
			])
			.select()
			.single();

		if (error) throw error;
		return data as ITaskCommentDB;
	},
};
