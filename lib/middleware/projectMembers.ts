// lib/middleware/projectMembers.ts
import { projectMemberDB } from "@/lib/supabase/db/projectMemberDB";
import { projectDB } from "@/lib/supabase/db/projectDB";
import { profileDB } from "@/lib/supabase/db/profileDB";
import { subscriptionLimitErrorMessage } from "@/lib/billing/subscriptionLimitErrorMessage";
import { notifyRemovedFromProject } from "./membershipNotifications";
import { IProjectProfile, IProjectMemberDB, IProfileDB } from "../types";
import { useProjectMemberStore } from "@/lib/store/projectMemberStore";

function rethrowMemberError(error: unknown, context: string): never {
	const mapped = subscriptionLimitErrorMessage(error);
	if (mapped) {
		throw new Error(mapped);
	}
	const message =
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
			? (error as { message: string }).message
			: context;
	console.error(context + ":", error);
	throw new Error(message);
}

// Helper function to combine member info with profile data
async function createProjectProfile(
	member: IProjectMemberDB
): Promise<IProjectProfile> {
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

export async function addProjectMember_DBONLY(
	member: IProjectMemberDB
): Promise<IProjectProfile> {
	try {
		const result = await projectMemberDB.addProjectMember(member);
		const projectProfile = await createProjectProfile(result);

		// Update store
		const store = useProjectMemberStore.getState();
		store.addProjectMember(member.projectId, projectProfile);

		return projectProfile;
	} catch (error) {
		rethrowMemberError(error, "Error adding project member");
	}
}

export async function addProjectMember(
	member: IProjectMemberDB
): Promise<IProjectProfile> {
	try {
		const result = await projectMemberDB.addProjectMember(member);
		const projectProfile = await createProjectProfile(result);
		return projectProfile;
	} catch (error) {
		rethrowMemberError(error, "Error adding project member");
	}
}

export async function removeProjectMember(id: string, projectId: string) {
	try {
		const [memberRow, project] = await Promise.all([
			projectMemberDB.getProjectMember(id),
			projectDB.getProject(projectId),
		]);

		await projectMemberDB.removeProjectMember(id);

		const store = useProjectMemberStore.getState();
		store.removeProjectMember(projectId, memberRow.userId);

		void notifyRemovedFromProject({
			recipientId: memberRow.userId,
			projectId,
			projectName: project.name,
		});

		return {
			success: true,
			message: "Project member removed successfully",
		};
	} catch (error) {
		console.error("Error removing project member:", error);
		throw error;
	}
}

export async function updateProjectMember(
	id: string,
	projectId: string,
	updates: Partial<IProjectMemberDB>
): Promise<IProjectProfile> {
	try {
		const result = await projectMemberDB.updateProjectMember(id, updates);
		const projectProfile = await createProjectProfile(result);

		// Update store
		const store = useProjectMemberStore.getState();
		store.addProjectMember(projectId, projectProfile); // This will replace existing

		return projectProfile;
	} catch (error) {
		console.error("Error updating project member:", error);
		throw error;
	}
}

export async function getProjectMembersByProjectId(
	projectId: string
): Promise<IProjectProfile[]> {
	try {
		const store = useProjectMemberStore.getState();
		const cachedMembers = store.getProjectMembers(projectId);

		if (cachedMembers.length > 0) {
			return cachedMembers;
		}

		return refreshProjectMembers(projectId);
	} catch (error) {
		console.error("Error getting project members:", error);
		throw error;
	}
}

/** Always loads members from the DB and replaces the store entry for this project. */
export async function refreshProjectMembers(
	projectId: string
): Promise<IProjectProfile[]> {
	try {
		const members = await projectMemberDB.getProjectMembers(projectId);
		const projectProfiles = (
			await Promise.all(
				members.map(async (member) => {
					try {
						return await createProjectProfile(member);
					} catch (error) {
						console.error(
							"Error fetching profile for project member:",
							member.userId,
							error,
						);
						return null;
					}
				}),
			)
		).filter((profile): profile is IProjectProfile => profile !== null);

		const store = useProjectMemberStore.getState();
		store.setProjectMembers(projectId, projectProfiles);

		return projectProfiles;
	} catch (error) {
		console.error("Error refreshing project members:", error);
		throw error;
	}
}

export async function getProjectMember(
	id: string,
	projectId: string
): Promise<IProjectProfile> {
	try {
		// First check if we have it in the store
		const store = useProjectMemberStore.getState();
		const cachedMember = store.getProjectMember(projectId, id);

		if (cachedMember) {
			return cachedMember;
		}

		// If not in store, fetch from DB
		const member = await projectMemberDB.getProjectMember(id);
		const projectProfile = await createProjectProfile(member);

		// Update store
		store.addProjectMember(projectId, projectProfile);

		return projectProfile;
	} catch (error) {
		console.error("Error getting project member:", error);
		throw error;
	}
}

export async function getUserProjectMembers(
	userId: string
): Promise<IProjectProfile[]> {
	try {
		const members = await projectMemberDB.getUserProjectMembers(userId);
		const projectProfiles = await Promise.all(
			members.map((member) => createProjectProfile(member))
		);

		// Update store - group by projectId
		const store = useProjectMemberStore.getState();
		const membersByProject = new Map<string, IProjectProfile[]>();

		projectProfiles.forEach((profile) => {
			const projectId = profile.memberInfo?.projectId;
			if (!projectId) return;
			if (!membersByProject.has(projectId)) {
				membersByProject.set(projectId, []);
			}
			membersByProject.get(projectId)!.push(profile);
		});

		membersByProject.forEach((profiles, projectId) => {
			store.setProjectMembers(projectId, profiles);
		});

		return projectProfiles;
	} catch (error) {
		console.error("Error getting user project members:", error);
		throw error;
	}
}

export function getProjectMembersByProjectIdFromStore(
	projectId: string
): IProjectProfile[] {
	try {
		// First check if we have them in the store
		const store = useProjectMemberStore.getState();
		const cachedMembers = store.getProjectMembers(projectId);

		if (cachedMembers.length > 0) {
			return cachedMembers;
		}

		return [];
	} catch (error) {
		console.error("Error getting project members:", error);
		throw error;
	}
}
