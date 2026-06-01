"use client";

import { Button } from "@/components/base/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/base/ui/tooltip";
import { useStatisticsDataAccess } from "@/lib/hooks/useStatisticsDataAccess";
import {
	downloadCsvFile,
	parseProjectBudgetImportCsv,
} from "@/lib/statistics/exportCsv";
import { updateProject } from "@/lib/middleware/projects";
import { useProjectStore } from "@/lib/store/projectStore";
import { Download, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
	onExport: () => { filename: string; csv: string };
	/** Limit import to these project ids (e.g. single project or org). Omit for all visible projects. */
	importProjectIds?: string[];
	className?: string;
};

export default function StatisticsDataToolbar({
	onExport,
	importProjectIds,
	className,
}: Props) {
	const { canExport, canImport } = useStatisticsDataAccess();
	const fileRef = useRef<HTMLInputElement>(null);
	const [importing, setImporting] = useState(false);

	const handleExport = () => {
		if (!canExport) return;
		const { filename, csv } = onExport();
		downloadCsvFile(filename, csv);
		toast.success("Statistics exported");
	};

	const handleImportFile = async (file: File) => {
		if (!canImport) return;
		setImporting(true);
		try {
			const text = await file.text();
			const { rows, errors } = parseProjectBudgetImportCsv(text);
			if (errors.length > 0 && rows.length === 0) {
				toast.error(errors[0] ?? "Could not parse file");
				return;
			}

			const projects = useProjectStore.getState().projects;
			const allowed = importProjectIds
				? new Set(importProjectIds)
				: null;

			let applied = 0;
			let skipped = 0;

			for (const row of rows) {
				if (allowed && !allowed.has(row.projectId)) {
					skipped += 1;
					continue;
				}
				if (!projects[row.projectId]) {
					skipped += 1;
					continue;
				}
				await updateProject(row.projectId, {
					budget: row.budget,
					spent: row.spent,
				});
				applied += 1;
			}

			if (applied === 0) {
				toast.error(
					skipped > 0
						? "No matching projects in this view were updated."
						: "No rows could be applied.",
				);
				return;
			}

			const detail =
				skipped > 0
					? ` Updated ${applied} project(s); ${skipped} row(s) skipped.`
					: ` Updated ${applied} project(s).`;
			if (errors.length > 0) {
				toast.warning(`${errors.length} row warning(s).${detail}`);
			} else {
				toast.success(`Import complete.${detail}`);
			}
		} catch (e) {
			console.error(e);
			toast.error("Import failed");
		} finally {
			setImporting(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	};

	if (!canExport && !canImport) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline" size="sm" disabled className={className}>
							<Download className="mr-2 h-4 w-4" aria-hidden />
							Export CSV
						</Button>
					</TooltipTrigger>
					<TooltipContent className="max-w-xs text-pretty">
						CSV export is available on Professional and Enterprise.{" "}
						<Link href="/billing" className="underline font-medium">
							Upgrade billing
						</Link>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<div
			className={className ? `flex flex-wrap items-center gap-2 ${className}` : "flex flex-wrap items-center gap-2"}
		>
			<Button variant="outline" size="sm" onClick={handleExport}>
				<Download className="mr-2 h-4 w-4" aria-hidden />
				Export CSV
			</Button>
			{canImport ? (
				<>
					<input
						ref={fileRef}
						type="file"
						accept=".csv,text/csv"
						className="hidden"
						onChange={(e) => {
							const f = e.target.files?.[0];
							if (f) void handleImportFile(f);
						}}
					/>
					<Button
						variant="outline"
						size="sm"
						disabled={importing}
						onClick={() => fileRef.current?.click()}
					>
						<Upload className="mr-2 h-4 w-4" aria-hidden />
						{importing ? "Importing…" : "Import CSV"}
					</Button>
				</>
			) : null}
		</div>
	);
}
