import { updateMaterial } from "../middleware/materials";
import { getPhaseFromStore } from "../middleware/phases";
import { getProjectFromStore } from "../middleware/projects";
import { addRequest } from "../middleware/requests";
import { getTaskFromStore } from "../middleware/tasks";
import {
	isTaskWorkflowRpcMissing,
	taskWorkflowDB,
} from "../supabase/db/taskWorkflowDB";
import { useProfileStore } from "../store/profileStore";
import { useTaskStore } from "../store/taskStore";
import { IMaterial, ITask, ITaskDB } from "../types";
import { recomputePhaseAndProjectProgress } from "./base";
import { resolveTaskWorkflowApproverId } from "./taskWorkflowApprover";

export const getProjectNameFromPhaseId = (phaseId: string): string => {
	const phase = getPhaseFromStore(phaseId);
	if (!phase) return "Unknown Project";
	const project = getProjectFromStore(phase.projectId);
	return project ? project.name : "Unknown Project";
};

export const getProjectIdFromPhaseId = (phaseId: string): string => {
	// console.log("phaseId", phaseId);

	const phase = getPhaseFromStore(phaseId);
	if (!phase) return "";
	const project = getProjectFromStore(phase.projectId);
	return project ? project.id : "";
};

// In your requestPayment function, add parameters:
export const requestPayment = async (
	task: ITask,
	amount: number,
	projectId: string,
	notes?: string,
	requesterId?: string,
) => {
	const requestedBy = requesterId ?? task.assignedTo ?? task.assigneeId;
	if (!requestedBy) {
		throw new Error("Task is not assigned to anyone.");
	}

	const approverId = await resolveTaskWorkflowApproverId(projectId);
	if (!approverId) {
		throw new Error(
			"No supervisor or admin is assigned to approve this request.",
		);
	}
	if (approverId === requestedBy) {
		throw new Error(
			"This project has no separate approver. Add a supervisor or admin to the project.",
		);
	}

	const data = addRequest({
		type: "PaymentRequest",
		taskId: task.id,
		notes: notes || "",
		status: "Pending",
		requestData: { amount: amount },
		created_at: new Date(),
		projectId: projectId,
		id: crypto.randomUUID(),
		phaseId: task.phaseId,
		materialId: null,
		requestedBy,
		requestedTo: approverId,
		approvedBy: null,
		approvedAt: null,
	});

	return (await data).id;
};

export const requestMaterial = async (
	task: ITask,
	material: IMaterial,
	units: number,
	unitName: string,
	unitCost: number,
	projectId: string,
	notes: string | undefined = undefined,
	requesterId?: string,
) => {
	const requestedBy = requesterId ?? task.assignedTo ?? task.assigneeId;
	if (!requestedBy) {
		throw new Error("Task is not assigned to anyone.");
	}

	const approverId = await resolveTaskWorkflowApproverId(projectId);
	if (!approverId) {
		throw new Error(
			"No supervisor or admin is assigned to approve this request.",
		);
	}
	if (approverId === requestedBy) {
		throw new Error(
			"This project has no separate approver. Add a supervisor or admin to the project.",
		);
	}

	const data = addRequest({
		type: "MaterialRequest",
		taskId: task.id,
		notes: notes || "",
		status: "Pending",
		requestData: {
			materialId: material.id,
			materialName: material.name,
			units: units,
			unitName: unitName,
			unitCost: unitCost,
		},
		created_at: new Date(),
		projectId: projectId,
		id: crypto.randomUUID(),
		phaseId: task.phaseId,
		materialId: null,
		requestedBy,
		requestedTo: approverId,
		approvedBy: null,
		approvedAt: null,
	});

	updateMaterial(material.id, {
		requested: true,
	});

	return (await data).id;
};

function syncTaskInStore(task: ITaskDB) {
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

export const handleTaskCompletion = async (taskId: string) => {
	const profile = useProfileStore.getState().profile;
	const task = getTaskFromStore(taskId);

	if (!profile || !task) {
		console.warn("[handleTaskCompletion] missing profile or task", {
			taskId,
			hasTask: !!task,
		});
		return undefined;
	}

	const requestedBy = profile.id;
	if (!task.assignedTo && !task.assigneeId) {
		console.warn("[handleTaskCompletion] task has no assignee", { taskId });
		return undefined;
	}

	const projectId =
		task.projectId || getProjectIdFromPhaseId(task.phaseId);
	if (!projectId) {
		console.warn(
			"[handleTaskCompletion] could not resolve projectId",
			task.phaseId,
		);
		return undefined;
	}

	const approverId = await resolveTaskWorkflowApproverId(projectId);
	if (!approverId) {
		throw new Error(
			"No supervisor or admin is assigned to approve task completion.",
		);
	}
	if (approverId === requestedBy) {
		throw new Error(
			"This project has no separate approver. Add a supervisor or admin to the project.",
		);
	}

	try {
		const { task: updatedTask } =
			await taskWorkflowDB.submitTaskForReview(taskId);
		syncTaskInStore(updatedTask);
	} catch (err) {
		if (isTaskWorkflowRpcMissing(err, "submit_task_for_review")) {
			throw new Error(
				"Could not submit task for review. Run supabase-build/17_submit_task_for_review.sql in Supabase, then try again.",
			);
		}
		throw err instanceof Error
			? err
			: new Error("Could not submit task for review.");
	}

	const data = addRequest({
		type: "TaskCompletion",
		taskId: task.id,
		notes: "",
		status: "Pending",
		requestData: {},
		created_at: new Date(),
		projectId,
		id: crypto.randomUUID(),
		phaseId: task.phaseId,
		materialId: null,
		requestedBy,
		requestedTo: approverId,
		approvedBy: null,
		approvedAt: null,
	});

	return (await data).id;
};
