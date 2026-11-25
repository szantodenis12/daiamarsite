import { bucharestMonth } from "@/lib/crm";
import type { Lead, Offer } from "@/lib/db";
import { formatMonth } from "./format";

const SHORT_MONTHS = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];

/** "2026-11" shifted by `delta` months. */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const index = y * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

export type MonthPoint = { month: string; label: string; full: string; leads: number; clients: number };

/** Requests per month for the last `count` months (oldest first), and how many of those became clients. */
export function leadsPerMonth(leads: Lead[], count: number, now = new Date()): MonthPoint[] {
  const current = bucharestMonth(now);
  const points = Array.from({ length: count }, (_, i) => {
    const month = shiftMonth(current, i - count + 1);
    return { month, label: SHORT_MONTHS[Number(month.slice(5)) - 1], full: formatMonth(month), leads: 0, clients: 0 };
  });
  const byMonth = new Map(points.map((p) => [p.month, p]));
  for (const lead of leads) {
    const point = byMonth.get(bucharestMonth(new Date(lead.createdAt)));
    if (!point) continue;
    point.leads++;
    if (lead.status === "client") point.clients++;
  }
  return points;
}

const inMonth = (iso: string | null | undefined, month: string) => Boolean(iso) && bucharestMonth(new Date(iso as string)) === month;

export type MonthKpis = { leads: number; clients: number; offersSent: number; offersAccepted: number };

export function monthKpis(leads: Lead[], offers: Offer[], month: string): MonthKpis {
  const sent = offers.filter((o) => inMonth(o.sentAt, month));
  return {
    leads: leads.filter((l) => inMonth(l.createdAt, month)).length,
    clients: leads.filter((l) => l.status === "client" && inMonth(l.wonAt, month)).length,
    offersSent: sent.length,
    offersAccepted: sent.filter((o) => o.status === "acceptata").length,
  };
}

export type Slice = { label: string; value: number };

/** Biggest `top` slices plus one "Altele" slice. */
export function topSlices(rows: { label: string; value: number }[], top = 4): Slice[] {
  const sorted = rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top).reduce((sum, r) => sum + r.value, 0);
  return rest ? [...head, { label: "Altele", value: rest }] : head;
}
