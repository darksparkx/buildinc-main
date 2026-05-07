"use client";

import { Button } from "@/components/base/ui/button";
import { Textarea } from "@/components/base/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import {
	addTaskCommentWithMentions,
	listTaskComments,
} from "@/lib/middleware/taskComments";
import { IProjectProfile, ITaskCommentDB } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquareText, Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export function TaskCommentsSection({
	taskId,
	authorId,
	projectMembers,
}: {
	taskId: string;
	authorId: string;
	projectMembers: IProjectProfile[];
}) {
	const [comments, setComments] = useState<ITaskCommentDB[]>([]);
	const [body, setBody] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const load = async () => {
		try {
			const rows = await listTaskComments(taskId);
			setComments(rows);
		} catch (e) {
			console.error(e);
			toast.error("Could not load comments.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, [taskId]);

	useEffect(() => {
		const supabase = createClient();
		const channel = supabase
			.channel(`task-comments-${taskId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "task_comments",
					filter: `taskId=eq.${taskId}`,
				},
				() => {
					void load();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [taskId]);

	const handleSubmit = async () => {
		const trimmed = body.trim();
		if (!trimmed) return;
		setSubmitting(true);
		try {
			await addTaskCommentWithMentions(
				taskId,
				authorId,
				trimmed,
				projectMembers,
			);
			setBody("");
			await load();
			toast.success("Comment posted.");
		} catch (e) {
			console.error(e);
			toast.error("Could not post comment.");
		} finally {
			setSubmitting(false);
		}
	};

	const authorName = (id: string) =>
		getAllProfilesFromStore().find((p) => p.id === id)?.name ?? "Someone";

	return (
		<section className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_1px_0_0_hsl(var(--border)_/_0.35)] backdrop-blur-sm dark:border-border dark:bg-card/85 dark:shadow-[0_1px_0_0_hsl(var(--border)_/_0.2)]">
			<div className="border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-7 dark:bg-muted/10">
				<h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
					<span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
						<MessageSquareText className="h-3.5 w-3.5" aria-hidden />
					</span>
					Discussion
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					<span className="rounded border border-border/70 bg-muted/40 px-1.5 py-px font-mono text-[11px]">
						@Name
					</span>{" "}
					in a comment notifies that person via the inbox.
				</p>
			</div>

			<div className="space-y-5 px-5 py-6 sm:px-7 sm:py-8">
				{loading ? (
					<div className="flex justify-center py-10">
						<Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
					</div>
				) : comments.length === 0 ? (
					<p className="rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-12 text-center text-sm text-muted-foreground">
						No comments yet. Start the thread below.
					</p>
				) : (
					<ul className="max-h-[min(50vh,24rem)] space-y-0 divide-y divide-border/60 overflow-y-auto rounded-lg border border-border/70">
						{comments.map((c) => (
							<li
								key={c.id}
								className="px-4 py-4 first:pt-3 last:pb-3 sm:px-5"
							>
								<div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
									<span className="text-sm font-semibold text-foreground">
										{authorName(c.authorId)}
									</span>
									<span className="text-[12px] tabular-nums text-muted-foreground">
										{formatDistanceToNow(new Date(c.created_at), {
											addSuffix: true,
										})}
									</span>
								</div>
								<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
									{c.body}
								</p>
							</li>
						))}
					</ul>
				)}

				<div className="space-y-3 pt-1">
					<Textarea
						placeholder="Write a comment…"
						value={body}
						onChange={(e) => setBody(e.target.value)}
						rows={3}
						className="min-h-[4.5rem] resize-y rounded-lg border-border/80 bg-background"
						disabled={submitting}
					/>
					<Button
						type="button"
						onClick={() => void handleSubmit()}
						disabled={submitting || !body.trim()}
						variant="secondary"
						className="h-10 gap-2 rounded-lg font-medium"
					>
						{submitting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
								Posting…
							</>
						) : (
							<>
								<Send className="h-4 w-4" aria-hidden />
								Post comment
							</>
						)}
					</Button>
				</div>
			</div>
		</section>
	);
}
