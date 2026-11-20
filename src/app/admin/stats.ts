import type { Touch } from "@/lib/attribution";
import { classify } from "@/lib/channel";
import { MANUAL_PLACEMENT } from "@/lib/crm";
import type { Lead, TrackedEvent } from "@/lib/db";

export const PERIODS = { "7": "7 zile", "30": "30 zile", "90": "90 zile", all: "Tot" } as const;
export type Period = keyof typeof PERIODS;
export type TouchMode = "ft" | "lt";

export function parsePeriod(value: string | undefined): Period {
  return value && value in PERIODS ? (value as Period) : "30";
}

export function periodStart(period: Period): Date {
  if (period === "all") return new Date(0);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - Number(period) + 1);
  return start;
}

type Tracked = { channel: string; placement: string | null; ft: Touch | null; lt: Touch | null };

export function touchOf(row: Tracked, mode: TouchMode): Touch | null {
  return mode === "ft" ? (row.ft ?? row.lt) : (row.lt ?? row.ft);
}

export function channelOf(row: Tracked, mode: TouchMode): string {
  return mode === "lt" || row.placement === MANUAL_PLACEMENT ? row.channel : classify(touchOf(row, mode)).channel;
}

export type Count = { label: string; value: number };

export function countBy<T>(rows: T[], key: (row: T) => string | null | undefined): Count[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = key(row);
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export type Bucket = { label: string; start: Date; value: number };

export function leadsOverTime(leads: Lead[], period: Period): Bucket[] {
  const end = new Date();
  const first = leads.length ? new Date(leads[leads.length - 1].createdAt) : end;
  const start = period === "all" ? first : periodStart(period);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400_000));
  const step = days <= 31 ? 1 : days <= 120 ? 7 : 30;

  const buckets: Bucket[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    buckets.push({ label: `${String(cursor.getDate()).padStart(2, "0")}.${String(cursor.getMonth() + 1).padStart(2, "0")}`, start: new Date(cursor), value: 0 });
    cursor.setDate(cursor.getDate() + step);
  }
  for (const lead of leads) {
    const at = new Date(lead.createdAt);
    const bucket = buckets.findLast((b) => b.start <= at);
    if (bucket) bucket.value++;
  }
  return buckets;
}

export type ChannelRow = { channel: string; visits: number; leads: number; phone: number; email: number; whatsapp: number; maps: number };

export function channelTable(leads: Lead[], events: TrackedEvent[], mode: TouchMode): ChannelRow[] {
  const rows = new Map<string, ChannelRow>();
  const row = (channel: string) => {
    if (!rows.has(channel)) rows.set(channel, { channel, visits: 0, leads: 0, phone: 0, email: 0, whatsapp: 0, maps: 0 });
    return rows.get(channel) as ChannelRow;
  };
  for (const lead of leads) row(channelOf(lead, mode)).leads++;
  for (const event of events) {
    const r = row(channelOf(event, mode));
    if (event.kind === "visit") r.visits++;
    if (event.kind === "phone") r.phone++;
    if (event.kind === "email") r.email++;
    if (event.kind === "whatsapp") r.whatsapp++;
    if (event.kind === "maps") r.maps++;
  }
  return [...rows.values()].sort((a, b) => b.leads - a.leads || b.phone - a.phone || b.visits - a.visits);
}

/** Suspect submissions stay in the lead list (they may be a fast person) but never count in reports or conversions. */
export const countable = <T extends { suspect: boolean }>(rows: T[]) => rows.filter((row) => !row.suspect);

/** `s`: "" all, "nu" without suspect submissions, "da" only those. */
export type LeadFilters = { status?: string; channel?: string; service?: string; assignee?: string; q?: string; p?: string; s?: string };

export async function loadFilteredLeads(filters: LeadFilters, load: (since: Date) => Promise<Lead[]>): Promise<Lead[]> {
  const leads = await load(periodStart(filters.p && filters.p in PERIODS ? (filters.p as Period) : "all"));
  const q = filters.q?.trim().toLowerCase();
  return leads.filter(
    (l) =>
      (!filters.status || l.status === filters.status) &&
      (!filters.channel || l.channel === filters.channel) &&
      (!filters.service || (l.service ?? "") === filters.service) &&
      (!filters.assignee || (filters.assignee === "-" ? !l.assignee : l.assignee === filters.assignee)) &&
      (!filters.s || (filters.s === "da" ? l.suspect : !l.suspect)) &&
      (!q || [l.name, l.company, l.phone, l.email, l.message, l.notes].some((v) => v?.toLowerCase().includes(q))),
  );
}
