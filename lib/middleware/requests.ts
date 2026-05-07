// lib/middleware/requests.ts
import { requestDB } from "@/lib/supabase/db/requestDB";
import { approvalStatus, IRequest, IRequestDB } from "../types";
import { useRequestStore } from "@/lib/store/requestStore";
import { getDetailsForRequest } from "../functions/requests";
import { toast } from "sonner";

export async function addRequest(request: IRequest): Promise<IRequest> {
	try {
		switch (request.type) {
			case "MaterialRequest":
				toast.info("Submitting material request...");
				break;
			case "PaymentRequest":
				toast.info("Submitting payment request...");
				break;
			case "TaskAssignment":
				toast.info("Submitting task assignment request...");
				break;
			case "TaskCompletion":
				toast.info("Submitting task completion request...");
				break;
			default:
				break;
		}
		// Convert IRequest to IRequestDB by extracting only the DB fields
		const requestData: IRequestDB = {
			// Prefer caller id so each submission is a distinct row (matches client UUID from tasks.ts)
			id: request.id ?? crypto.randomUUID(),
			created_at: request.created_at,
			projectId: request.projectId,
			phaseId: request.phaseId,
			taskId: request.taskId,
			materialId: request.materialId,
			requestedBy: request.requestedBy,
			requestedTo: request.requestedTo,
			approvedBy: request.approvedBy,
			type: request.type,
			status: request.status,
			requestData: request.requestData,
			approvedAt: request.approvedAt,
			notes: request.notes,
		};

		const result = await requestDB.addRequest(requestData);

		// Update store with the new request
		const store = useRequestStore.getState();
		store.addRequest({
			...result,
			// The related objects will be resolved when needed
		} as IRequest);

		switch (request.type) {
			case "MaterialRequest":
				toast.success("Material request submitted.");
				break;
			case "PaymentRequest":
				toast.success("Payment request submitted.");
				break;
			case "TaskAssignment":
				toast.success("Task assignment request submitted.");
				break;
			case "TaskCompletion":
				toast.success("Task completion submitted.");
				break;
			default:
				break;
		}

		return result as IRequest;
	} catch (error) {
		console.error("Error adding request1:", error);
		throw error;
		toast.error("Failed to submit request. Please try again.");
	}
}

export async function deleteRequest(id: string) {
	try {
		await requestDB.removeRequest(id);

		// Remove from store
		const store = useRequestStore.getState();
		store.deleteRequest(id);

		return { success: true, message: "Request deleted successfully" };
	} catch (error) {
		console.error("Error deleting request:", error);
		throw error;
	}
}

export async function updateRequest(
	id: string,
	updates: Partial<IRequest>
): Promise<IRequest> {
	try {
		switch (updates.status) {
			case "Approved":
				toast.info("Approving...");
				break;
			case "Rejected":
				toast.info("Rejecting...");
				break;
			default:
				break;
		}
		// Convert partial IRequest to partial IRequestDB
		const updateData: Partial<IRequestDB> = {};

		// Only include fields that exist in IRequestDB
		if (updates.status !== undefined) updateData.status = updates.status;
		if (updates.approvedBy !== undefined)
			updateData.approvedBy = updates.approvedBy;
		if (updates.approvedAt !== undefined)
			updateData.approvedAt = updates.approvedAt;
		if (updates.notes !== undefined) updateData.notes = updates.notes;
		if (updates.requestData !== undefined)
			updateData.requestData = updates.requestData;

		const result = await requestDB.updateRequest(id, updateData);

		// Update store
		const store = useRequestStore.getState();
		store.updateRequest(id, updateData);

		switch (updates.status) {
			case "Approved":
				toast.success("Request approved.");
				break;
			case "Rejected":
				toast.success("Request rejected.");
				break;
			default:
				break;
		}

		return result as IRequest;
	} catch (error) {
		console.error("Error updating request:", error);
		throw error;
		toast.error("Failed to update request. Please try again.");
	}
}

export async function getRequest(id: string): Promise<IRequest> {
	try {
		// First check if we have it in the store
		const store = useRequestStore.getState();
		const cachedRequest = store.getRequest(id);

		if (cachedRequest) {
			return cachedRequest;
		}

		// If not in store, fetch from DB
		const request = await requestDB.getRequest(id);

		// Add to store
		const requestWithDetails: IRequest = {
			...request,
			// The related objects will be resolved when needed
		};
		store.addRequest(requestWithDetails);

		return requestWithDetails;
	} catch (error) {
		console.error("Error getting request:", error);
		throw error;
	}
}

/**
 * Loads requests where the user is approver or requester (inbox + sent).
 * RLS may still return additional rows visible via project membership.
 */
export async function getRequestsByUserId(userId: string): Promise<IRequest[]> {
	try {
		const requests = await requestDB.getRequestsByUserId(userId);

		// Update store with the requests
		const store = useRequestStore.getState();
		const completedRequests: IRequest[] = requests.map(
			(request) => getDetailsForRequest(request) as IRequest
		);
		store.setRequests(completedRequests);

		return completedRequests;
	} catch (error) {
		console.error("Error getting requests by user ID:", error);
		throw error;
	}
}

export async function getProjectRequests(
	projectId: string
): Promise<IRequest[]> {
	try {
		const requests = await requestDB.getProjectRequests(projectId);

		// Update store with the requests
		const store = useRequestStore.getState();
		// Add to store (don't replace all requests, just add these)
		requests.forEach((request) => {
			store.addRequest(request as IRequest);
		});

		return requests as IRequest[];
	} catch (error) {
		console.error("Error getting project requests:", error);
		throw error;
	}
}

export async function getRequestsByStatus(
	status: approvalStatus
): Promise<IRequest[]> {
	try {
		const requests = await requestDB.getRequestsByStatus(status);

		// Update store with the requests
		const store = useRequestStore.getState();
		// Add to store (don't replace all requests, just add these)
		requests.forEach((request) => {
			store.addRequest(request as IRequest);
		});

		return requests as IRequest[];
	} catch (error) {
		console.error("Error getting requests by status:", error);
		throw error;
	}
}
