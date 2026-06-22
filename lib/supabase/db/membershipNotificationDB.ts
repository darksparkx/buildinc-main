import { createClient } from "@/lib/supabase/client";
import { serializeRowForInsert } from "@/lib/supabase/insertSerialize";

const supabase = createClient();

function rpcErrorMessage(error: {
	message?: string;
	details?: string;
}): string {
	const parts = [error.message, error.details].filter(
		(x): x is string => typeof x === "string" && x.length > 0,
	);
	return parts.join(" ").trim() || "Could not send removal notification.";
}

function isRpcMissing(error: {
	code?: string;
	message?: string;
}): boolean {
	return (
		error.code === "PGRST202" ||
		Boolean(error.message?.includes("schema cache")) ||
		Boolean(error.message?.includes("Could not find the function"))
	);
}

async function insertMembershipNotification(row: {
	recipientId: string;
	actorId: string;
	kind: "removed_from_organisation" | "removed_from_project";
	orgId: string | null;
	projectId: string | null;
	entityName: string;
}): Promise<void> {
	const { error } = await supabase.from("membership_notifications").insert([
		serializeRowForInsert({
			id: crypto.randomUUID(),
			readAt: null,
			...row,
		} as unknown as Record<string, unknown>),
	]);

	if (error) {
		throw new Error(rpcErrorMessage(error));
	}
}

export const membershipNotificationDB = {
	async countUnread(recipientId: string): Promise<number> {
		const { count, error } = await supabase
			.from("membership_notifications")
			.select("*", { count: "exact", head: true })
			.eq("recipientId", recipientId)
			.is("readAt", null);

		if (error) throw error;
		return count ?? 0;
	},

	async listUnread(recipientId: string) {
		const { data, error } = await supabase
			.from("membership_notifications")
			.select("*")
			.eq("recipientId", recipientId)
			.is("readAt", null)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data ?? [];
	},

	async notifyRemovedFromOrganisation({
		recipientId,
		actorId,
		orgId,
		orgName,
	}: {
		recipientId: string;
		actorId: string;
		orgId: string;
		orgName: string;
	}): Promise<void> {
		const { error } = await supabase.rpc("notify_removed_from_organisation", {
			p_recipient_id: recipientId,
			p_org_id: orgId,
			p_entity_name: orgName,
		});

		if (!error) return;

		if (isRpcMissing(error)) {
			await insertMembershipNotification({
				recipientId,
				actorId,
				kind: "removed_from_organisation",
				orgId,
				projectId: null,
				entityName: orgName,
			});
			return;
		}

		throw new Error(rpcErrorMessage(error));
	},

	async notifyRemovedFromProject({
		recipientId,
		actorId,
		projectId,
		projectName,
	}: {
		recipientId: string;
		actorId: string;
		projectId: string;
		projectName: string;
	}): Promise<void> {
		const { error } = await supabase.rpc("notify_removed_from_project", {
			p_recipient_id: recipientId,
			p_project_id: projectId,
			p_entity_name: projectName,
		});

		if (!error) return;

		if (isRpcMissing(error)) {
			await insertMembershipNotification({
				recipientId,
				actorId,
				kind: "removed_from_project",
				orgId: null,
				projectId,
				entityName: projectName,
			});
			return;
		}

		throw new Error(rpcErrorMessage(error));
	},

	async markRead(id: string, recipientId: string): Promise<void> {
		const { error } = await supabase
			.from("membership_notifications")
			.update({ readAt: new Date().toISOString() })
			.eq("id", id)
			.eq("recipientId", recipientId);

		if (error) throw error;
	},
};
