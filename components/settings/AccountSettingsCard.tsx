"use client";

import { Button } from "@/components/base/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/base/ui/card";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import { Textarea } from "@/components/base/ui/textarea";
import { modalButtonConfirmClass } from "@/lib/functions/modalButtonStyles";
import { updateProfile } from "@/lib/middleware/profiles";
import { useUsesOwnerShell } from "@/lib/hooks/useUsesOwnerShell";
import { useProfileStore } from "@/lib/store/profileStore";
import { Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AccountSettingsCard() {
	const profile = useProfileStore((s) => s.profile);
	const ownerShell = useUsesOwnerShell(profile);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!profile) return;
		setName(profile.name ?? "");
		setBio(profile.bio ?? "");
	}, [profile]);

	if (!profile) return null;

	const handleSave = async () => {
		const trimmedName = name.trim();
		if (!trimmedName) {
			toast.error("Name is required.");
			return;
		}
		setSaving(true);
		try {
			await updateProfile(profile.id, {
				name: trimmedName,
				bio: bio.trim(),
			});
			toast.success("Profile updated.");
		} catch {
			toast.error("Could not save profile.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card className="border-border/60 bg-background/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardHeader className="space-y-3 pb-4">
				<div className="flex items-center gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-800 ring-1 ring-blue-500/25 dark:text-blue-300">
						<User className="h-4 w-4" aria-hidden />
					</span>
					<CardTitle className="text-lg sm:text-xl">Account</CardTitle>
				</div>
				<CardDescription className="text-pretty">
					Your display name and bio are shown to teammates where your profile
					appears.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pb-6">
				<div className="space-y-2">
					<Label>Your role</Label>
					<div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
						<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-800 ring-1 ring-blue-500/25 dark:text-blue-300">
							<Shield className="h-4 w-4" aria-hidden />
						</span>
						<p className="text-sm font-medium">
							{ownerShell ? "Admin" : "Member"}
						</p>
					</div>
					<p className="text-xs text-muted-foreground">
						Set by your organization. Contact an admin to change it.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="settings-email">Email</Label>
					<Input
						id="settings-email"
						type="email"
						value={profile.email}
						disabled
						className="border-border/60 bg-muted/30"
					/>
					<p className="text-xs text-muted-foreground">
						Email is tied to your sign-in and can’t be changed here.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="settings-name">Display name</Label>
					<Input
						id="settings-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="border-border/60"
						autoComplete="name"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="settings-bio">Bio</Label>
					<Textarea
						id="settings-bio"
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						rows={4}
						placeholder="A short line about your role or focus…"
						className="resize-y border-border/60"
					/>
				</div>
				<div className="flex justify-end pt-2">
					<Button
						type="button"
						variant="outline"
						className={modalButtonConfirmClass}
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "Saving…" : "Save changes"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
