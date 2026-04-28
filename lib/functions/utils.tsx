import { clsx, type ClassValue } from "clsx";
import { Box, Building, Building2, Users2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getStatusColor = (status: string) => {
	switch (status) {
		case "Active":
			return "bg-green-100 text-green-800 hover:bg-green-100";
		case "Reviewing":
			return "bg-blue-100 text-blue-800 hover:bg-blue-100";
		case "Inactive":
			return "bg-orange-100 text-orange-800 hover:bg-orange-100";
		case "Pending":
			return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
		case "Completed":
			return "bg-gray-100 text-gray-800 hover:bg-gray-100";
		case "Approved":
			return "bg-gray-100 text-gray-800 hover:bg-gray-100";
		case "Rejected":
			return "bg-red-100 text-red-800 hover:bg-red-100";
	}
};

// Calculate project duration in days
export const getEstimatedDuration = (
	startDate: Date | null,
	endDate: Date | null
) => {
	if (startDate && endDate && startDate < endDate) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		return Math.ceil(
			(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
		);
	}
	return 0;
};

// Date utilities
export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString();
}

export function formatTime(timestamp: string | Date): string {
	return new Date(timestamp).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatDateTime(timestamp: string | Date): string {
	const date = new Date(timestamp);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (date.toDateString() === today.toDateString()) {
		return "Today";
	} else if (date.toDateString() === yesterday.toDateString()) {
		return "Yesterday";
	} else {
		return date.toLocaleDateString();
	}
}

export function isOverdue(dueDate: string): boolean {
	return new Date(dueDate) < new Date();
}

export function getDaysUntilDue(dueDate: string): number {
	const due = new Date(dueDate);
	const now = new Date();
	const diffTime = due.getTime() - now.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Currency utilities
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

export function formatCompactCurrency(amount: number): string {
	if (amount >= 1000000) {
		return `$${(amount / 1000000).toFixed(1)}M`;
	} else if (amount >= 1000) {
		return `$${(amount / 1000).toFixed(0)}K`;
	}
	return formatCurrency(amount);
}

// Percentage utilities
export function calculatePercentage(value: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((value / total) * 100);
}

export function formatPercentage(percentage: number): string {
	return `${percentage}%`;
}

// Icon Exports

import React from "react";
import { status } from "../types";
import { ca } from "date-fns/locale";
import { useOrganisationStore } from "../store/organisationStore";
import { useProjectStore } from "../store/projectStore";
import { useOrganisationMemberStore } from "../store/organisationMemberStore";
import { useOrganisationDetailStore } from "../store/organisationDetailStore";
import { useProjectMemberStore } from "../store/projectMemberStore";
import { useprojectDetailStore } from "../store/projectDetailStore";
import { usePhaseStore } from "../store/phaseStore";
import { useTaskStore } from "../store/taskStore";
import { useMaterialStore } from "../store/materialStore";
import { useRequestStore } from "../store/requestStore";
import { useEntitlementsStore } from "../store/entitlementsStore";

export function ProjectIcon({ className = "" }: { className?: string }) {
	return <Box className={cn(className)} />;
}

export function OrgIcon({ className = "" }: { className?: string }) {
	return <Building2 className={cn(className)} />;
}

export function MembersIcon({ className = "" }: { className?: string }) {
	return <Users2 className={cn(className)} />;
}

export function RupeeIcon({ className = "" }: { className?: string }) {
	return " ₹";
}

export function ClearData() {
	useOrganisationStore.getState().clearOrganisations();
	useOrganisationMemberStore.getState().clearOrganisationMembers();
	useOrganisationDetailStore.getState().clearData();

	useProjectStore.getState().clearProjects();
	useProjectMemberStore.getState().clearProjectMembers();
	useprojectDetailStore.getState().clearData();

	usePhaseStore.getState().clearPhases();
	useTaskStore.getState().clearTasks();
	useMaterialStore.getState().clearMaterials();
	useRequestStore.getState().clearRequests();
	useEntitlementsStore.getState().clearEntitlements();

	// Optionally clear localStorage if data is persisted there

	localStorage.clear();
}

export function safeUUID(value: string | null | undefined) {
	return value && value.trim() !== "" ? value : null;
}
