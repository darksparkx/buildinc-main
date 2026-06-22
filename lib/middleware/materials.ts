// lib/middleware/materials.ts
import { materialDB } from "@/lib/supabase/db/materialDB";
import { IMaterial, IMaterialDB } from "../types";
import { useMaterialStore } from "@/lib/store/materialStore";
import { availableMaterials } from "../constants/materials";

export async function addMaterial(material: IMaterial) {
	try {
		// Convert IMaterial to IMaterialDB by extracting only the DB fields
		const materialData: IMaterialDB = {
			id: crypto.randomUUID(),
			taskId: material.taskId,
			materialId: material.materialId,
			name: material.name,
			plannedQuantity: material.plannedQuantity,
			usedQuantity: material.usedQuantity || 0,
			unitCost: material.unitCost,
			unit: material.unit,
			requested: material.requested || false,
			approved: material.approved || false,
			deliveredQuantity: material.deliveredQuantity || 0,
			wasteQuantity: material.wasteQuantity || 0,
		};

		const result = await materialDB.addMaterial(materialData);

		// Update store with the new material (enriched data)
		const store = useMaterialStore.getState();
		const enrichedMaterial: IMaterial = {
			...result,
			units: availableMaterials.find(
				(mat) => mat.id === result.materialId
			)?.units,
			defaultUnit: availableMaterials.find(
				(mat) => mat.id === result.materialId
			)?.defaultUnit,
		};
		store.addMaterial(enrichedMaterial);

		return enrichedMaterial;
	} catch (error) {
		console.error("Error adding material:", error);
		throw error;
	}
}

export async function deleteMaterial(id: string) {
	try {
		const store = useMaterialStore.getState();
		const existing = store.getMaterial(id);

		await materialDB.removeMaterial(id);

		// Remove from store
		store.deleteMaterial(id);

		return { success: true, message: "Material deleted successfully" };
	} catch (error) {
		console.error("Error deleting material:", error);
		throw error;
	}
}

export async function updateMaterial(id: string, updates: Partial<IMaterial>) {
	try {
		// Get the existing material from the store or DB
		const store = useMaterialStore.getState();
		let existingMaterial = store.getMaterial(id);

		if (!existingMaterial) {
			// Fallback: fetch from DB if not in store
			existingMaterial = await materialDB.getMaterial(id);
		}

		const updateData: Partial<IMaterialDB> = {};

		// Only include fields that exist in IMaterialDB
		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.plannedQuantity !== undefined)
			updateData.plannedQuantity = updates.plannedQuantity;

		// For usedQuantity, add to existing if updates.usedQuantity > 0
		if (updates.usedQuantity !== undefined) {
			if (updates.usedQuantity > 0) {
				updateData.usedQuantity =
					(existingMaterial?.usedQuantity || 0) +
					updates.usedQuantity;
			} else {
				updateData.usedQuantity = updates.usedQuantity;
			}
		}

		if (updates.unitCost !== undefined)
			updateData.unitCost = updates.unitCost;
		if (updates.unit !== undefined) updateData.unit = updates.unit;
		if (updates.requested !== undefined)
			updateData.requested = updates.requested;
		if (updates.approved !== undefined)
			updateData.approved = updates.approved;
		if (updates.deliveredQuantity !== undefined)
			updateData.deliveredQuantity = updates.deliveredQuantity;
		if (updates.wasteQuantity !== undefined)
			updateData.wasteQuantity = updates.wasteQuantity;

		const result = await materialDB.updateMaterial(id, updateData);

		// Update store
		if (existingMaterial) {
			const updatedMaterial: IMaterial = {
				...existingMaterial,
				...updateData,
			};
			store.updateMaterial(id, updatedMaterial);
		}

		return result;
	} catch (error) {
		console.error("Error updating material:", error);
		throw error;
	}
}

export async function getTaskMaterials(taskId: string): Promise<IMaterial[]> {
	try {
		const materials = await materialDB.getTaskMaterials(taskId);
		const enrichedMaterials: IMaterial[] = materials.map((material) => ({
			...material,
			units: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.units,
			defaultUnit: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.defaultUnit,
		}));

		// Update store
		const store = useMaterialStore.getState();
		store.setMaterials(enrichedMaterials);

		return enrichedMaterials;
	} catch (error) {
		console.error("Error getting task materials:", error);
		throw error;
	}
}

export async function getMaterial(id: string): Promise<IMaterial> {
	try {
		// First check if we have it in the store
		const store = useMaterialStore.getState();
		const cachedMaterial = store.getMaterial(id);

		if (cachedMaterial) {
			return cachedMaterial;
		}

		// If not in store, fetch from DB
		const material = await materialDB.getMaterial(id);
		const enrichedMaterial: IMaterial = {
			...material,
			units: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.units,
			defaultUnit: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.defaultUnit,
		};

		// Update store
		store.addMaterial(enrichedMaterial);

		return enrichedMaterial;
	} catch (error) {
		console.error("Error getting material:", error);
		throw error;
	}
}

export async function getMaterialsById(ids: string[]): Promise<IMaterial[]> {
	try {
		const materials = await materialDB.getMaterialsById(ids);
		const enrichedMaterials: IMaterial[] = materials.map((material) => ({
			...material,
			units: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.units,
			defaultUnit: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.defaultUnit,
		}));

		// Update store
		const store = useMaterialStore.getState();
		store.setMaterials(enrichedMaterials);

		return enrichedMaterials;
	} catch (error) {
		console.error("Error getting materials by IDs:", error);
		throw error;
	}
}

export async function updateMaterials(
	updates: { id: string; updates: Partial<IMaterial> }[]
) {
	try {
		const dbUpdates = updates.map(({ id, updates }) => ({
			id,
			updates: Object.fromEntries(
				Object.entries(updates).filter(
					([key]) => !["units", "defaultUnit"].includes(key) // Exclude local-only fields
				)
			) as Partial<IMaterialDB>,
		}));

		const result = await materialDB.updateMaterials(dbUpdates);

		// Update store
		const store = useMaterialStore.getState();
		updates.forEach(({ id, updates }) => {
			store.updateMaterial(id, updates);
		});

		return result;
	} catch (error) {
		console.error("Error updating materials:", error);
		throw error;
	}
}

// Store functions
export function getTaskMaterialsFromStore(taskId: string): IMaterial[] {
	try {
		const materials = useMaterialStore
			.getState()
			.getMaterialsByTask(taskId);

		return materials.map((material) => ({
			...material,
			units: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.units,
			defaultUnit: availableMaterials.find(
				(mat) => mat.id === material.materialId
			)?.defaultUnit,
		}));
	} catch (error) {
		console.error("Error getting task materials:", error);
		throw error;
	}
}

export function getMaterialFromStore(id: string): IMaterial | undefined {
	try {
		// First check if we have it in the store
		const store = useMaterialStore.getState();
		const cachedMaterial = store.getMaterial(id);

		if (cachedMaterial) {
			return cachedMaterial;
		}

		return undefined;
	} catch (error) {
		console.error("Error getting material:", error);
		throw error;
	}
}
