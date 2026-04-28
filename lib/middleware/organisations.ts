// lib/middleware/organisations.ts
import { preflightCreateOrganisation } from "@/lib/billing/subscriptionPreflight";
import { subscriptionLimitErrorMessage } from "@/lib/billing/subscriptionLimitErrorMessage";
import { organisationDB } from "@/lib/supabase/db/organisationDB";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { IOrganisation, IOrganisationDB } from "../types";
import { organisationMemberDB } from "../supabase/db/organisationMemberDB";

export async function addOrganisation(organisation: IOrganisation) {
	try {
		const profile = useProfileStore.getState().profile;
		const entitlements = useEntitlementsStore.getState().entitlements;
		const ownedOrganisations = Object.values(
			useOrganisationStore.getState().organisations,
		);
		const gate = preflightCreateOrganisation({
			profile,
			entitlements,
			ownerId: organisation.owner,
			ownedOrganisations,
		});
		if (!gate.ok) {
			throw new Error(gate.message);
		}

		// Convert IOrganisation to IOrganisationDB by extracting only the DB fields
		const organisationData: IOrganisationDB = {
			id: crypto.randomUUID(),
			name: organisation.name,
			created_at: organisation.created_at,
			owner: organisation.owner,
			description: organisation.description,
		};

		const result = await organisationDB.addOrganisation(organisationData);

		// Update store with the new organisation (basic data only)
		const store = useOrganisationStore.getState();
		store.addOrganisation({
			...result,
			memberIds: [],
			projectIds: [],
		});

		return result;
	} catch (error) {
		const mapped = subscriptionLimitErrorMessage(error);
		if (mapped) {
			throw new Error(mapped);
		}
		const e = error as { message?: string; code?: string; details?: string };
		console.error("Error adding organisation:", e?.message, e?.code, e?.details, error);
		throw error;
	}
}

export async function deleteOrganisation(id: string) {
	try {
		await organisationDB.removeOrganisation(id);

		// Remove from store
		const store = useOrganisationStore.getState();
		store.deleteOrganisation(id);

		return { success: true, message: "Organisation deleted successfully" };
	} catch (error) {
		console.error("Error deleting organisation:", error);
		throw error;
	}
}

export async function updateOrganisation(
	id: string,
	updates: Partial<IOrganisation>
) {
	try {
		// Convert partial IOrganisation to partial IOrganisationDB
		const updateData: Partial<IOrganisationDB> = {};

		// Only include fields that exist in IOrganisationDB
		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.description !== undefined)
			updateData.description = updates.description;
		if (updates.owner !== undefined) updateData.owner = updates.owner;
		if (updates.created_at !== undefined)
			updateData.created_at = updates.created_at;

		const result = await organisationDB.updateOrganisation(id, updateData);

		// Update store
		const store = useOrganisationStore.getState();
		store.updateOrganisation(id, updateData);

		return result;
	} catch (error) {
		console.error("Error updating organisation:", error);
		throw error;
	}
}

export async function getOrganisation(id: string): Promise<IOrganisation> {
	try {
		// First check if we have it in the store
		const store = useOrganisationStore.getState();
		const cachedOrg = store.getOrganisation(id);

		if (cachedOrg) {
			return cachedOrg;
		}

		// If not in store, fetch from DB
		const organisation = await organisationDB.getOrganisation(id);

		// Add to store with empty references
		const orgWithReferences: IOrganisation = {
			...organisation,
			memberIds: [],
			projectIds: [],
		};
		store.addOrganisation(orgWithReferences);

		return orgWithReferences;
	} catch (error) {
		console.error("Error getting organisation:", error);
		throw error;
	}
}

export async function getUserOrganisations(
	userId: string
): Promise<IOrganisation[]> {
	try {
		const organisations = await organisationDB.getUserOrganisations(userId);

		// Update store with the basic organisation data
		const orgsWithReferences: IOrganisation[] = organisations.map(
			(org) => ({
				...org,
				memberIds: [],
				projectIds: [],
			})
		);

		const store = useOrganisationStore.getState();
		store.setOrganisations(orgsWithReferences);

		return orgsWithReferences;
	} catch (error) {
		console.error("Error getting user organisations:", error);
		throw error;
	}
}

export async function getMemberOrganisations(
	userId: string
): Promise<IOrganisation[]> {
	try {
		const organisations = await organisationMemberDB
			.getUserOrganisationMembers(userId)
			.then(async (memberships) => {
				// Fetch each organisation by its ID
				const orgPromises = memberships.map((membership) =>
					organisationDB.getOrganisation(membership.orgId)
				);
				return Promise.all(orgPromises);
			});

		// Update store with the basic organisation data
		const orgsWithReferences: IOrganisation[] = organisations.map(
			(org) => ({
				...org,
				memberIds: [],
				projectIds: [],
			})
		);

		const store = useOrganisationStore.getState();
		store.setOrganisations(orgsWithReferences);
		return orgsWithReferences;
	} catch (error) {
		console.error("Error getting member organisations:", error);
		throw error;
	}
}
