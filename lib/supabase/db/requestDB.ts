// lib/supabase/db/requestDB.ts
import { createClient } from "@/lib/supabase/client";
import { approvalStatus, IRequestDB } from "../../types";

const supabase = createClient();

export const requestDB = {
	/** Inbox + approvals: rows where the user is the approver or the requester */
	async getRequestsByUserId(userId: string) {
		const { data, error } = await supabase
			.from("requests")
			.select("*")
			.or(`requestedTo.eq.${userId},requestedBy.eq.${userId}`)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data as IRequestDB[];
	},

	// Gets requests for a specific project
	async getProjectRequests(projectId: string) {
		const { data, error } = await supabase
			.from("requests")
			.select("*")
			.eq("projectId", projectId)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data as IRequestDB[];
	},

	// Gets a single request by ID
	async getRequest(id: string) {
		const { data, error } = await supabase
			.from("requests")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data as IRequestDB;
	},

	// Adds a new request
	async addRequest(request: IRequestDB) {
		const { data, error } = await supabase
			.from("requests")
			.insert(request)
			.select()
			.single();

		if (error) throw error;
		return data as IRequestDB;
	},

	// Updates a request by ID
	async updateRequest(id: string, updates: Partial<IRequestDB>) {
		const { data, error } = await supabase
			.from("requests")
			.update(updates)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data as IRequestDB;
	},

	// Deletes a request by ID
	async removeRequest(id: string) {
		try {
			await supabase
				.from("requests")
				.delete()
				.eq("id", id)
				.throwOnError();
		} catch (error) {
			// console.log("error", error);
		}
	},

	// Gets requests by status
	async getRequestsByStatus(status: approvalStatus) {
		const { data, error } = await supabase
			.from("requests")
			.select("*")
			.eq("status", status)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data as IRequestDB[];
	},
};
