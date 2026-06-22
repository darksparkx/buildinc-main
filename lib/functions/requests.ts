"use client";
import { toast } from "sonner";
import { recomputePhaseAndProjectProgress } from "./base";
import {
	getMaterialFromStore,
	updateMaterial,
} from "../middleware/materials";
import { getPhaseFromStore } from "../middleware/phases";
import { getAllProfilesFromStore } from "../middleware/profiles";
import { getProjectFromStore, updateProject } from "../middleware/projects";
import { updateRequest } from "../middleware/requests";
import { getTaskFromStore, updateTask } from "../middleware/tasks";
import { useRequestStore } from "../store/requestStore";
import { useTaskStore } from "../store/taskStore";
import {
	isTaskAssignmentRpcMissing,
	taskAssignmentDB,
} from "../supabase/db/taskAssignmentDB";
import { describeCompletionBlockers, getPendingTaskWorkflowBlockersForCompletion } from "./taskCompletionBlockers";
import { IProfile, IRequest, ITaskDB } from "../types";

/** Re-export for callers that already import from `requests`. */
export { getPendingTaskWorkflowBlockersForCompletion } from "./taskCompletionBlockers";

export const getDetailsForRequest = (request: IRequest) => {
	const allProfiles = getAllProfilesFromStore();

	request.approvedByProfile =
		allProfiles.find((p) => p.id === request.approvedBy) || undefined;
	request.requestedByProfile =
		allProfiles.find((p) => p.id === request.requestedBy) || undefined;
	request.requestedToProfile =
		allProfiles.find((p) => p.id === String(request.requestedTo)) ||
		undefined;
	request.project = getProjectFromStore(request.projectId || "");
	request.phase = getPhaseFromStore(request.phaseId || "");
	request.task = getTaskFromStore(request.taskId || "");
	request.material = getMaterialFromStore(request.materialId || "");
	return request;
};

function syncTaskFromDb(task: ITaskDB) {
	const store = useTaskStore.getState();
	const taskWithRefs = {
		...task,
		materialIds: [] as string[],
		assigneeId: task.assignedTo ?? null,
	};

	if (store.getTask(task.id)) {
		store.updateTask(task.id, taskWithRefs);
	} else {
		store.addTask(taskWithRefs);
	}

	recomputePhaseAndProjectProgress();
}

export const handleAssigment = async (
	request: IRequest,
	profile: IProfile | null
) => {
	if (!profile || profile.id !== String(request.requestedTo)) {
		throw new Error("Only the assigned user can accept this task.");
	}

	if (!request.taskId) {
		throw new Error("Invalid task assignment request.");
	}

	try {
		const { task } = await taskAssignmentDB.acceptTaskAssignment(request.id);

		useRequestStore.getState().updateRequest(request.id, {
			status: "Approved",
			approvedAt: new Date(),
			approvedBy: profile.id,
		});
		syncTaskFromDb(task);
		toast.success("Task assignment accepted.");
	} catch (err) {
		if (isTaskAssignmentRpcMissing(err)) {
			throw new Error(
				"Task assignment could not be approved. Run supabase-build/16_accept_task_assignment.sql in Supabase, then try again.",
			);
		}
		throw err instanceof Error
			? err
			: new Error("Could not accept this task assignment.");
	}
};

/** @returns Whether the task was completed (false if unauthorized or blocked by pending requests). */
export const handleCompletion = async (
	request: IRequest,
	profile: IProfile | null,
): Promise<boolean> => {
	if (!profile || profile.id !== request.requestedTo) return false;

	const blockers = getPendingTaskWorkflowBlockersForCompletion(request);
	if (blockers.length > 0) {
		const list = describeCompletionBlockers(blockers);
		toast.error(
			`Cannot approve completion yet. This task still has pending ${list} request${blockers.length > 1 ? "s" : ""}. Approve or reject those first.`,
		);
		return false;
	}

	toast.info("Completing task and updating project spend...");

	updateRequest(request.id, {
		status: "Approved",
		approvedAt: new Date(),
		approvedBy: profile.id,
	});

	updateTask(request.taskId || "", {
		status: "Completed",
		completedDate: new Date(),
	});

	updateProject(request.projectId || "", {
		spent:
			(getProjectFromStore(request.projectId || "")?.spent ?? 0) +
			(getTaskFromStore(request.taskId || "")?.spent ?? 0),
	});

	toast.success("Task completed and project spend updated.");
	return true;
};

export const handlePaymentRequest = async (
	request: IRequest,
	profile: IProfile | null
) => {
	if (!profile || profile.id !== request.requestedTo) return;

	updateRequest(request.id, {
		status: "Approved",
		approvedAt: new Date(),
		approvedBy: profile.id,
	});

	updateTask(request.taskId || "", {
		spent: request.requestData.amount as number,
	});
};

export const handleMaterialRequest = async (
	request: IRequest,
	profile: IProfile | null
) => {
	if (!profile || profile.id !== request.requestedTo) return;

	updateRequest(request.id, {
		status: "Approved",
		approvedAt: new Date(),
		approvedBy: profile.id,
	});

	updateMaterial(request.requestData.materialId || "", {
		usedQuantity: request.requestData.units as number,
		unit: request.requestData.unitName as string,
		requested: true,
		approved: true,
	});

	updateTask(request.taskId || "", {
		spent:
			(request.requestData.units as number) *
			(request.requestData.unitCost as number),
	});
};

export const handleReject = async (
	request: IRequest,
	profile: IProfile | null
) => {
	if (!profile || profile.id !== String(request.requestedTo)) return;

	const taskId = request.taskId;

	if (request.type === "TaskAssignment" && taskId) {
		try {
			const { task } = await taskAssignmentDB.rejectTaskAssignment(
				request.id,
			);
			useRequestStore.getState().updateRequest(request.id, {
				status: "Rejected",
			});
			syncTaskFromDb(task);
			toast.success("Task assignment declined.");
		} catch (err) {
			if (isTaskAssignmentRpcMissing(err)) {
				throw new Error(
					"Task assignment could not be declined. Run supabase-build/16_accept_task_assignment.sql in Supabase, then try again.",
				);
			}
			throw err instanceof Error
				? err
				: new Error("Could not decline this task assignment.");
		}
		return;
	}

	await updateRequest(request.id, { status: "Rejected" });

	if (!taskId) return;

	switch (request.type) {
		case "TaskCompletion": {
			// Was "Reviewing" while awaiting approval — send back to active work
			await updateTask(taskId, {
				status: "Active",
				completedDate: null,
			});
			break;
		}
		case "PaymentRequest":
			// No task / assignment change on payment denial
			break;
		case "MaterialRequest": {
			const mid =
				request.requestData?.materialId ?? request.materialId ?? null;
			if (mid) {
				await updateMaterial(mid, { requested: false });
			}
			break;
		}
		case "TaskAssignment":
			break;
		default:
			break;
	}
};
