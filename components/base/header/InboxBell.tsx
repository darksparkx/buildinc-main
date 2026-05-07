"use client";

import ApprovalModal from "@/components/approvals/ApprovalModal";
import { Badge } from "@/components/base/ui/badge";
import { Button } from "@/components/base/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/base/ui/popover";
import { getDetailsForRequest } from "@/lib/functions/requests";
import {
	inboxActionRequiredCount,
	inboxItemSubtitle,
	inboxItemTitle,
	partitionInboxRequests,
} from "@/lib/notifications/inboxFeed";
import { getRequestsByUserId } from "@/lib/middleware/requests";
import {
	getUnreadMentionNotificationCount,
	listUnreadMentionNotifications,
	markMentionNotificationRead,
} from "@/lib/middleware/commentMentions";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";
import { useRequestStore } from "@/lib/store/requestStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/base/ui/tabs";
import { ICommentMentionNotificationDB, IProfile, IRequest } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

function TabCount({ n }: { n: number }) {
	if (n <= 0) return null;
	return (
		<span className="rounded-md bg-background/90 px-1.5 py-px text-[11px] font-semibold tabular-nums ring-1 ring-border/60 dark:bg-secondary/80">
			{n > 99 ? "99+" : n}
		</span>
	);
}

type InboxTab = "inbox" | "sent" | "history";

export function InboxBell({ profile }: { profile: IProfile }) {
	const requestsRecord = useRequestStore((s) => s.requests);
	const [open, setOpen] = useState(false);
	const [inboxTab, setInboxTab] = useState<InboxTab>("inbox");
	const [refreshing, setRefreshing] = useState(false);
	const [selectedApproval, setSelectedApproval] = useState<IRequest | null>(
		null,
	);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [comment, setComment] = useState("");
	const [mentions, setMentions] = useState<ICommentMentionNotificationDB[]>([]);
	const [mentionBadgeCount, setMentionBadgeCount] = useState(0);

	const requests = useMemo(
		() => Object.values(requestsRecord),
		[requestsRecord],
	);

	const sections = useMemo(
		() => partitionInboxRequests(profile.id, requests),
		[profile.id, requests],
	);

	const actionCount = useMemo(
		() => inboxActionRequiredCount(profile.id, requests),
		[profile.id, requests],
	);

	const badgeTotal = actionCount + mentionBadgeCount;

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const n = await getUnreadMentionNotificationCount(profile.id);
				if (!cancelled) setMentionBadgeCount(n);
			} catch (e) {
				console.error("[InboxBell] mention count:", e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [profile.id]);

	useEffect(() => {
		if (!open) {
			void (async () => {
				try {
					const n = await getUnreadMentionNotificationCount(profile.id);
					setMentionBadgeCount(n);
				} catch {
					/* ignore */
				}
			})();
		}
	}, [open, profile.id]);

	useEffect(() => {
		if (!open) return;

		let cancelled = false;
		(async () => {
			setRefreshing(true);
			try {
				await getRequestsByUserId(profile.id);
				const m = await listUnreadMentionNotifications(profile.id);
				if (cancelled) return;
				setMentions(m);
				setMentionBadgeCount(m.length);

				const reqs = Object.values(useRequestStore.getState().requests);
				const s = partitionInboxRequests(profile.id, reqs);
				if (m.length > 0 || s.actionRequired.length > 0)
					setInboxTab("inbox");
				else if (s.waitingOnOthers.length > 0) setInboxTab("sent");
				else if (s.recent.length > 0) setInboxTab("history");
				else setInboxTab("inbox");
			} catch (e) {
				console.error("[InboxBell] refresh failed:", e);
			} finally {
				if (!cancelled) setRefreshing(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [open, profile.id]);

	const renderMentionRows = () =>
		mentions.map((n) => {
			const actor =
				getAllProfilesFromStore().find((p) => p.id === n.actorId)?.name ??
				"Someone";
			const taskTitle =
				useTaskStore.getState().tasks[n.taskId]?.name ?? "a task";
			return (
				<Link
					key={n.id}
					href={`/tasks/${n.taskId}`}
					onClick={() => {
						void markMentionNotificationRead(n.id, profile.id);
						setOpen(false);
					}}
					className="flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-muted/80 dark:hover:bg-muted/50"
				>
					<span className="font-medium leading-snug text-foreground">
						{actor} mentioned you
					</span>
					<span className="line-clamp-2 text-xs text-muted-foreground">
						{taskTitle}
					</span>
					<span className="text-[13px] text-muted-foreground tabular-nums">
						{formatDistanceToNow(new Date(n.created_at), {
							addSuffix: true,
						})}
					</span>
				</Link>
			);
		});

	const openRequestModal = (req: IRequest) => {
		const raw =
			useRequestStore.getState().getRequest(req.id) ?? req;
		const copy = { ...raw } as IRequest;
		getDetailsForRequest(copy);
		setSelectedApproval(copy);
		setComment("");
		setOpen(false);
		setIsDetailDialogOpen(true);
	};

	const renderRows = (items: IRequest[]) =>
		items.map((req) => {
			const raw =
				useRequestStore.getState().getRequest(req.id) ?? req;
			const row = { ...raw } as IRequest;
			getDetailsForRequest(row);
			return (
				<button
					key={req.id}
					type="button"
					onClick={() => openRequestModal(req)}
					className="flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-muted/80 dark:hover:bg-muted/50"
				>
					<span className="font-medium leading-snug text-foreground">
						{inboxItemTitle(row)}
					</span>
					<span className="line-clamp-2 text-xs text-muted-foreground">
						{inboxItemSubtitle(row, profile.id)}
					</span>
					<span className="text-[13px] text-muted-foreground tabular-nums">
						{formatDistanceToNow(new Date(req.created_at), {
							addSuffix: true,
						})}
					</span>
				</button>
			);
		});

	const empty =
		sections.actionRequired.length === 0 &&
		sections.waitingOnOthers.length === 0 &&
		sections.recent.length === 0 &&
		mentionBadgeCount === 0;

	const emptyTabCopy = {
		inbox: "Nothing needs your approval right now.",
		sent: "No outgoing requests waiting on someone else.",
		history: "No recent completed or rejected requests yet.",
	} as const;

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="relative h-9 w-9 shrink-0 text-foreground"
						aria-label="Notifications"
					>
						<Bell className="h-5 w-5" aria-hidden />
						{badgeTotal > 0 ? (
							<Badge
								variant="default"
								className="absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center px-1 text-[12px] tabular-nums"
							>
								{badgeTotal > 99 ? "99+" : badgeTotal}
							</Badge>
						) : null}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[min(100vw-2rem,22rem)] max-w-[22rem] overflow-hidden rounded-xl border border-border bg-background p-0 text-foreground shadow-xl shadow-black/[0.07] ring-1 ring-black/[0.03] dark:bg-background dark:shadow-black/40 dark:ring-white/[0.06]"
					align="end"
					sideOffset={8}
				>
					<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
						<span className="text-sm font-semibold tracking-tight">
							Notifications
						</span>
						{refreshing ? (
							<Loader2
								className="h-4 w-4 animate-spin text-muted-foreground"
								aria-hidden
							/>
						) : null}
					</div>
					<div className="max-h-[min(70vh,24rem)]">
						{empty ? (
							<p className="mx-2 mb-2 mt-1 rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-9 text-center text-sm text-muted-foreground dark:bg-muted/10">
								No notifications yet. Invites and approvals will
								show up here.
							</p>
						) : (
							<Tabs
								value={inboxTab}
								onValueChange={(v) =>
									setInboxTab(v as InboxTab)
								}
								className="gap-0"
							>
								<TabsList className="mx-2 mt-2 grid h-auto w-auto grid-cols-3 gap-0.5 rounded-lg bg-muted/80 p-1">
									<TabsTrigger
										value="inbox"
										className="gap-1 px-1.5 py-2 text-xs"
									>
										<span className="truncate">Inbox</span>
										<TabCount
											n={
												sections.actionRequired.length +
												mentionBadgeCount
											}
										/>
									</TabsTrigger>
									<TabsTrigger
										value="sent"
										className="gap-1 px-1.5 py-2 text-xs"
									>
										<span className="truncate">Sent</span>
										<TabCount n={sections.waitingOnOthers.length} />
									</TabsTrigger>
									<TabsTrigger
										value="history"
										className="gap-1 px-1.5 py-2 text-xs"
									>
										<span className="truncate">History</span>
										<TabCount n={sections.recent.length} />
									</TabsTrigger>
								</TabsList>
								<TabsContent value="inbox" className="mt-0" role="list">
									<div className="max-h-[min(65vh,21rem)] overflow-y-auto px-1.5 pb-2 pt-1">
										{mentions.length > 0 ? (
											<div className="mb-1 space-y-0.5">
												{renderMentionRows()}
											</div>
										) : null}
										{sections.actionRequired.length > 0
											? renderRows(sections.actionRequired)
											: null}
										{mentions.length === 0 &&
										sections.actionRequired.length === 0 ? (
											<p className="mx-2 rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-8 text-center text-sm text-muted-foreground">
												{emptyTabCopy.inbox}
											</p>
										) : null}
									</div>
								</TabsContent>
								<TabsContent value="sent" className="mt-0" role="list">
									<div className="max-h-[min(65vh,21rem)] overflow-y-auto px-1.5 pb-2 pt-1">
										{sections.waitingOnOthers.length > 0 ? (
											renderRows(sections.waitingOnOthers)
										) : (
											<p className="mx-2 rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-8 text-center text-sm text-muted-foreground">
												{emptyTabCopy.sent}
											</p>
										)}
									</div>
								</TabsContent>
								<TabsContent value="history" className="mt-0" role="list">
									<div className="max-h-[min(65vh,21rem)] overflow-y-auto px-1.5 pb-2 pt-1">
										{sections.recent.length > 0 ? (
											renderRows(sections.recent)
										) : (
											<p className="mx-2 rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-8 text-center text-sm text-muted-foreground">
												{emptyTabCopy.history}
											</p>
										)}
									</div>
								</TabsContent>
							</Tabs>
						)}
					</div>
					<div className="border-t border-border px-2 py-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-9 w-full rounded-lg text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground"
							asChild
						>
							<Link href="/approvals">Open approvals</Link>
						</Button>
					</div>
				</PopoverContent>
			</Popover>

			<ApprovalModal
				isDetailDialogOpen={isDetailDialogOpen}
				setIsDetailDialogOpen={setIsDetailDialogOpen}
				selectedApproval={selectedApproval}
				setComment={setComment}
				comment={comment}
				profile={profile}
			/>
		</>
	);
}
