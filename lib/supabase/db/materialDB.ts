// lib/supabase/db/materialDB.ts
import { createClient } from "@/lib/supabase/client";
import { IMaterialDB } from "../../types";

const supabase = createClient();

export const materialDB = {
	// Gets materials for a task
	async getTaskMaterials(taskId: string) {
		const { data, error } = await supabase
			.from("materials_app")
			.select("*")
			.eq("taskId", taskId);

		if (error) throw error;
		return data as IMaterialDB[];
	},

	// Gets a single material by its ID
	async getMaterial(id: string) {
		const { data, error } = await supabase
			.from("materials_app")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data as IMaterialDB;
	},

	// Gets materials by their IDs
	async getMaterialsById(ids: string[]) {
		const { data, error } = await supabase
			.from("materials_app")
			.select("*")
			.in("id", ids);

		if (error) throw error;
		return data as IMaterialDB[];
	},

	// Adds a new material
	async addMaterial(material: IMaterialDB) {
		const { data, error } = await supabase
			.from("materials")
			.insert([material])
			.select()
			.single();

		if (error) throw error;
		return data as IMaterialDB;
	},

	// Updates a material by its ID
	async updateMaterial(id: string, updates: Partial<IMaterialDB>) {
		const { data, error } = await supabase
			.from("materials")
			.update(updates)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data as IMaterialDB;
	},

	// Deletes a material by its ID
	async removeMaterial(id: string) {
		try {
			await supabase
				.from("materials")
				.delete()
				.eq("id", id)
				.throwOnError();
		} catch (error) {
			// console.log("error", error);
		}
	},

	// Bulk update materials
	async updateMaterials(
		updates: { id: string; updates: Partial<IMaterialDB> }[]
	) {
		const { error } = await supabase
			.from("materials")
			.upsert(updates.map(({ id, updates }) => ({ id, ...updates })));

		if (error) throw error;
		return { success: true };
	},
};
