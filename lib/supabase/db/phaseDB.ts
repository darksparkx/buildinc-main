// lib/supabase/db/phaseDB.ts
import { createClient } from "@/lib/supabase/client";
import { serializeRowForInsert } from "@/lib/supabase/insertSerialize";
import { IPhaseDB } from "../../types";

const supabase = createClient();

export const phaseDB = {
	// Gets phases for a project
	async getProjectPhases(projectId: string) {
		const { data, error } = await supabase
			.from("phases_app")
			.select("*")
			.eq("projectId", projectId)
			.order("order", { ascending: true });

		if (error) throw error;
		return data as IPhaseDB[];
	},

	// Gets a single phase by its ID
	async getPhase(id: string) {
		const { data, error } = await supabase
			.from("phases_app")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data as IPhaseDB;
	},

	// Adds a new phase
	async addPhase(phase: IPhaseDB) {
		const { data, error } = await supabase
			.from("phases")
			.insert([serializeRowForInsert(phase as unknown as Record<string, unknown>)])
			.select()
			.single();

		if (error) throw error;
		return data as IPhaseDB;
	},

	// Updates a phase by its ID
	async updatePhase(id: string, updates: Partial<IPhaseDB>) {
		const { data, error } = await supabase
			.from("phases")
			.update(updates)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data as IPhaseDB;
	},

	// Deletes a phase by its ID
	async removePhase(id: string) {
		try {
			await supabase.from("phases").delete().eq("id", id).throwOnError();
		} catch (error) {
			// console.log("error", error);
		}
	},

	// Updates phase order
	async updatePhaseOrder(phases: { id: string; order: number }[]) {
		const { error } = await supabase.from("phases").upsert(phases);

		if (error) throw error;
		return { success: true };
	},
};
