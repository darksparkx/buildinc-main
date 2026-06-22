import { createClient } from "@/lib/supabase/client";
import { ITaskDB } from "@/lib/types";

const supabase = createClient();

type SubmitTaskForReviewResult = {
	task: ITaskDB;
};

export class TaskWorkflowRpcMissingError extends Error {
	constructor(rpcName: string) {
		super(`TASK_WORKFLOW_RPC_MISSING:${rpcName}`);
		this.name = "TaskWorkflowRpcMissingError";
	}
}

export function isTaskWorkflowRpcMissing(
	error: unknown,
	rpcName?: string,
): boolean {
	if (error instanceof TaskWorkflowRpcMissingError) {
		return rpcName ? error.message.endsWith(rpcName) : true;
	}
	return false;
}

function rpcErrorMessage(
	error: {
		message?: string;
		details?: string;
		code?: string;
	},
	rpcName: string,
): string {
	if (
		error.code === "PGRST202" ||
		error.message?.includes("schema cache") ||
		error.message?.includes("Could not find the function")
	) {
		return `TASK_WORKFLOW_RPC_MISSING:${rpcName}`;
	}
	const parts = [error.message, error.details].filter(
		(x): x is string => typeof x === "string" && x.length > 0,
	);
	return parts.join(" ").trim() || "Could not update task workflow.";
}

export const taskWorkflowDB = {
	async submitTaskForReview(taskId: string): Promise<SubmitTaskForReviewResult> {
		const { data, error } = await supabase.rpc("submit_task_for_review", {
			p_task_id: taskId,
		});

		if (error) {
			const msg = rpcErrorMessage(error, "submit_task_for_review");
			if (msg.startsWith("TASK_WORKFLOW_RPC_MISSING:")) {
				throw new TaskWorkflowRpcMissingError("submit_task_for_review");
			}
			throw new Error(msg);
		}

		const row = data as { task: ITaskDB };
		return { task: row.task };
	},
};
