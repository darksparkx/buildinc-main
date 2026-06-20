import { recomputePhaseAndProjectProgress } from "@/lib/functions/base";
import { projectDetails } from "@/lib/functions/projectDetails";
import { loadEstimatorRateCard } from "@/lib/middleware/estimatorRateCard";
import { getMaterialPricingsByUserId } from "@/lib/middleware/materialPricing";
import { getTaskMaterials } from "@/lib/middleware/materials";
import { getOrganisationMembers } from "@/lib/middleware/organisationMembers";
import {
	getMemberOrganisations,
	getUserOrganisations,
} from "@/lib/middleware/organisations";
import { getProjectPhases } from "@/lib/middleware/phases";
import { getAllProfiles } from "@/lib/middleware/profiles";
import { getProjectMembersByProjectId } from "@/lib/middleware/projectMembers";
import { getMemberProjects, getUserProjects } from "@/lib/middleware/projects";
import { getRequestsByUserId } from "@/lib/middleware/requests";
import { getPhaseTasks } from "@/lib/middleware/tasks";
import { usesOwnerShell } from "@/lib/billing/ownerShell";
import { parseSubscriberEntitlementsRow } from "@/lib/billing/parseSubscriberEntitlementsRow";
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { useProjectStore } from "@/lib/store/projectStore";
import type { IProfile } from "@/lib/types";

const { getPhaseStatus } = projectDetails();

async function loadPhaseDetails(phaseId: string) {
	const updatePhase = usePhaseStore.getState().updatePhase;
	const tasks = await getPhaseTasks(phaseId);
	const taskIds = tasks.map((t) => t.id);
	updatePhase(phaseId, {
		taskIds,
		status: getPhaseStatus(phaseId),
	});
	await Promise.all(tasks.map((task) => getTaskMaterials(task.id)));
}

async function loadProjectDetails(projectId: string) {
	await Promise.all([
		getProjectMembersByProjectId(projectId),
		getProjectPhases(projectId).then((phases) =>
			Promise.all(phases.map((phase) => loadPhaseDetails(phase.id))),
		),
	]);
}

function linkProjectsToOrganisations() {
	const orgStore = useOrganisationStore.getState();
	const projectStore = useProjectStore.getState();
	const orgProjectMap: Record<string, string[]> = {};

	Object.values(projectStore.projects).forEach((project) => {
		if (project.orgId) {
			orgProjectMap[project.orgId] ??= [];
			orgProjectMap[project.orgId].push(project.id);
		}
	});

	Object.entries(orgProjectMap).forEach(([orgId, projectIds]) => {
		orgStore.updateOrganisation(orgId, { projectIds });
	});
}

async function loadUserData(userProfile: IProfile) {
	await Promise.all([
		getMemberOrganisations(userProfile.id),
		getMemberProjects(userProfile.id),
	]);
}

async function loadAdminData(userProfile: IProfile) {
	const [organisations, projects] = await Promise.all([
		getUserOrganisations(userProfile.id),
		getUserProjects(userProfile.id),
		getMaterialPricingsByUserId(userProfile.id),
		loadEstimatorRateCard(userProfile.id).catch((err) => {
			console.error("Failed to load estimator rate card:", err);
			return null;
		}),
	]);

	await Promise.all([
		...organisations.map((org) => getOrganisationMembers(org.id)),
		...projects.map((project) => loadProjectDetails(project.id)),
	]);

	linkProjectsToOrganisations();
	recomputePhaseAndProjectProgress();
}

/**
 * Loads orgs/projects/tasks for the current session (same rules as StoreHydrator).
 * Call after entitlements change (e.g. unlock code) so UI updates without full reload.
 */
export async function runSessionStoreLoad(
	userProfile: IProfile,
	subscriberEntitlementsRaw: Record<string, unknown> | null,
): Promise<void> {
	await getRequestsByUserId(userProfile.id);
	await getAllProfiles();
	const entRow = subscriberEntitlementsRaw
		? parseSubscriberEntitlementsRow(subscriberEntitlementsRaw)
		: null;

	if (userProfile.admin) {
		await loadAdminData(userProfile);
		return;
	}
	if (usesOwnerShell(userProfile, entRow)) {
		await loadAdminData(userProfile);
		return;
	}

	const ownedOrgs = await getUserOrganisations(userProfile.id);
	if (ownedOrgs.length > 0) {
		await loadAdminData(userProfile);
		return;
	}
	await loadUserData(userProfile);
}
