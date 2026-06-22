// lib/middleware/phases.ts
import { phaseDB } from "@/lib/supabase/db/phaseDB";
import { IPhase, IPhaseDB, status } from "../types";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { recomputePhaseAndProjectProgress } from "@/lib/functions/base";
import { getProjectMembersByProjectId } from "./projectMembers";
import { getPhaseTasks } from "./tasks";
import { getTaskMaterials } from "./materials";

export async function addPhase(phase: IPhase) {
	try {
		// Convert IPhase to IPhaseDB by extracting only the DB fields
		const phaseData: IPhaseDB = {
			id: crypto.randomUUID(),
			projectId: phase.projectId,
			created_at: phase.created_at,
			name: phase.name,
			description: phase.description,
			startDate: phase.startDate,
			endDate: phase.endDate,
			budget: phase.budget,
			order: phase.order,
		};

		const result = await phaseDB.addPhase(phaseData);

		// Update store with the new phase (basic data only)
		const store = usePhaseStore.getState();
		store.addPhase({
			...result,
			taskIds: [],
			status: ["Inactive"],
			spent: 0,
			estimatedDuration: 0,
			totalTasks: 0,
			completedTasks: 0,
		});

		return result;
	} catch (error) {
		console.error("Error adding phase:", error);
		throw error;
	}
}

export async function deletePhase(id: string) {
	try {
		await phaseDB.removePhase(id);

		// Remove from store
		const store = usePhaseStore.getState();
		store.deletePhase(id);

		return { success: true, message: "Phase deleted successfully" };
	} catch (error) {
		console.error("Error deleting phase:", error);
		throw error;
	}
}

export async function updatePhase(id: string, updates: Partial<IPhase>) {
	try {
		// Convert partial IPhase to partial IPhaseDB
		const updateData: Partial<IPhaseDB> = {};

		// Only include fields that exist in IPhaseDB
		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.description !== undefined)
			updateData.description = updates.description;
		if (updates.startDate !== undefined)
			updateData.startDate = updates.startDate;
		if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
		if (updates.budget !== undefined) updateData.budget = updates.budget;
		if (updates.order !== undefined) updateData.order = updates.order;
		if (updates.projectId !== undefined)
			updateData.projectId = updates.projectId;

		const result = await phaseDB.updatePhase(id, updateData);

		// Update store
		const store = usePhaseStore.getState();
		store.updatePhase(id, updateData);

		return result;
	} catch (error) {
		console.error("Error updating phase:", error);
		throw error;
	}
}

export async function getPhase(id: string): Promise<IPhase> {
	try {
		// First check if we have it in the store
		const store = usePhaseStore.getState();
		const cachedPhase = store.getPhase(id);

		if (cachedPhase) {
			return cachedPhase;
		}

		// If not in store, fetch from DB
		const phase = await phaseDB.getPhase(id);

		// Add to store with empty references
		const phaseWithReferences: IPhase = {
			...phase,
			taskIds: [],
			status: ["Inactive"],
			spent: 0,
			estimatedDuration: 0,
			totalTasks: 0,
			completedTasks: 0,
		};
		store.addPhase(phaseWithReferences);

		return phaseWithReferences;
	} catch (error) {
		console.error("Error getting phase:", error);
		throw error;
	}
}

export async function getProjectPhases(projectId: string): Promise<IPhase[]> {
	try {
		const phases = await phaseDB.getProjectPhases(projectId);

		// Update store with the basic phase data
		const phasesWithReferences: IPhase[] = phases.map((phase) => ({
			...phase,
			taskIds: [],
			status: ["Inactive"],
			spent: 0,
			estimatedDuration: 0,
			totalTasks: 0,
			completedTasks: 0,
		}));

		const store = usePhaseStore.getState();
		store.setProjectPhases(projectId, phasesWithReferences);

		return phasesWithReferences;
	} catch (error) {
		console.error("Error getting project phases:", error);
		throw error;
	}
}

export async function updatePhaseOrder(
	phases: { id: string; order: number }[]
) {
	try {
		const result = await phaseDB.updatePhaseOrder(phases);

		// Update store
		const store = usePhaseStore.getState();
		phases.forEach(({ id, order }) => {
			store.updatePhase(id, { order });
		});

		return result;
	} catch (error) {
		console.error("Error updating phase order:", error);
		throw error;
	}
}

// store functions
export function getProjectPhasesFromStore(projectId: string): IPhase[] {
	try {
		const phasesList = usePhaseStore.getState().phases;
		const phases = Object.values(phasesList).filter(
			(phase) => phase.projectId === projectId
		);

		return phases;
	} catch (error) {
		console.error("Error getting project phases:", error);
		throw error;
	}
}

export function getPhaseFromStore(id: string): IPhase | undefined {
	try {
		// First check if we have it in the store
		const store = usePhaseStore.getState();
		// console.log("store phases", store.phases);

		const cachedPhase = store.getPhase(id);

		if (cachedPhase) {
			return cachedPhase;
		}

		return undefined;
	} catch (error) {
		console.error("Error getting phase:", error);
		throw error;
	}
}

/** Phases + tasks + materials for the task board. Call when opening project detail (StoreHydrator only does this for admin bulk load). */
export async function hydrateProjectBoardData(
	projectId: string
): Promise<void> {
	// Members load separately via useProjectMembers; don't block the board on member fetch errors.
	void getProjectMembersByProjectId(projectId).catch((error) => {
		console.error("Error loading project members for board hydrate:", error);
	});

	const phases = await getProjectPhases(projectId);
	await Promise.all(
		phases.map(async (phase) => {
			const tasks = await getPhaseTasks(phase.id);
			const taskIds = tasks.map((t) => t.id);
			const derivedStatus: status[] =
				tasks.length === 0
					? ["Inactive"]
					: (Array.from(
							new Set(tasks.map((t) => t.status))
						) as status[]);
			usePhaseStore.getState().updatePhase(phase.id, {
				taskIds,
				status: derivedStatus,
			});
			await Promise.all(tasks.map((task) => getTaskMaterials(task.id)));
		})
	);
	recomputePhaseAndProjectProgress();
}
