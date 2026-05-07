import { Label } from "@/components/base/ui/label";
import { TabsContent } from "@/components/base/ui/tabs";
import { RupeeIcon } from "@/lib/functions/utils";
import { IMaterial } from "@/lib/types";
import { Package } from "lucide-react";

const materialsInnerSheet = (materials: IMaterial[]) => (
	<div className="space-y-3">
		{materials.map((material: IMaterial, index: number) => (
			<div
				key={material.id ?? index}
				className="space-y-3 rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm ring-1 ring-border/40"
			>
				<div className="flex items-center gap-2 text-sm font-medium">
					<Package
						className="h-4 w-4 shrink-0 text-muted-foreground"
						aria-hidden
					/>
					<span className="truncate">{material.name}</span>
				</div>
				<div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">Planned</Label>
						<p className="font-medium tabular-nums">
							{material.plannedQuantity} {material.unit}
						</p>
					</div>
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">Used</Label>
						<p className="font-medium tabular-nums">
							{material.usedQuantity} {material.unit}
						</p>
					</div>
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">Line cost</Label>
						<p className="font-medium tabular-nums">
							{(material.usedQuantity * material.unitCost).toFixed(0)}{" "}
							<RupeeIcon />
						</p>
					</div>
				</div>
			</div>
		))}
	</div>
);

const materialsInnerPage = (materials: IMaterial[]) => (
	<ol className="space-y-0 divide-y divide-border/70 rounded-lg border border-border/70">
		{materials.map((material: IMaterial, index: number) => (
			<li
				key={material.id ?? index}
				className="flex flex-col gap-4 p-5 first:rounded-t-lg last:rounded-b-lg sm:flex-row sm:items-start sm:justify-between sm:gap-8"
			>
				<div className="flex min-w-0 flex-1 gap-3">
					<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted/40 text-xs font-semibold tabular-nums text-muted-foreground">
						{index + 1}
					</span>
					<div className="min-w-0">
						<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
							<Package
								className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
								aria-hidden
							/>
							<span className="truncate">{material.name}</span>
						</div>
					</div>
				</div>
				<dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
					<div>
						<dt className="text-xs font-medium text-muted-foreground">Planned</dt>
						<dd className="mt-0.5 font-medium tabular-nums">
							{material.plannedQuantity} {material.unit}
						</dd>
					</div>
					<div>
						<dt className="text-xs font-medium text-muted-foreground">Used</dt>
						<dd className="mt-0.5 font-medium tabular-nums">
							{material.usedQuantity} {material.unit}
						</dd>
					</div>
					<div className="col-span-2 sm:col-span-1">
						<dt className="text-xs font-medium text-muted-foreground">Line cost</dt>
						<dd className="mt-0.5 font-medium tabular-nums">
							{(material.usedQuantity * material.unitCost).toFixed(0)} <RupeeIcon />
						</dd>
					</div>
				</dl>
			</li>
		))}
	</ol>
);

const TaskMaterials = ({
	materials,
	asStandalone = false,
	presentation = "sheet",
}: {
	materials: IMaterial[];
	asStandalone?: boolean;
	presentation?: "sheet" | "page";
}) => {
	const inner =
		presentation === "page"
			? materialsInnerPage(materials)
			: materialsInnerSheet(materials);

	if (presentation === "page") {
		return <div className="outline-none">{inner}</div>;
	}

	if (asStandalone) {
		return <div className="mt-6 space-y-4">{inner}</div>;
	}

	return (
		<TabsContent value="materials" className="mt-6 space-y-4 outline-none">
			{inner}
		</TabsContent>
	);
};

export default TaskMaterials;
