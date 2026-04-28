// lib/middleware/organisationMembers.ts
import { organisationMemberDB } from "@/lib/supabase/db/organisationMemberDB";
import { profileDB } from "@/lib/supabase/db/profileDB";
import { subscriptionLimitErrorMessage } from "@/lib/billing/subscriptionLimitErrorMessage";
import {
	IOrganisationProfile,
	IOrganisationMemberDB,
	IProfileDB,
} from "../types";
import { useOrganisationMemberStore } from "@/lib/store/organisationMemberStore";

// Helper function to combine member info with profile data
async function createOrganisationProfile(
	member: IOrganisationMemberDB
): Promise<IOrganisationProfile> {
	try {
		const profile = await profileDB.getProfile(member.userId);
		return {
			...profile,
			memberInfo: member,
		};
	} catch (error) {
		console.error(
			"Error fetching profile for member:",
			member.userId,
			error
		);
		throw error;
	}
}

export async function addOrganisationMember(
	member: IOrganisationMemberDB
): Promise<IOrganisationProfile> {
	try {
		const result = await organisationMemberDB.addOrganisationMember(member);
		const organisationProfile = await createOrganisationProfile(result);

		// Update store
		const store = useOrganisationMemberStore.getState();
		store.addOrganisationMember(member.orgId, organisationProfile);

		return organisationProfile;
	} catch (error) {
		const mapped = subscriptionLimitErrorMessage(error);
		if (mapped) {
			throw new Error(mapped);
		}
		console.error("Error adding organisation member:", error);
		throw error;
	}
}
export async function addOrganisationMember_DBONLY(
	member: IOrganisationMemberDB
): Promise<IOrganisationProfile> {
	try {
		const result = await organisationMemberDB.addOrganisationMember(member);
		const organisationProfile = await createOrganisationProfile(result);

		return organisationProfile;
	} catch (error) {
		const mapped = subscriptionLimitErrorMessage(error);
		if (mapped) {
			throw new Error(mapped);
		}
		console.error("Error adding organisation member:", error);
		throw error;
	}
}

export async function removeOrganisationMember(
	memberId: string,
	orgId: string,
	id: string
) {
	try {
		await organisationMemberDB.removeOrganisationMember(memberId);

		// Remove from store
		const store = useOrganisationMemberStore.getState();
		store.removeOrganisationMember(orgId, id);

		return {
			success: true,
			message: "Organisation member removed successfully",
		};
	} catch (error) {
		console.error("Error removing organisation member:", error);
		throw error;
	}
}

export async function updateOrganisationMember(
	id: string,
	orgId: string,
	updates: Partial<IOrganisationMemberDB>
): Promise<IOrganisationProfile> {
	try {
		const result = await organisationMemberDB.updateOrganisationMember(
			id,
			updates
		);
		const organisationProfile = await createOrganisationProfile(result);

		// Update store
		const store = useOrganisationMemberStore.getState();
		store.addOrganisationMember(orgId, organisationProfile); // This will replace existing

		return organisationProfile;
	} catch (error) {
		console.error("Error updating organisation member:", error);
		throw error;
	}
}

export async function getOrganisationMembers(
	orgId: string
): Promise<IOrganisationProfile[]> {
	try {
		// First check if we have them in the store
		const store = useOrganisationMemberStore.getState();
		const cachedMembers = store.getOrganisationMembers(orgId);

		if (cachedMembers.length > 0) {
			return cachedMembers;
		}

		// If not in store, fetch from DB
		const members = await organisationMemberDB.getOrganisationMembers(
			orgId
		);
		const organisationProfiles = await Promise.all(
			members.map((member) => createOrganisationProfile(member))
		);

		// Update store
		store.setOrganisationMembers(orgId, organisationProfiles);

		return organisationProfiles;
	} catch (error) {
		console.error("Error getting organisation members:", error);
		throw error;
	}
}

export async function getOrganisationMember(
	id: string,
	orgId: string
): Promise<IOrganisationProfile> {
	try {
		// First check if we have it in the store
		const store = useOrganisationMemberStore.getState();
		const cachedMember = store.getOrganisationMember(orgId, id);

		if (cachedMember) {
			return cachedMember;
		}

		// If not in store, fetch from DB
		const member = await organisationMemberDB.getOrganisationMember(id);
		const organisationProfile = await createOrganisationProfile(member);

		// Update store
		store.addOrganisationMember(orgId, organisationProfile);

		return organisationProfile;
	} catch (error) {
		console.error("Error getting organisation member:", error);
		throw error;
	}
}

// Store Only Functions
export function getOrganisationMembersFromStore(
	orgId: string
): IOrganisationProfile[] {
	try {
		// First check if we have them in the store
		const store = useOrganisationMemberStore.getState();
		const cachedMembers = store.getOrganisationMembers(orgId);

		if (cachedMembers.length > 0) {
			return cachedMembers;
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error getting organisation members:", error);
		throw error;
	}
}
