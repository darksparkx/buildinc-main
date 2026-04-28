"use client";

import { recomputePhaseAndProjectProgress } from "@/lib/functions/base";
import { projectDetails } from "@/lib/functions/projectDetails";
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
import { useOrganisationStore } from "@/lib/store/organisationStore";
import { usePhaseStore } from "@/lib/store/phaseStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useProjectStore } from "@/lib/store/projectStore";
import {
	cleanupRealtimeListeners,
	initRealtimeListeners,
} from "@/lib/supabase/realtimeClient";
import { parseSubscriberEntitlementsRow } from "@/lib/billing/parseSubscriberEntitlementsRow";
import { usesOwnerShell } from "@/lib/billing/ownerShell";
import { useEntitlementsStore } from "@/lib/store/entitlementsStore";
import { IProfile } from "@/lib/types";
import { useEffect } from "react";

export const StoreHydrator = ({
	profile,
	subscriberEntitlementsRaw,
}: {
	profile: IProfile | null;
	subscriberEntitlementsRaw: Record<string, unknown> | null;
}) => {
	const { setProfile } = useProfileStore();

	useEffect(() => {
		if (!subscriberEntitlementsRaw) {
			useEntitlementsStore.getState().clearEntitlements();
			return;
		}
		const parsed = parseSubscriberEntitlementsRow(subscriberEntitlementsRaw);
		useEntitlementsStore.getState().setEntitlements(parsed);
	}, [subscriberEntitlementsRaw]);
	const { updatePhase } = usePhaseStore();
	const { getPhaseStatus } = projectDetails();

	useEffect(() => {
		// 🪄 Update activity timestamp on user action
		const handleActivity = () => {
			localStorage.setItem("lastActiveAt", Date.now().toString());
		};

		window.addEventListener("click", handleActivity);
		window.addEventListener("mousemove", handleActivity);
		window.addEventListener("keydown", handleActivity);

		return () => {
			window.removeEventListener("click", handleActivity);
			window.removeEventListener("mousemove", handleActivity);
			window.removeEventListener("keydown", handleActivity);
		};
	}, []);

	// 🧠 Existing logic for data + realtime
	useEffect(() => {
		if (!profile) return;
		setProfile(profile);
		loadData(profile, subscriberEntitlementsRaw);
		initRealtimeListeners(profile);
		return cleanupRealtimeListeners;
	}, [profile, subscriberEntitlementsRaw]);

	const loadData = async (
		userProfile: IProfile,
		rawEntitlements: Record<string, unknown> | null,
	) => {
		try {
			await getRequestsByUserId(userProfile.id);
			await getAllProfiles();
			const entRow = rawEntitlements
				? parseSubscriberEntitlementsRow(rawEntitlements)
				: null;
			if (usesOwnerShell(userProfile, entRow)) await loadAdminData(userProfile);
			else await loadUserData(userProfile);
		} catch (error) {
			console.error("Error loading user data:", error);
		}
	};

	const loadUserData = async (userProfile: IProfile) => {
		await Promise.all([
			getMemberOrganisations(userProfile.id),
			getMemberProjects(userProfile.id),
		]);
	};

	const loadAdminData = async (userProfile: IProfile) => {
		const [organisations, projects] = await Promise.all([
			getUserOrganisations(userProfile.id),
			getUserProjects(userProfile.id),
			getMaterialPricingsByUserId(userProfile.id),
		]);

		await Promise.all([
			...organisations.map((org) => getOrganisationMembers(org.id)),
			...projects.map((project) => loadProjectDetails(project.id)),
		]);

		linkProjectsToOrganisations();
		recomputePhaseAndProjectProgress();
	};

	const loadProjectDetails = async (projectId: string) => {
		await Promise.all([
			getProjectMembersByProjectId(projectId),
			getProjectPhases(projectId).then((phases) =>
				Promise.all(phases.map((phase) => loadPhaseDetails(phase.id)))
			),
		]);
	};

	const loadPhaseDetails = async (phaseId: string) => {
		const tasks = await getPhaseTasks(phaseId);
		const taskIds = tasks.map((t) => t.id);
		updatePhase(phaseId, {
			taskIds,
			status: getPhaseStatus(phaseId),
		});
		await Promise.all(tasks.map((task) => getTaskMaterials(task.id)));
	};

	const linkProjectsToOrganisations = () => {
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
	};

	return null;
};
