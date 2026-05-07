import { TabsTriggerList } from "@/components/base/general/TabsTriggerList";
import { Badge } from "@/components/base/ui/badge";
import { Button } from "@/components/base/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/base/ui/dialog";
import { Tabs } from "@/components/base/ui/tabs";
import {
	modalButtonConfirmClass,
	modalButtonNeutralSplitClass,
} from "@/lib/functions/modalButtonStyles";
import { taskStatusBadgeVariant } from "@/lib/functions/taskStatusUi";
import { cn } from "@/lib/functions/utils";
import { getTaskMaterialsFromStore } from "@/lib/middleware/materials";
import { ITask } from "@/lib/types";
import { CheckCircle } from "lucide-react";
import TaskDetails from "./TaskDetails";
import TaskMaterials from "./TaskMaterials";

const TaskDetailModal = ({
	isTaskDetailOpen,
	setIsTaskDetailOpen,
	selectedTask,
	setIsPaymentModalOpen,
	setIsMaterialModalOpen,
	setIsCompleteModalOpen,
}: {
	isTaskDetailOpen: boolean;
	setIsTaskDetailOpen: (open: boolean) => void;
	selectedTask: ITask | undefined;
	setIsPaymentModalOpen: (open: boolean) => void;
	setIsMaterialModalOpen: (open: boolean) => void;
	setIsCompleteModalOpen: (open: boolean) => void;
}) => {
	const materials = getTaskMaterialsFromStore(selectedTask?.id || "");
	const projectName = selectedTask?.projectName ?? "";

	const values =
		materials && materials.length > 0
			? [
					{ value: "details", label: "Details" },
					{ value: "materials", label: "Materials" },
				]
			: [{ value: "details", label: "Details" }];

	return (
		<Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
			<DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-[700px]">
				<DialogHeader className="shrink-0 space-y-2 border-b border-border/60 px-6 pb-4 pt-6">
					<div className="flex flex-wrap items-start gap-2 gap-y-2">
						<DialogTitle className="text-left text-xl leading-tight">
							{selectedTask?.name}
						</DialogTitle>
						{selectedTask ? (
							<Badge
								variant={taskStatusBadgeVariant(selectedTask.status)}
								className="capitalize"
							>
								{selectedTask.status}
							</Badge>
						) : null}
					</div>
					<DialogDescription className="hidden text-left lg:block">
						{projectName ? `${projectName} · ` : null}
						Actions and information for this task
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-h-0 flex-1 flex-col">
					{selectedTask && (
						<Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col">
							<div className="shrink-0 border-b border-border/40 bg-background px-6 py-2">
								<TabsTriggerList
									triggers={values}
									className="overflow-x-auto sm:overflow-visible"
								/>
							</div>

							<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
								<TaskDetails
									selectedTask={selectedTask}
									projectName={projectName}
									projectHref={
										selectedTask.projectId
											? `/projects/${selectedTask.projectId}`
											: undefined
									}
								/>

								{materials && materials.length > 0 && (
									<TaskMaterials materials={materials} />
								)}
							</div>
						</Tabs>
					)}
				</div>

				{selectedTask?.status === "Active" && (
					<div className="flex shrink-0 flex-col gap-3 border-t border-border/60 px-6 py-4">
						<div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-stretch">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsTaskDetailOpen(false);
									setIsPaymentModalOpen(true);
								}}
								className={modalButtonNeutralSplitClass}
							>
								Request payment
							</Button>
							{materials && materials.length > 0 && (
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsTaskDetailOpen(false);
										setIsMaterialModalOpen(true);
									}}
									className={modalButtonNeutralSplitClass}
								>
									Request material
								</Button>
							)}
						</div>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsCompleteModalOpen(true);
								setIsTaskDetailOpen(false);
							}}
							className={cn(
								modalButtonConfirmClass,
								"w-full sm:w-full sm:min-w-0",
							)}
						>
							<CheckCircle className="h-4 w-4" aria-hidden />
							Mark as complete
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default TaskDetailModal;
