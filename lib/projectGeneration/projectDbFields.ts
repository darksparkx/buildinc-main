import type { IProjectCreationData, IProjectDB } from "@/lib/types";

function parseBuildingSpecJson(
	raw: string | Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
	if (raw == null) return null;
	if (typeof raw === "object") return raw;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		return parsed && typeof parsed === "object"
			? (parsed as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

/** Maps P4 questionnaire / generation outputs onto `projects` row fields. */
export function buildingSpecFieldsFromCreation(
	project: IProjectCreationData,
): Pick<
	IProjectDB,
	"projectTypeId" | "totalSqft" | "budgetPerSqft" | "buildingSpecJson"
> {
	return {
		projectTypeId: project.projectTypeId?.trim() || null,
		totalSqft:
			project.totalSqft != null && project.totalSqft > 0
				? project.totalSqft
				: null,
		budgetPerSqft:
			project.budgetPerSqft != null && project.budgetPerSqft > 0
				? project.budgetPerSqft
				: null,
		buildingSpecJson: parseBuildingSpecJson(project.buildingSpecJson),
	};
}
