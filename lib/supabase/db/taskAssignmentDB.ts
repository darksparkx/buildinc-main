import { createClient } from "@/lib/supabase/client";
import { ITaskDB } from "@/lib/types";

const supabase = createClient();

type TaskAssignmentResult = {
	task: ITaskDB;
	requestId: string;
};

export class TaskAssignmentRpcMissingError extends Error {
	constructor() {
		super("TASK_ASSIGNMENT_RPC_MISSING");
		this.name = "TaskAssignmentRpcMissingError";
	}
}

export function isTaskAssignmentRpcMissing(error: unknown): boolean {
	return error instanceof TaskAssignmentRpcMissingError;
}

function rpcErrorMessage(error: {
	message?: string;
	details?: string;
	code?: string;
}): string {
	if (
		error.code === "PGRST202" ||
		error.message?.includes("schema cache") ||
		error.message?.includes("Could not find the function")
	) {
		return "TASK_ASSIGNMENT_RPC_MISSING";
	}
	const parts = [error.message, error.details].filter(
		(x): x is string => typeof x === "string" && x.length > 0,
	);
	return parts.join(" ").trim() || "Could not update task assignment.";
}

function parseResult(data: unknown): TaskAssignmentResult {
	const row = data as { task: ITaskDB; requestId: string };
	return {
		task: row.task,
		requestId: row.requestId,
	};
}

export const taskAssignmentDB = {
	async acceptTaskAssignment(
		requestId: string,
	): Promise<TaskAssignmentResult> {
		const { data, error } = await supabase.rpc("accept_task_assignment", {
			p_request_id: requestId,
		});

		if (error) {
			const msg = rpcErrorMessage(error);
			if (msg === "TASK_ASSIGNMENT_RPC_MISSING") {
				throw new TaskAssignmentRpcMissingError();
			}
			throw new Error(msg);
		}

		return parseResult(data);
	},

	async rejectTaskAssignment(
		requestId: string,
	): Promise<TaskAssignmentResult> {
		const { data, error } = await supabase.rpc("reject_task_assignment", {
			p_request_id: requestId,
		});

		if (error) {
			const msg = rpcErrorMessage(error);
			if (msg === "TASK_ASSIGNMENT_RPC_MISSING") {
				throw new TaskAssignmentRpcMissingError();
			}
			throw new Error(msg);
		}

		return parseResult(data);
	},
};
