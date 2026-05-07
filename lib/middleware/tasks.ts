// lib/middleware/tasks.ts
import { taskDB } from "@/lib/supabase/db/taskDB";
import { ITask, ITaskDB } from "../types";
import { useTaskStore } from "@/lib/store/taskStore";
import { recomputePhaseAndProjectProgress } from "@/lib/functions/base";

export async function addTask(task: ITask) {
	try {
		// Convert ITask to ITaskDB by extracting only the DB fields
		const taskData: ITaskDB = {
			id: crypto.randomUUID(),
			created_at: task.created_at,
			phaseId: task.phaseId,
			assignedTo: task.assignedTo,
			name: task.name,
			status: task.status,
			plannedBudget: task.plannedBudget,
			description: task.description,
			startDate: task.startDate,
			endDate: task.endDate,
			completedDate: task.completedDate,
			order: task.order,
			completionNotes: task.completionNotes,
			rejectionReason: task.rejectionReason,
			spent: task.spent,
			estimatedDuration: task.estimatedDuration,
			approvedBy: task.approvedBy,
			paymentCompleted: task.paymentCompleted || false,
			materialsCompleted: task.materialsCompleted || false,
			projectId: task.projectId,
			projectName: task.projectName,
		};

		const result = await taskDB.addTask(taskData);

		// Update store with the new task (basic data only)
		const store = useTaskStore.getState();
		store.addTask({
			...result,
			materialIds: [],
			assigneeId: result.assignedTo || null,
		});
		recomputePhaseAndProjectProgress();

		return result;
	} catch (error) {
		console.error("Error adding task:", error);
		throw error;
	}
}

export async function deleteTask(id: string) {
	try {
		await taskDB.removeTask(id);

		// Remove from store
		const store = useTaskStore.getState();
		store.deleteTask(id);
		recomputePhaseAndProjectProgress();

		return { success: true, message: "Task deleted successfully" };
	} catch (error) {
		console.error("Error deleting task:", error);
		throw error;
	}
}

export async function updateTask(id: string, updates: Partial<ITask>) {
	try {
		const store = useTaskStore.getState();

		// Convert partial ITask to partial ITaskDB
		const updateData: Partial<ITaskDB> = {};

		// Only include fields that exist in ITaskDB
		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.description !== undefined)
			updateData.description = updates.description;
		if (updates.status !== undefined) updateData.status = updates.status;
		if (updates.plannedBudget !== undefined)
			updateData.plannedBudget = updates.plannedBudget;
		if (updates.startDate !== undefined)
			updateData.startDate = updates.startDate;
		if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
		if (updates.completedDate !== undefined)
			updateData.completedDate = updates.completedDate;
		if (updates.order !== undefined) updateData.order = updates.order;
		if (updates.completionNotes !== undefined)
			updateData.completionNotes = updates.completionNotes;
		if (updates.rejectionReason !== undefined)
			updateData.rejectionReason = updates.rejectionReason;
		if (updates.estimatedDuration !== undefined)
			updateData.estimatedDuration = updates.estimatedDuration;
		if (updates.assignedTo !== undefined)
			updateData.assignedTo = updates.assignedTo;
		if (updates.approvedBy !== undefined)
			updateData.approvedBy = updates.approvedBy;

		// Handle spent: if updating spent, add to existing spent if > 0
		if (updates.spent !== undefined) {
			const currentTask = store.getTask(id);
			if (
				currentTask &&
				typeof currentTask.spent === "number" &&
				currentTask.spent > 0
			) {
				updateData.spent = currentTask.spent + updates.spent;
			} else {
				updateData.spent = updates.spent;
			}
		}

		if (updates.paymentCompleted !== undefined)
			updateData.paymentCompleted = updates.paymentCompleted;
		if (updates.materialsCompleted !== undefined)
			updateData.materialsCompleted = updates.materialsCompleted;

		const result = await taskDB.updateTask(id, updateData);

		// Update store
		const updateDataWithAssignee = {
			...updateData,
			assigneeId: updateData.assignedTo || null,
		};
		store.updateTask(id, updateDataWithAssignee);
		recomputePhaseAndProjectProgress();

		return result;
	} catch (error) {
		console.error("Error updating task:", error);
		throw error;
	}
}

export async function getTask(id: string): Promise<ITask> {
	try {
		// First check if we have it in the store
		const store = useTaskStore.getState();
		const cachedTask = store.getTask(id);

		if (cachedTask) {
			return cachedTask;
		}

		// If not in store, fetch from DB
		const task = await taskDB.getTask(id);

		// Add to store with empty references
		const taskWithReferences: ITask = {
			...task,
			materialIds: [],
			assigneeId: task.assignedTo || null,
		};
		store.addTask(taskWithReferences);

		return taskWithReferences;
	} catch (error) {
		console.error("Error getting task:", error);
		throw error;
	}
}

export async function getPhaseTasks(phaseId: string): Promise<ITask[]> {
	try {
		const tasks = await taskDB.getPhaseTasks(phaseId);

		// Update store with the basic task data
		const tasksWithReferences: ITask[] = tasks.map((task) => ({
			...task,
			materialIds: [],
			assigneeId: task.assignedTo || null,
		}));

		const store = useTaskStore.getState();
		store.setTasks(tasksWithReferences);

		return tasksWithReferences;
	} catch (error) {
		console.error("Error getting phase tasks:", error);
		throw error;
	}
}

export async function getUserTasks(userId: string): Promise<ITask[]> {
	try {
		const tasks = await taskDB.getUserTasks(userId);

		// Update store with the basic task data
		const tasksWithReferences: ITask[] = tasks.map((task) => ({
			...task,
			materialIds: [],
			assigneeId: task.assignedTo || null,
		}));

		const store = useTaskStore.getState();
		// Add to store (don't replace all tasks, just add these)
		tasksWithReferences.forEach((task) => {
			store.addTask(task);
		});

		return tasksWithReferences;
	} catch (error) {
		console.error("Error getting user tasks:", error);
		throw error;
	}
}

export async function updateTaskOrder(tasks: { id: string; order: number }[]) {
	try {
		const result = await taskDB.updateTaskOrder(tasks);

		// Update store
		const store = useTaskStore.getState();
		tasks.forEach(({ id, order }) => {
			store.updateTask(id, { order });
		});

		return result;
	} catch (error) {
		console.error("Error updating task order:", error);
		throw error;
	}
}

// Store Functions

export function getPhaseTasksFromStore(phaseId: string): ITask[] {
	try {
		const tasks = useTaskStore.getState().getTasksByPhase(phaseId);
		// // console.log(tasks);

		return tasks;
	} catch (error) {
		console.error("Error getting phase tasks:", error);
		throw error;
	}
}

export function getTaskFromStore(id: string): ITask | undefined {
	try {
		// First check if we have it in the store
		const store = useTaskStore.getState();
		const cachedTask = store.getTask(id);

		if (cachedTask) {
			return cachedTask;
		}

		return undefined;
	} catch (error) {
		console.error("Error getting task:", error);
		throw error;
	}
}
