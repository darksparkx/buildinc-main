import { Avatar, AvatarFallback } from "@/components/base/ui/avatar";
import { Badge } from "@/components/base/ui/badge";
import { Button } from "@/components/base/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/base/ui/dialog";
import { Label } from "@/components/base/ui/label";
import { IMaterial, ITask } from "@/lib/types";
import { modalButtonConfirmClass } from "@/lib/functions/modalButtonStyles";
import { completeTask, projectDetails } from "@/lib/functions/projectDetails";
import { getStatusColor } from "@/lib/functions/utils";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import { Package } from "lucide-react";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import {
	getMaterialsById,
	getTaskMaterials,
	getTaskMaterialsFromStore,
} from "@/lib/middleware/materials";
import { getAllProfilesFromStore } from "@/lib/middleware/profiles";

interface TaskDetailModalProps {
	isTaskDetailOpen: boolean;
	setIsTaskDetailOpen: Dispatch<SetStateAction<boolean>>;
	selectedTask: ITask | null;
	setIsAssignTaskOpen: Dispatch<SetStateAction<boolean>>;
}

const TaskDetailModal = ({
	isTaskDetailOpen,
	setIsTaskDetailOpen,
	selectedTask,
	setIsAssignTaskOpen,
}: // setTasks,
TaskDetailModalProps) => {
	// // console.log(selectedTask);
	const materials = getTaskMaterialsFromStore(selectedTask?.id || "");
	const assignedToProfile = getAllProfilesFromStore().find(
		(profile) => profile.id === selectedTask?.assignedTo
	);
	return (
		<Dialog
			open={isTaskDetailOpen}
			onOpenChange={setIsTaskDetailOpen}
		>
			<DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{selectedTask?.name}</DialogTitle>
					<DialogDescription>
						Task details and management
					</DialogDescription>
				</DialogHeader>
				{selectedTask && (
					<div className="space-y-4">
						<div className="space-y-2">
							<Label className="text-sm font-semibold text-muted-foreground">
								Description
							</Label>
							<p className="text-sm">
								{selectedTask.description}
							</p>
						</div>
						<div className="grid sm:grid-cols-3 gap-4 grid-cols-1">
							<div className=" flex  items-center gap-2">
								<Label className="text-sm font-semibold text-muted-foreground">
									Status:
								</Label>
								<Badge
									className={` ${getStatusColor(
										selectedTask.status
									)}`}
									variant="secondary"
								>
									{selectedTask.status}
								</Badge>
							</div>
							<div className=" flex  items-center gap-2">
								<Label className="text-sm font-semibold text-muted-foreground">
									Estimated:
								</Label>
								<p className="text-sm">
									{selectedTask.estimatedDuration} Days
								</p>
							</div>
							{selectedTask.status !== "Inactive" && (
								<div className="flex items-center gap-2">
									<Label className="text-sm font-semibold text-muted-foreground">
										Due Date
									</Label>
									<p className="text-sm">
										{formatCalendarDate(
											new Date(
												Date.now() +
													selectedTask.estimatedDuration *
														24 *
														60 *
														60 *
														1000,
											),
										)}
									</p>
								</div>
							)}
						</div>
						{selectedTask.assignedTo && (
							<div className="space-y-1">
								<Label className="text-sm font-semibold text-muted-foreground">
									Assigned To
								</Label>
								<div className="flex items-center gap-2">
									<Avatar className="h-6 w-6">
										<AvatarFallback className="text-xs"></AvatarFallback>
									</Avatar>
									<span className="text-sm">
										{assignedToProfile
											? `${assignedToProfile.name}`
											: "Unknown User"}
									</span>
								</div>
							</div>
						)}

						{/* Materials Section */}
						{materials && materials.length > 0 && (
							<div className="space-y-2">
								<Label className="text-sm font-semibold text-muted-foreground">
									Required Materials:
								</Label>
								<div className="space-y-2">
									{/* Table Headers */}
									<div className="grid grid-cols-10 items-center text-xs font-semibold text-muted-foreground px-3">
										<div className="col-span-5">Name</div>
										<div className="col-span-3">
											{selectedTask.status === "Inactive"
												? "Planned"
												: "Planned / Used"}
										</div>
										{selectedTask.status !== "Inactive" ? (
											<div className="col-span-2 text-right">
												Cost till now
											</div>
										) : (
											<div className="col-span-2 text-right">
												Estimated Cost
											</div>
										)}
									</div>
									{materials.map(
										(
											material: IMaterial,
											index: number
										) => (
											<div
												key={index}
												className="grid grid-cols-10 items-center text-sm bg-slate-50 p-3 rounded"
											>
												<div className="col-span-5 flex items-center gap-2">
													<Package className="h-4 w-4 text-slate-400" />
													<span className="font-medium">
														{material.name}
													</span>
												</div>
												<div className="col-span-3 flex items-center text-slate-600">
													{selectedTask.status ===
													"Inactive" ? (
														<span>
															{
																material.plannedQuantity
															}{" "}
															{material.unit}
														</span>
													) : (
														<span>
															{
																material.plannedQuantity
															}{" "}
															/{" "}
															{material.usedQuantity ??
																0}{" "}
															{material.unit}
														</span>
													)}
												</div>
												{selectedTask.status ===
												"Inactive" ? (
													<div className="col-span-2 flex items-center font-medium justify-end">
														{(
															material.plannedQuantity *
															material.unitCost
														).toLocaleString(
															"en-IN"
														)}{" "}
														&nbsp;₹
													</div>
												) : (
													<div className="col-span-2 flex items-center font-medium justify-end">
														{(
															(material.usedQuantity ??
																0) *
															material.unitCost
														).toLocaleString(
															"en-IN"
														)}{" "}
														&nbsp;₹
													</div>
												)}
											</div>
										)
									)}
								</div>
							</div>
						)}

						{selectedTask.completionNotes && (
							<div className="space-y-1">
								<Label className="text-sm font-semibold text-muted-foreground">
									Completion Notes
								</Label>
								<p className="text-sm bg-slate-50 p-3 rounded">
									{selectedTask.completionNotes}
								</p>
							</div>
						)}
					</div>
				)}
				<DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:gap-2">
					{selectedTask &&
						selectedTask.status !== "Inactive" &&
						selectedTask.status !== "Pending" && (
							<Button
								type="button"
								variant="secondary"
								className="w-full sm:mr-auto sm:w-auto"
								asChild
							>
								<Link href={`/tasks/${selectedTask.id}`}>Go to task</Link>
							</Button>
						)}
					{/* {selectedTask?.status === "Reviewing" && (
						<div className="flex gap-2">
							<Button
								variant="outline"
								// onClick={() =>
								// 	// rejectTask(
								// 	// 	selectedTask.id,
								// 	// 	// setTasks,
								// 	// 	setIsTaskDetailOpen
								// 	// )
								// }
							>
								Request Changes
							</Button>
							<Button
								className="bg-secondary text-secondary-foreground ring-1 ring-border/50 hover:brightness-110 dark:ring-border"
								onClick={() =>
									completeTask(
										selectedTask.id,
										setIsTaskDetailOpen
									)
								}
							>
								Complete Task
							</Button>
						</div>
					)} */}
					{selectedTask?.status === "Inactive" && (
						<Button
							type="button"
							variant="outline"
							className={modalButtonConfirmClass}
							onClick={() => {
								setIsTaskDetailOpen(false);
								setIsAssignTaskOpen(true);
							}}
						>
							Assign task
						</Button>
					)}
					{/* <Button
						variant="outline"
						onClick={() => setIsTaskDetailOpen(false)}
					>
						Close
					</Button> */}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default TaskDetailModal;
