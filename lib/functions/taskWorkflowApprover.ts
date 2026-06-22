import {
	getProjectMembersByProjectId,
	getProjectMembersByProjectIdFromStore,
} from "../middleware/projectMembers";
import { getProject, getProjectFromStore } from "../middleware/projects";
import type { IProjectProfile } from "../types";

function pickApproverFromMembers(
	members: IProjectProfile[],
	projectOwner?: string,
): string | null {
	const supervisor = members.find((m) => m.memberInfo?.role === "Supervisor");
	if (supervisor?.id) return supervisor.id;

	const admin = members.find((m) => m.memberInfo?.role === "Admin");
	if (admin?.id) return admin.id;

	if (projectOwner) return projectOwner;

	return null;
}

export function getTaskWorkflowApproverIdFromStore(
	projectId: string,
): string | null {
	const project = getProjectFromStore(projectId);
	const members = getProjectMembersByProjectIdFromStore(projectId);
	return pickApproverFromMembers(members, project?.owner);
}

/** Supervisor → project Admin → project owner. */
export async function resolveTaskWorkflowApproverId(
	projectId: string,
): Promise<string | null> {
	const cached = getTaskWorkflowApproverIdFromStore(projectId);
	if (cached) return cached;

	const project =
		getProjectFromStore(projectId) ?? (await getProject(projectId));
	const members = await getProjectMembersByProjectId(projectId);
	return pickApproverFromMembers(members, project?.owner);
}
