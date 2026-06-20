"use client";

import { useMemo, useState } from "react";
import ProgressIndicator from "./ProgressIndicator";
import {
	IOrganisation,
	IOrganisationProfile,
	IProfile,
	IProjectCreationData,
	IProjectTemplate,
} from "@/lib/types";
import Phases from "./phases/Phases";
import ReviewConfirm from "./ReviewConfirm";
import { getOrganisationMembersFromStore } from "@/lib/middleware/organisationMembers";
import Tasks from "./tasks/Tasks";
import ProjectQuestionnaire, {
	validateFullQuestionnaire,
} from "./questionnaire/ProjectQuestionnaire";
import QuestionnaireReviewStep from "./questionnaire/QuestionnaireReviewStep";
import { emptyQuestionnaire } from "@/lib/projectGeneration/questionnaire";
import type { ProjectCreationQuestionnaire } from "@/lib/projectGeneration/types";

export default function CreateProject({
	profile,
	organisations,
}: {
	profile: IProfile;
	organisations: IOrganisation[];
}) {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const initialQuestionnaire = emptyQuestionnaire();

	const initialProjectData: IProjectCreationData = {
		id: crypto.randomUUID(),
		owner: profile.id,
		status: "Inactive",
		name: "",
		description: "",
		organisationId: "",
		startDate: today,
		endDate: tomorrow,
		budget: 0,
		location: "",
		supervisor: "",
		phases: [],
		saveAsTemplate: false,
		templateName: "",
		templateDescription: "",
		supervisorName: "",
		category: "Residential",
		questionnaire: initialQuestionnaire,
		planGenerated: false,
	};

	const [currentStep, setCurrentStep] = useState(1);
	const [questionnaireSubStep, setQuestionnaireSubStep] = useState(1);
	const [projectData, setProjectData] =
		useState<IProjectCreationData>(initialProjectData);
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [customTemplates, setCustomTemplates] = useState<IProjectTemplate[]>(
		[],
	);

	const questionnaire: ProjectCreationQuestionnaire = useMemo(
		() =>
			projectData.questionnaire ?? {
				...emptyQuestionnaire(),
				name: projectData.name,
				organisationId: projectData.organisationId,
				supervisor: projectData.supervisor,
				supervisorName: projectData.supervisorName,
				location: projectData.location,
				startDate: projectData.startDate,
				endDate: projectData.endDate,
			},
		[projectData],
	);

	const selectedOrganisation = organisations.find(
		(org) => org.id === projectData.organisationId,
	);

	const supervisors: IOrganisationProfile[] = selectedOrganisation
		? getOrganisationMembersFromStore(selectedOrganisation.id).filter(
				(member) => member.memberInfo?.role === "Admin",
			)
		: ([] as IOrganisationProfile[]);

	const steps = [
		"Questionnaire",
		"Review",
		"Phases",
		"Tasks",
		"Review & confirm",
	];
	const totalSteps = steps.length;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-24 pt-4 sm:space-y-8 sm:px-6 sm:pb-12 sm:pt-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
						Create project
					</h1>
					<p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
						Answer the questionnaire, review your answers, then edit
						the generated plan before publishing.
					</p>
				</header>

				<ProgressIndicator
					steps={steps}
					currentStep={currentStep}
					setCurrentStep={setCurrentStep}
					totalSteps={totalSteps}
					projectData={projectData}
					setProjectData={setProjectData}
					setValidationErrors={setValidationErrors}
					validationErrors={validationErrors}
					questionnaireSubStep={questionnaireSubStep}
					setQuestionnaireSubStep={setQuestionnaireSubStep}
					questionnaire={questionnaire}
					validateFullQuestionnaire={validateFullQuestionnaire}
				/>

				<div className="min-w-0">
					{currentStep === 1 && (
						<ProjectQuestionnaire
							projectData={projectData}
							setProjectData={setProjectData}
							organisations={organisations}
							supervisors={supervisors}
							validationErrors={validationErrors}
							setValidationErrors={setValidationErrors}
							subStep={questionnaireSubStep}
							setSubStep={setQuestionnaireSubStep}
						/>
					)}

					{currentStep === 2 && (
						<QuestionnaireReviewStep questionnaire={questionnaire} />
					)}

					{currentStep === 3 && (
						<Phases
							projectData={projectData}
							setProjectData={setProjectData}
							customTemplates={customTemplates}
							validationErrors={validationErrors}
							setValidationErrors={setValidationErrors}
							hideTemplatePicker={projectData.planGenerated === true}
						/>
					)}
					{currentStep === 4 && (
						<Tasks
							projectData={projectData}
							setProjectData={setProjectData}
							validationErrors={validationErrors}
							setValidationErrors={setValidationErrors}
						/>
					)}

					{currentStep === 5 && (
						<ReviewConfirm
							projectData={projectData}
							organisation={selectedOrganisation}
							setProjectData={setProjectData}
							selectedOrganisation={selectedOrganisation}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
