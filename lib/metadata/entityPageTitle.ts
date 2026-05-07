import { createClient } from "@/lib/supabase/server";

const truncate = (s: string, max = 72) =>
	s.length <= max ? s : `${s.slice(0, max - 1)}…`;

async function selectName(
	table: "tasks" | "projects" | "organisations",
	id: string,
	fallback: string,
): Promise<string> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(table)
		.select("name")
		.eq("id", id)
		.maybeSingle<{ name: string | null }>();

	if (error || !data?.name) return fallback;
	const trimmed = data.name.trim();
	return trimmed ? truncate(trimmed) : fallback;
}

export function taskPageTitle(taskId: string) {
	return selectName("tasks", taskId, "Task");
}

export function projectPageTitle(projectId: string) {
	return selectName("projects", projectId, "Project");
}

export function organisationPageTitle(organisationId: string) {
	return selectName("organisations", organisationId, "Organisation");
}
