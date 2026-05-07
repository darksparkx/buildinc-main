import React from "react";
import {
	Calendar as CalendarIcon,
	Clock,
	MapPin,
	IndianRupee,
} from "lucide-react";
import { Card, CardContent } from "@/components/base/ui/card";
import { Input } from "@/components/base/ui/input";
import { Label } from "@/components/base/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/base/ui/select";
import { Textarea } from "@/components/base/ui/textarea";
import { Calendar } from "@/components/base/ui/calendar";
import { Button } from "@/components/base/ui/button";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
} from "@/components/base/ui/dialog";
import { cn, getEstimatedDuration } from "@/lib/functions/utils";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";
import {
	IOrganisation,
	IOrganisationProfile,
	IProjectCreationData,
} from "@/lib/types";

interface projectDetailsProps {
	projectData: IProjectCreationData;
	setProjectData: React.Dispatch<React.SetStateAction<IProjectCreationData>>;
	organisations: IOrganisation[];
	supervisors: IOrganisationProfile[];
	validationErrors: Record<string, string>;
	setValidationErrors: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
}

const ProjectDetails: React.FC<projectDetailsProps> = ({
	projectData,
	setProjectData,
	organisations,
	supervisors,
	validationErrors,
	setValidationErrors,
}) => {
	const [startDialogOpen, setStartDialogOpen] = React.useState(false);
	const [endDialogOpen, setEndDialogOpen] = React.useState(false);

	const handleChange = (field: string, value: string | number | Date) => {
		setProjectData((prev) => ({ ...prev, [field]: value }));

		// Remove error for this field when the user types/selects a valid value
		if (validationErrors[field]) {
			setValidationErrors((prev) => {
				const copy = { ...prev };
				delete copy[field];
				return copy;
			});
		}
	};

	const inputClass =
		"h-11 border-border/60 bg-background/80 shadow-sm ring-1 ring-border/30 focus-visible:ring-2 focus-visible:ring-ring";

	return (
		<Card className="border-border/60 bg-background/80 pt-2 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
			<CardContent className="space-y-6 pb-6 pt-6">
				{/* Row 1: Name & Organisation */}
				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="project-name">Project Name</Label>
						<Input
							id="project-name"
							placeholder="Enter project name"
							value={projectData.name}
							onChange={(e) =>
								handleChange("name", e.target.value)
							}
							className={inputClass}
						/>
						{validationErrors.name && (
							<p className="text-sm text-destructive">
								{validationErrors.name}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="organisation">Organisation </Label>
						<Select
							value={
								projectData.organisationId
									? projectData.organisationId.toString()
									: ""
							}
							onValueChange={(value) =>
								handleChange("organisationId", value)
							}
						>
							<SelectTrigger className={inputClass + " w-full"}>
								<SelectValue placeholder="Select organisation" />
							</SelectTrigger>

							<SelectContent>
								{organisations.map((org) => (
									<SelectItem
										key={org.id}
										value={org.id.toString()}
									>
										{org.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{(validationErrors.organisation ||
							validationErrors.organisationId) && (
							<p className="text-sm text-destructive">
								{validationErrors.organisation ||
									validationErrors.organisationId}
							</p>
						)}
					</div>
				</div>

				{/* Row 2: Supervisor & Budget */}
				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="supervisor">Project Supervisor</Label>
						<Select
							value={projectData.supervisor}
							onValueChange={(value) => {
								const sup = supervisors.find(
									(s) => s.id === value
								);
								if (sup) {
									handleChange("supervisor", sup.id);
									handleChange("supervisorName", sup.name);
								}
							}}
						>
							<SelectTrigger className={inputClass + " w-full"}>
								<SelectValue placeholder="Select supervisor" />
							</SelectTrigger>
							<SelectContent>
								{supervisors.map((sup) => (
									<SelectItem
										key={sup.id}
										value={sup.id}
									>
										{sup.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{validationErrors.supervisor && (
							<p className="text-sm text-destructive">
								{validationErrors.supervisor}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="budget">Budget</Label>
						<div className="relative w-full">
							<IndianRupee className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="budget"
								type="text"
								placeholder="0"
								value={
									projectData.budget
										? new Intl.NumberFormat("en-IN").format(
												projectData.budget
										  )
										: ""
								}
								onChange={(e) => {
									const raw = e.target.value.replace(
										/,/g,
										""
									); // remove commas
									const num = Number.parseInt(raw) || 0;
									handleChange("budget", num);
								}}
								className={cn("w-full pl-8", inputClass)}
							/>
						</div>
						{validationErrors.budget && (
							<p className="text-sm text-destructive">
								{validationErrors.budget}
							</p>
						)}
					</div>
				</div>

				{/* Row 3: Description */}
				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						placeholder="Describe the project..."
						rows={3}
						value={projectData.description}
						onChange={(e) =>
							handleChange("description", e.target.value)
						}
						className={cn("min-h-[88px] resize-y", inputClass)}
					/>
					{validationErrors.description && (
						<p className="text-sm text-destructive">
							{validationErrors.description}
						</p>
					)}
				</div>

				{/* Row 4: Start & End Dates */}
				<div className="grid gap-6 md:grid-cols-2">
					{/* Start Date */}
					<div className="space-y-1">
						<Label htmlFor="start-date">Start Date</Label>
						<Dialog
							open={startDialogOpen}
							onOpenChange={setStartDialogOpen}
						>
							<DialogTitle></DialogTitle>

							<DialogTrigger asChild>
								<Button
									variant="outline"
									type="button"
									className={cn(
										"h-11 w-full justify-start border-border/60 bg-background/80 text-left font-normal shadow-sm ring-1 ring-border/30 transition-colors",
										"hover:border-blue-500/35 hover:bg-blue-500/[0.05] dark:hover:bg-blue-950/30",
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
									{projectData.startDate
										? formatCalendarDate(projectData.startDate)
										: "Pick a date"}
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px] p-6">
								<Calendar
									className="w-full"
									mode="single"
									selected={
										projectData.startDate || undefined
									}
									onSelect={(date) => {
										if (!date) return;
										handleChange("startDate", date);
										setStartDialogOpen(false);
									}}
								/>
							</DialogContent>
						</Dialog>
						{validationErrors.startDate && (
							<p className="text-sm text-destructive">
								{validationErrors.startDate}
							</p>
						)}
					</div>

					{/* End Date */}
					<div className="space-y-1">
						<Label htmlFor="end-date">End Date</Label>
						<Dialog
							open={endDialogOpen}
							onOpenChange={setEndDialogOpen}
						>
							<DialogTitle></DialogTitle>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									type="button"
									className={cn(
										"h-11 w-full justify-start border-border/60 bg-background/80 text-left font-normal shadow-sm ring-1 ring-border/30 transition-colors",
										"hover:border-blue-500/35 hover:bg-blue-500/[0.05] dark:hover:bg-blue-950/30",
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
									{projectData.endDate
										? formatCalendarDate(projectData.endDate)
										: "Pick a date"}
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px] p-6">
								<Calendar
									className="w-full"
									mode="single"
									selected={projectData.endDate || undefined}
									onSelect={(date) => {
										if (!date) return;
										handleChange("endDate", date);
										setEndDialogOpen(false);
									}}
								/>
							</DialogContent>
						</Dialog>
						{validationErrors.endDate && (
							<p className="text-sm text-destructive">
								{validationErrors.endDate}
							</p>
						)}
					</div>
				</div>

				{/* Row 5: Duration */}
				{projectData.startDate && projectData.endDate && (
					<div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-sm ring-1 ring-border/30">
						<Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
						<p className="text-foreground">
							Project Duration:{" "}
							{getEstimatedDuration(
								projectData.startDate,
								projectData.endDate
							)}{" "}
							days
						</p>
					</div>
				)}

				{/* Row 6: Location */}
				<div className="space-y-2">
					<Label htmlFor="location">Location</Label>
					<div className="relative">
						<MapPin className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="location"
							placeholder="Enter project location"
							value={projectData.location}
							onChange={(e) =>
								handleChange("location", e.target.value)
							}
							className={cn("w-full pl-10", inputClass)}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ProjectDetails;
