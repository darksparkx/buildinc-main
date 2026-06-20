// lib/supabase/db/taskDB.ts
import { createClient } from "@/lib/supabase/client";
import { serializeRowForInsert } from "@/lib/supabase/insertSerialize";
import { ITaskDB } from "../../types";

const supabase = createClient();

export const taskDB = {
	// Gets tasks for a phase
	async getPhaseTasks(phaseId: string) {
		const { data, error } = await supabase
			.from("tasks_app")
			.select("*")
			.eq("phaseId", phaseId)
			.order("order", { ascending: true });

		if (error) throw error;
		return data as ITaskDB[];
	},

	// Gets tasks assigned to a user
	async getUserTasks(userId: string) {
		const { data, error } = await supabase
			.from("tasks_app")
			.select("*")
			.eq("assignedTo", userId);

		if (error) throw error;
		return data as ITaskDB[];
	},

	// Gets a single task by its ID
	async getTask(id: string) {
		const { data, error } = await supabase
			.from("tasks_app")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data as ITaskDB;
	},

	// Adds a new task
	async addTask(task: ITaskDB) {
		const { data, error } = await supabase
			.from("tasks")
			.insert([serializeRowForInsert(task as unknown as Record<string, unknown>)])
			.select()
			.single();

		if (error) throw error;
		return data as ITaskDB;
	},

	// Updates a task by its ID
	async updateTask(id: string, updates: Partial<ITaskDB>) {
		const { data, error } = await supabase
			.from("tasks")
			.update(updates)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data as ITaskDB;
	},

	// Deletes a task by its ID
	async removeTask(id: string) {
		try {
			await supabase.from("tasks").delete().eq("id", id).throwOnError();
		} catch (error) {
			// console.log("error", error);
		}
	},

	// Updates task order
	async updateTaskOrder(tasks: { id: string; order: number }[]) {
		const { error } = await supabase.from("tasks").upsert(tasks);

		if (error) throw error;
		return { success: true };
	},
};
