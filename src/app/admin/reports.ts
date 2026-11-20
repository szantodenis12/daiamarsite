import type { Touch } from "@/lib/attribution";
import { AD_CHANNELS, bucharestDay, bucharestMonth, CONTACTED_STATUSES, LOST_LABELS, MANUAL_PLACEMENT, OPEN_STATUSES, type LostReason } from "@/lib/crm";
import type { CampaignLink, Lead, Offer, Spend, TrackedEvent } from "@/lib/db";
import { offerTotals } from "@/lib/offers";
import { countBy, type Count } from "./stats";

const DAY = 86400_000;
const isOpen = (lead: Lead) => OPEN_STATUSES.includes(lead.status);

export type TodayLists = { overdue: Lead[]; today: Lead[]; stale: Lead[]; fresh: Lead[] };

/** Follow-ups due by today plus new leads nobody has touched yet. Only open leads count. */
export function todayLists(leads: Lead[], now = new Date()): TodayLists {
  const day = bucharestDay(now);
  const open = leads.filter(isOpen);
  const due = (l: Lead) => Boolean(l.nextActionAt && l.nextActionAt <= day);
  const untouched = open.filter((l) => l.status === "nou" && !l.firstContactAt && !due(l));
  const byDue = (a: Lead, b: Lead) => (a.nextActionAt ?? "").localeCompare(b.nextActionAt ?? "");
  return {
    overdue: open.filter((l) => l.nextActionAt && l.nextActionAt < day).sort(byDue),
    today: open.filter((l) => l.nextActionAt === day),
    stale: untouched.filter((l) => now.getTime() - new Date(l.createdAt).getTime() > DAY).reverse(),
    fresh: untouched.filter((l) => now.getTime() - new Date(l.createdAt).getTime() <= DAY),
  };
}

export const attentionCount = (lists: TodayLists) => lists.overdue.length + lists.today.length + lists.stale.length;

export type Value = { monthly: number; oneOff: number; count: number };

export function sumValue(leads: Lead[]): Value {
  return leads.reduce(
    (sum, l) => ({ monthly: sum.monthly + (l.monthlyValue ?? 0), oneOff: sum.oneOff + (l.oneOffValue ?? 0), count: sum.count + 1 }),
    { monthly: 0, oneOff: 0, count: 0 },
  );
}

export const pipelineValue = (leads: Lead[]) => sumValue(leads.filter(isOpen));
export const wonSince = (leads: Lead[], since: Date) => leads.filter((l) => l.status === "client" && l.wonAt && new Date(l.wonAt) >= since);

export function wonByChannel(won: Lead[]): Count[] {
  const totals = new Map<string, number>();
  for (const l of won) totals.set(l.channel, (totals.get(l.channel) ?? 0) + (l.monthlyValue ?? 0));
  return [...totals].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export const lostReasons = (leads: Lead[]) =>
  countBy(
    leads.filter((l) => l.status === "pierdut"),
    (l) => (l.lostReason ? (LOST_LABELS[l.lostReason as LostReason] ?? l.lostReason) : "Fără motiv"),
  );

/** Spend is entered per month, so ROI always covers whole months: from `fromMonth` to the current one. */
export function monthsFrom(fromMonth: string, now = new Date()): string[] {
  const months: string[] = [];
  const current = bucharestMonth(now);
  let [year, month] = fromMonth.split("-").map(Number);
  for (let guard = 0; guard < 240; guard++) {
    const value = `${year}-${String(month).padStart(2, "0")}`;
    if (value > current) break;
    months.push(value);
    if (++month > 12) [year, month] = [year + 1, 1];
  }
  return months;
}

export function monthStart(month: string): Date {
  // Midnight in Oradea is 22:00 or 21:00 UTC the day before; starting a day early and filtering by month avoids DST maths.
  return new Date(new Date(`${month}-01T00:00:00Z`).getTime() - DAY);
}

export type RoiRow = {
  label: string;
  spend: number;
  leads: number;
  clients: number;
  wonMonthly: number;
  costPerLead: number | null;
  costPerClient: number | null;
  yearlyReturn: number | null;
};

export function roiTable(leads: Lead[], spend: Spend[], months: string[]): RoiRow[] {
  const inRange = new Set(months);
  const cohort = leads.filter((l) => inRange.has(bucharestMonth(new Date(l.createdAt))));
  const row = (label: string, channels: readonly string[], spendKeys: readonly string[]): RoiRow => {
    const total = spend.filter((s) => inRange.has(s.month) && spendKeys.includes(s.channel)).reduce((sum, s) => sum + s.amount, 0);
    const own = cohort.filter((l) => channels.includes(l.channel));
    const clients = own.filter((l) => l.status === "client");
    const wonMonthly = clients.reduce((sum, l) => sum + (l.monthlyValue ?? 0), 0);
    return {
      label,
      spend: total,
      leads: own.length,
      clients: clients.length,
      wonMonthly,
      costPerLead: total && own.length ? total / own.length : null,
      costPerClient: total && clients.length ? total / clients.length : null,
      yearlyReturn: total ? (wonMonthly * 12) / total : null,
    };
  };
  const rows = AD_CHANNELS.map((c) => row(c.label, c.leadChannels, [c.key]));
  const paid = row("Total reclame", AD_CHANNELS.flatMap((c) => c.leadChannels), AD_CHANNELS.map((c) => c.key));
  return [...rows.filter((r) => r.spend || r.leads), paid];
}

export type FunnelRow = { channel: string; visits: number; leads: number; contacted: number; clients: number; firstContactMs: number | null };

const wasContacted = (l: Lead) => Boolean(l.firstContactAt) || CONTACTED_STATUSES.includes(l.status);

function averageFirstContact(leads: Lead[]): number | null {
  // Leads typed in by hand were created after the first conversation, so they would only pull the average down.
  const times = leads
    .filter((l) => l.firstContactAt && l.placement !== MANUAL_PLACEMENT)
    .map((l) => new Date(l.firstContactAt as string).getTime() - new Date(l.createdAt).getTime())
    .filter((ms) => ms >= 0);
  return times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
}

export function funnelTable(leads: Lead[], events: TrackedEvent[], channelOf: (row: Lead | TrackedEvent) => string): FunnelRow[] {
  const groups = new Map<string, { leads: Lead[]; visits: number }>();
  const group = (channel: string) => {
    if (!groups.has(channel)) groups.set(channel, { leads: [], visits: 0 });
    return groups.get(channel) as { leads: Lead[]; visits: number };
  };
  for (const lead of leads) group(channelOf(lead)).leads.push(lead);
  for (const event of events) if (event.kind === "visit") group(channelOf(event)).visits++;

  const toRow = (channel: string, own: Lead[], visits: number): FunnelRow => ({
    channel,
    visits,
    leads: own.length,
    contacted: own.filter(wasContacted).length,
    clients: own.filter((l) => l.status === "client").length,
    firstContactMs: averageFirstContact(own),
  });
  const rows = [...groups].map(([channel, g]) => toRow(channel, g.leads, g.visits)).filter((r) => r.leads);
  rows.sort((a, b) => b.leads - a.leads);
  const visits = [...groups.values()].reduce((sum, g) => sum + g.visits, 0);
  return [...rows, toRow("Total", leads, visits)];
}

const same = (a: string | undefined, b: string) => (a ?? "").toLowerCase() === b.toLowerCase();
const fromLink = (link: CampaignLink, touch: Touch | null) =>
  Boolean(touch) && same(touch?.utm_source, link.source) && same(touch?.utm_campaign, link.campaign) && same(touch?.utm_content, link.content);

export function linkStats(link: CampaignLink, leads: Lead[], events: TrackedEvent[]) {
  return {
    visits: events.filter((e) => e.kind === "visit" && fromLink(link, e.lt)).length,
    leads: leads.filter((l) => fromLink(link, l.lt) || fromLink(link, l.ft)).length,
  };
}

export type OfferChannelRow = { channel: string; sent: number; accepted: number };

/** Offers sent in the period, and how many of those were accepted, per lead channel. */
export function offerStats(offers: Offer[], leads: Lead[], since: Date) {
  const sent = offers.filter((o) => o.sentAt && new Date(o.sentAt) >= since);
  const accepted = sent.filter((o) => o.status === "acceptata");
  const value = accepted.reduce(
    (sum, o) => {
      const t = offerTotals(o.doc);
      return { monthly: sum.monthly + t.netMonthly, oneOff: sum.oneOff + t.netOneOff };
    },
    { monthly: 0, oneOff: 0 },
  );
  const channelOf = new Map(leads.map((l) => [l.id, l.channel]));
  const rows = new Map<string, OfferChannelRow>();
  for (const o of sent) {
    const channel = (o.leadId && channelOf.get(o.leadId)) || "Fără cerere";
    const row = rows.get(channel) ?? { channel, sent: 0, accepted: 0 };
    row.sent++;
    if (o.status === "acceptata") row.accepted++;
    rows.set(channel, row);
  }
  return { sent: sent.length, accepted: accepted.length, value, byChannel: [...rows.values()].sort((a, b) => b.sent - a.sent) };
}
