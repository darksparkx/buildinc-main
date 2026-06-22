import { createClient } from "@/lib/supabase/client";
import { IOrganisationMemberDB, IProjectMemberDB } from "@/lib/types";

const supabase = createClient();

type AcceptOrgInvitationResult = {
	member: IOrganisationMemberDB;
	orgId: string;
	requestId: string;
};

type AcceptProjectInvitationResult = {
	member: IProjectMemberDB;
	projectId: string;
	requestId: string;
};

/** Thrown when accept_* RPC has not been deployed (run supabase-build SQL migrations). */
export class InvitationRpcMissingError extends Error {
	constructor() {
		super("INVITATION_RPC_MISSING");
		this.name = "InvitationRpcMissingError";
	}
}

export function isInvitationRpcMissing(error: unknown): boolean {
	return error instanceof InvitationRpcMissingError;
}

function rpcErrorMessage(error: {
	message?: string;
	details?: string;
	code?: string;
}): string {
	if (
		error.code === "PGRST202" ||
		error.message?.includes("schema cache") ||
		error.message?.includes("Could not find the function")
	) {
		return "INVITATION_RPC_MISSING";
	}
	const parts = [error.message, error.details].filter(
		(x): x is string => typeof x === "string" && x.length > 0,
	);
	return parts.join(" ").trim() || "Could not accept invitation.";
}

export const invitationDB = {
	async acceptOrganisationInvitation(
		requestId: string,
	): Promise<AcceptOrgInvitationResult> {
		const { data, error } = await supabase.rpc(
			"accept_organisation_invitation",
			{ p_request_id: requestId },
		);

		if (error) {
			const msg = rpcErrorMessage(error);
			if (msg === "INVITATION_RPC_MISSING") {
				throw new InvitationRpcMissingError();
			}
			throw new Error(msg);
		}

		const row = data as {
			member: IOrganisationMemberDB;
			orgId: string;
			requestId: string;
		};

		return {
			member: row.member,
			orgId: row.orgId,
			requestId: row.requestId,
		};
	},

	async acceptProjectInvitation(
		requestId: string,
	): Promise<AcceptProjectInvitationResult> {
		const { data, error } = await supabase.rpc("accept_project_invitation", {
			p_request_id: requestId,
		});

		if (error) {
			const msg = rpcErrorMessage(error);
			if (msg === "INVITATION_RPC_MISSING") {
				throw new InvitationRpcMissingError();
			}
			throw new Error(msg);
		}

		const row = data as {
			member: IProjectMemberDB;
			projectId: string;
			requestId: string;
		};

		return {
			member: row.member,
			projectId: row.projectId,
			requestId: row.requestId,
		};
	},
};
