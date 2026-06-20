"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/functions/utils";
import { formatCalendarDate } from "@/lib/functions/formatCalendarDate";

export type DatePickerProps = {
	value: Date | null | undefined;
	onChange: (date: Date | null) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
	fromDate?: Date;
	toDate?: Date;
};

function toInputValue(date: Date | null | undefined): string {
	if (!date || !Number.isFinite(date.getTime())) return "";
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function fromInputValue(value: string): Date | null {
	if (!value) return null;
	const [y, m, d] = value.split("-").map(Number);
	if (!y || !m || !d) return null;
	const date = new Date(y, m - 1, d);
	return Number.isFinite(date.getTime()) ? date : null;
}

function stripTime(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function DatePicker({
	value,
	onChange,
	placeholder = "Select date",
	disabled = false,
	className,
	id,
	fromDate,
	toDate,
}: DatePickerProps) {
	const min = fromDate ? toInputValue(fromDate) : undefined;
	const max = toDate ? toInputValue(toDate) : undefined;
	const display = value ? formatCalendarDate(value) : placeholder;

	return (
		<div className={cn("relative", className)}>
			<CalendarIcon
				className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden
			/>
			<input
				id={id}
				type="date"
				disabled={disabled}
				min={min}
				max={max}
				value={toInputValue(value)}
				onChange={(e) => {
					const next = fromInputValue(e.target.value);
					if (fromDate && next && next < stripTime(fromDate)) return;
					if (toDate && next && next > stripTime(toDate)) return;
					onChange(next);
				}}
				className={cn(
					"flex h-11 w-full rounded-md border border-border/60 bg-background/80 py-2 pl-10 pr-3 text-sm shadow-sm ring-1 ring-border/30",
					"transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"date-picker-input text-foreground",
					!value && "text-muted-foreground",
				)}
				aria-label={display}
			/>
		</div>
	);
}

export { DatePicker };
