"use client";
import Tasks from "@/components/tasks/Tasks";
import { useRequestsSync } from "@/lib/hooks/useRequestsSync";
import { useUserTasks } from "@/lib/hooks/useUserTasks";
import { useProfileStore } from "@/lib/store/profileStore";
import { useRequestStore } from "@/lib/store/requestStore";

export default function Page() {
	const profile = useProfileStore((state) => state.profile);
	useRequestsSync(profile?.id);
	const tasks = useUserTasks(profile?.id);
	const requests = Object.values(
		useRequestStore((state) => state.requests),
	);

	if (!profile) {
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	return (
		<Tasks tasks={tasks} requests={requests} profileId={profile.id} />
	);
}
