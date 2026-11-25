import { services } from "@/lib/site";

export { STATUS_DISPLAY as STATUS_LABELS } from "@/lib/crm";

const dateTime = new Intl.DateTimeFormat("ro-RO", {
  timeZone: "Europe/Bucharest",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const shortDate = new Intl.DateTimeFormat("ro-RO", { timeZone: "Europe/Bucharest", day: "2-digit", month: "2-digit", year: "numeric" });
const monthName = new Intl.DateTimeFormat("ro-RO", { timeZone: "UTC", month: "long", year: "numeric" });

const number = new Intl.NumberFormat("ro-RO");
const decimal = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("ro-RO", { style: "percent", maximumFractionDigits: 1 });

export const formatDate = (value: string) => dateTime.format(new Date(value));
export const formatShortDate = (value: string) => shortDate.format(new Date(value));
export const formatNumber = (value: number) => number.format(value);
export const formatPercent = (value: number) => percent.format(value);
export const formatLei = (value: number) => `${number.format(Math.round(value))} lei`;
export const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${number.format(Math.max(1, Math.round(bytes / 1024)))} KB` : `${decimal.format(bytes / 1024 / 1024)} MB`);

/** "2026-11-06" → "06.11.2026", without going through a time zone. */
export const formatDay = (day: string) => day.split("-").reverse().join(".");
export const formatMonth = (month: string) => monthName.format(new Date(`${month}-01T00:00:00Z`));

export function formatDuration(ms: number): string {
  const hours = ms / 3600_000;
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60_000))} min`;
  if (hours < 48) return `${decimal.format(hours)} h`;
  return `${decimal.format(hours / 24)} zile`;
}

export function formatAge(createdAt: string, now = Date.now()): string {
  const days = Math.floor((now - new Date(createdAt).getTime()) / 86400_000);
  if (days < 1) return "azi";
  if (days === 1) return "ieri";
  return `${days} zile`;
}

export const serviceTitle = (slug: string | null) =>
  slug ? (services.find((s) => s.slug === slug)?.title ?? slug) : "Nu știe încă";
