"use client";
import A_Dashboard from "@/components/dashboard/admin/A_Dashboard";
import Dashboard from "@/components/dashboard/employee/Dashboard";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useProfileStore } from "@/lib/store/profileStore";
import { useTaskStore } from "@/lib/store/taskStore";
export default function Home() {
	const profile = useProfileStore((state) => state.profile);
	const tasks = useTaskStore((state) => state.tasks);
	const ownerShell = useUsesOwnerShell(profile);
	if (!profile) {
		// redirect and don't render until profile exists
		window.location.href = "/";
		window.location.reload();
		return null;
	}

	if (ownerShell) {
		return <A_Dashboard />;
	} else {
		return (
			<Dashboard
				profile={profile}
				tasks={Object.values(tasks)}
			/>
		);
	}
}
