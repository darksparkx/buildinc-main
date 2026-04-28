/*
	lib/types.d.ts
 */
// 0. Common Types
export type role = "Admin" | "Supervisor" | "Employee";
export type category = "Commercial" | "Residential";
export type status =
	| "Inactive"
	| "Pending"
	| "Active"
	| "Reviewing"
	| "Completed";
export type approvalStatus = "Pending" | "Approved" | "Rejected";
export type requestType =
	| "TaskAssignment"
	| "MaterialRequest"
	| "PaymentRequest"
	| "TaskCompletion"
	| "JoinOrganisation"
	| "JoinProject";

/** Matches public.subscription_plan_enum in Postgres (06_billing_subscriptions.sql). */
export type SubscriptionPlan =
	| "none"
	| "starter"
	| "professional"
	| "enterprise"
	| "custom";

export type requestData = {
	amount?: number;
	quantity?: number;
	description?: string;
	taskId?: string;
	completionNotes?: string;
	payee?: string;
	reason?: string;
	supplier?: string;
	unitCost?: number;
	materialId?: string;
	materialName?: string;
	units?: number;
	unitName?: string;
	totalCost?: number;
	organisationId?: string;
	organisationName?: string;
	memberId?: string;
	projectId?: string;
	projectName?: string;
};

export type materialPricing = {
	materialId: string;
	name: string;
	unitCost: number;
	unit: string;
};
/**
 *
 * 1. Database Types
 *
 */
// 1.1 Primary, get these from the Databases
export interface IProfileDB {
	id: string;
	email: string;
	name: string;
	bio: string;
	admin: boolean;
}

/** public.subscriber_entitlements — billing row for the paying subscriber (profile id). */
export interface ISubscriberEntitlementsDB {
	subscriber_id: string;
	plan: SubscriptionPlan;
	status: string;
	billing_interval: string | null;
	/** e.g. payment, stripe, paddle, manual */
	billing_provider: string | null;
	billing_customer_id: string | null;
	billing_subscription_id: string | null;
	current_period_start: Date | null;
	current_period_end: Date | null;
	trial_ends_at: Date | null;
	max_orgs: number | null;
	max_projects: number | null;
	max_users: number | null;
	updated_at: Date;
}

export interface IOrganisationDB {
	id: string;
	name: string;
	created_at: Date;
	owner: string;
	description: string;
}

export interface IProjectDB {
	// from projectDB
	id: string;
	created_at: Date;
	name: string;
	owner: string;
	description: string;
	orgId: string | null;
	startDate: Date | null;
	endDate: Date | null;
	budget: number;
	spent: number;
	location: string;
	status: status;
	category: category;
}

export interface IPhaseDB {
	// from phaseDB
	id: string;
	projectId: string;
	created_at: Date;
	name: string;
	description: string;
	startDate: Date | null;
	endDate: Date | null;
	budget: number;
	order: number;
}

export interface ITaskDB {
	id: string; // noChange
	created_at: Date; // noChange
	phaseId: string;
	projectId: string;
	projectName: string;
	assignedTo: string | null;
	name: string;
	status: status;
	plannedBudget: number;
	description: string;
	startDate: Date | null;
	endDate: Date | null;
	completedDate: Date | null;
	order: number;
	completionNotes: string;
	rejectionReason: string;
	spent: number;
	estimatedDuration: number;
	approvedBy: string | null;
	paymentCompleted: boolean;
	materialsCompleted: boolean;
}

// 1.2 Secondary, part of another table
export interface IMaterialDB {
	// noChange
	id: string;
	taskId: string;
	materialId: string;

	name: string;
	plannedQuantity: number;
	usedQuantity: number;
	unitCost: number;
	unit: string;
	requested: boolean;
	approved: boolean;
	deliveredQuantity: number;
	wasteQuantity: number;
}

export interface IMaterialPricingDB {
	id: string;
	user: string;
	name: string;
	unit: string;
	price: number;
}

export interface IProjectTemplateDB {
	id: string;
	created_at: Date;
	name: string;
	owner: string;
	data: json;
}

// 1.3 Tertiary, tables that link different tables

export interface IOrganisationMemberDB {
	id: string;
	joinedAt: Date;
	orgId: string;
	userId: string;
	role: role;
}

export interface IProjectMemberDB {
	id: string;
	joinedAt: Date;
	projectId: string;
	userId: string;
	role: role;
}

export interface IRequestDB {
	id: string;
	created_at: Date;
	projectId: string | null;
	phaseId: string | null;
	taskId: string | null;
	materialId: string | null;
	requestedBy: string;
	requestedTo: string;
	approvedBy: string | null;
	type: requestType;
	status: approvalStatus;
	requestData: requestData;
	approvedAt: Date | null;
	notes: string | null;
}

/**
 *
 * 2. Local Types
 *
 * */

// 2.1 Types to use in project after getting from DB
export interface IOrganisation extends IOrganisationDB {
	// References instead of nested objects
	memberIds: string[]; // IDs of organisation members
	projectIds: string[]; // IDs of projects in this organisation
}

export interface IProfile extends IProfileDB {
	// Optional: can still keep these if needed, but consider using ID references
	requestedToIds?: string[]; // IDs of requests where user is requestedTo
	requestedByIds?: string[]; // IDs of requests where user is requestedBy
}

export interface IProject extends IProjectDB {
	// References instead of nested objects
	phaseIds: string[]; // IDs of phases in this project
	memberIds: string[]; // IDs of project members

	// Calculated properties (can be computed on demand)
	progress: number;
	totalTasks: number;
	completedTasks: number;
}

export interface IPhase extends IPhaseDB {
	// References instead of nested objects
	taskIds: string[]; // IDs of tasks in this phase

	// Calculated properties (can be computed on demand)
	status: status[];
	spent: number;
	estimatedDuration: number;
	totalTasks: number;
	completedTasks: number;
}

export interface ITask extends ITaskDB {
	// References instead of nested objects
	materialIds: string[]; // IDs of materials for this task

	// Optional: can keep assignee as ID or resolve when needed
	assigneeId?: string | null; // ID of assigned user
	materials?: IMaterial[]; // Resolved materials if needed
}

export interface IMaterial extends IMaterialDB {
	// Additional local properties
	units?: string[];
	defaultUnit?: string;
}

export interface IOrganisationProfile extends IProfileDB {
	// Organisation-specific member information
	memberInfo?: IOrganisationMemberDB;
}

export interface IProjectProfile extends IProfileDB {
	// Project-specific member information
	memberInfo?: IProjectMemberDB;
}
export interface IRequest extends IRequestDB {
	// Keep IDs for references - these can be resolved using selector hooks
	// Optional: if you need quick access, you can add resolved objects
	project?: IProject;
	phase?: IPhase;
	task?: ITask;
	material?: IMaterial;
	requestedByProfile?: IProfile;
	requestedToProfile?: IProfile;
	approvedByProfile?: IProfile;
	photos?: string[];
}

// 2.1 Template Types
export interface IProjectTemplate {
	id: string;
	name: string;
	description: string;
	owner: string;
	budget: number;
	location: string;
	category: category;
	phases: IPhaseTemplate[];
}
export interface IPhaseTemplate {
	id: string;
	name: string;
	description: string;
	budget: number;
	estimatedDuration: number;
	tasks: ITaskTemplate[];
	startDate: Date | null;
	endDate: Date | null;
}
export interface ITaskTemplate {
	id: string;
	name: string;
	description: string;
	estimatedDuration: number;
	plannedBudget: number;
	materials: Partial<IMaterialTemplate>[];
}
export interface IMaterialTemplate {
	id: string;
	materialId: string;
	name: string;
	plannedQuantity: number;
	unit: string;
	unitCost: number;
	defaultUnit: string;
	units: string[];
}

// 3. Form Types
export interface IProjectCreationData {
	// Step 1: Basic Details
	id: string;
	name: string;
	owner: string;
	description: string;
	organisationId: string;
	startDate: Date | null;
	endDate: Date | null;
	budget: number;
	location: string;
	supervisor: string;
	supervisorName: string;
	status: status;
	category: category;
	// members: IProjectMemberProfile[];

	// Step 2: Phases and Tasks
	selectedTemplate?: IProjectTemplate;
	phases: IPhaseTemplate[];

	// Step 3: Review and Confirmation
	saveAsTemplate: boolean;
	templateName?: string;
	templateDescription?: string;
}
