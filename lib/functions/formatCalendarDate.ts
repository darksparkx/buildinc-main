/**
 * dd/MM/yyyy — standard for all user-visible calendar dates in the app.
 */
export function formatCalendarDate(
	date: Date | string | number | null | undefined,
): string {
	if (date == null || date === "") return "—";
	const d = date instanceof Date ? date : new Date(date);
	if (!Number.isFinite(d.getTime())) return "—";
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
}

/**
 * Weekday + month name + day (and year) for greetings and dashboard headers.
 * Prefer {@link formatCalendarDate} for tables, forms, and compact numeric dates.
 */
export function formatFriendlyDate(
	date: Date | string | number | null | undefined,
): string {
	if (date == null || date === "") return "—";
	const d = date instanceof Date ? date : new Date(date);
	if (!Number.isFinite(d.getTime())) return "—";
	return d.toLocaleDateString("en-GB", {
		weekday: "long",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
