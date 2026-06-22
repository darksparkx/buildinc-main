import { addOrganisationMember, updateOrganisationMember } from "../middleware/organisationMembers";
import { addRequest, updateRequest } from "../middleware/requests";
import { useOrganisationMemberStore } from "../store/organisationMemberStore";
import { useOrganisationStore } from "../store/organisationStore";
import { useProfileStore } from "../store/profileStore";
import { useRequestStore } from "../store/requestStore";
import {
	invitationDB,
	isInvitationRpcMissing,
} from "../supabase/db/invitationDB";
import { organisationDB } from "../supabase/db/organisationDB";
import { IOrganisationMemberDB, IProfile, IProject, IRequest, role } from "../types";

export function organisationDetails(projects: IProject[] | null) {
	const totalBudget: number =
		projects?.reduce((sum, project) => sum + (project.budget ?? 0), 0) ?? 0;
	const totalSpent: number =
		projects?.reduce((sum, project) => sum + (project?.spent ?? 0), 0) ?? 0;
	const budgetUtilization: number =
		(totalBudget ?? 0) > 0
			? ((totalSpent ?? 0) / (totalBudget ?? 1)) * 100
			: 100;
	return { totalBudget, totalSpent, budgetUtilization };
}

export async function addMember(
	organisationId: string,
	organisationName: string,
	member: IProfile,
	ownerId: string
) {
	await addRequest({
		id: crypto.randomUUID(),
		type: "JoinOrganisation",
		requestedBy: ownerId,
		requestData: { organisationId, organisationName },
		status: "Pending",
		created_at: new Date(),
		projectId: null,
		phaseId: null,
		taskId: null,
		materialId: null,
		requestedTo: member.id,
		approvedBy: null,
		approvedAt: null,
		notes: null,
	});
}

export function refuseInvitation(request: IRequest) {
	updateRequest(request.id, {
		status: "Rejected",
	});
}

export async function acceptOrgInvitation(request: IRequest): Promise<void> {
	const { profile } = useProfileStore.getState();
	if (!profile) return;

	const orgId = request.requestData.organisationId;
	const orgName = request.requestData.organisationName;
	if (!orgId || !orgName) {
		throw new Error("Invalid organisation invitation.");
	}

	let member: IOrganisationMemberDB;
	let usedRpc = false;

	try {
		({ member } = await invitationDB.acceptOrganisationInvitation(request.id));
		usedRpc = true;
	} catch (err) {
		if (!isInvitationRpcMissing(err)) throw err;

		const orgProfile = await addOrganisationMember({
			id: crypto.randomUUID(),
			orgId,
			userId: profile.id,
			role: "Employee",
			joinedAt: new Date(),
		});
		if (!orgProfile.memberInfo) {
			throw new Error("Failed to join organisation.");
		}
		member = orgProfile.memberInfo;
		await updateRequest(request.id, {
			status: "Approved",
			approvedBy: profile.id,
			approvedAt: new Date(),
		});
	}

	const org = await organisationDB.getOrganisation(orgId);
	useOrganisationStore.getState().addOrganisation({
		...org,
		memberIds: [],
		projectIds: [],
	});

	useOrganisationMemberStore.getState().addOrganisationMember(orgId, {
		...profile,
		memberInfo: member,
	});

	if (usedRpc) {
		useRequestStore.getState().updateRequest(request.id, {
			status: "Approved",
			approvedBy: profile.id,
			approvedAt: new Date(),
		});
	}
}

export function changeUserRole(id: string, orgId: string, newRole: string) {
	updateOrganisationMember(id, orgId, {
		role: newRole as role,
	});
}
