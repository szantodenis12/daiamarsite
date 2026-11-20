import {
  CONTACT_ACTIVITY_TYPES,
  CONTACTED_STATUSES,
  LOST_LABELS,
  normalizeEmail,
  normalizePhone,
  STATUS_LABELS,
  type LeadStatus,
  type LostReason,
} from "@/lib/crm";
import { db, type ActivityInput, type Lead } from "@/lib/db";
import { removeFileByKey } from "@/lib/storage";

/** A timeline entry written by the team. Calls, emails, WhatsApp messages and sent offers also count as first contact. */
export async function logActivity(activity: ActivityInput) {
  const at = activity.at ?? new Date().toISOString();
  await db().insertActivity({ ...activity, at });
  if (CONTACT_ACTIVITY_TYPES.includes(activity.type)) await db().markContacted(activity.leadId, at);
}

type StatusOptions = { lostReason?: LostReason; byTeam?: boolean };

/**
 * Changes the status, keeps won_at in step and writes the change to the lead's timeline. A team member moving the lead to
 * "contactat" or later has talked to the person, so that also sets first contact; an offer accepted online does not.
 */
export async function changeStatus(lead: Lead, status: LeadStatus, author: string, { lostReason, byTeam = true }: StatusOptions = {}) {
  if (lead.status === status && (status !== "pierdut" || lead.lostReason === lostReason)) return;
  const now = new Date().toISOString();
  await db().updateLead(lead.id, {
    status,
    lostReason: status === "pierdut" ? (lostReason ?? null) : null,
    wonAt: status === "client" ? (lead.wonAt ?? now) : null,
  });
  const reason = status === "pierdut" && lostReason ? ` (${LOST_LABELS[lostReason]})` : "";
  await db().insertActivity({ leadId: lead.id, type: "status", text: `${STATUS_LABELS[lead.status]} → ${STATUS_LABELS[status]}${reason}`, author, at: now });
  if (byTeam && CONTACTED_STATUSES.includes(status)) await db().markContacted(lead.id, now);
}

const contactKeys = (lead: Pick<Lead, "phone" | "email">) =>
  [normalizePhone(lead.phone) && `p:${normalizePhone(lead.phone)}`, normalizeEmail(lead.email) && `e:${normalizeEmail(lead.email)}`].filter(
    (key): key is string => Boolean(key),
  );

/** Lead id → ids of other leads with the same phone (digits only) or email (case-insensitive). */
export function findDuplicates(leads: Lead[]): Map<number, number[]> {
  const byKey = new Map<string, number[]>();
  for (const lead of leads) for (const key of contactKeys(lead)) byKey.set(key, [...(byKey.get(key) ?? []), lead.id]);

  const result = new Map<number, number[]>();
  for (const ids of byKey.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) result.set(id, [...new Set([...(result.get(id) ?? []), ...ids.filter((other) => other !== id)])]);
  }
  return result;
}

/** Keeps the older lead, fills its empty fields from the newer one, moves its timeline, documents and offers, then deletes the newer one. */
export async function mergeLeads(a: Lead, b: Lead, author: string): Promise<number> {
  const [keep, drop] = a.createdAt <= b.createdAt ? [a, b] : [b, a];
  const contacted = [keep.firstContactAt, drop.firstContactAt].filter((at): at is string => Boolean(at)).sort();
  await db().moveActivities(drop.id, keep.id);
  await db().moveFiles(drop.id, keep.id);
  await db().moveOffers(drop.id, keep.id);
  await db().insertActivity({ leadId: keep.id, type: "nota", text: `Unită cu cererea #${drop.id} (${drop.name}, ${drop.channel}).`, author });
  await db().updateLead(keep.id, {
    firstContactAt: contacted[0] ?? null,
    company: keep.company ?? drop.company,
    phone: keep.phone ?? drop.phone,
    email: keep.email ?? drop.email,
    service: keep.service ?? drop.service,
    message: [keep.message, drop.message].filter(Boolean).join("\n\n") || null,
    notes: [keep.notes, drop.notes].filter(Boolean).join("\n\n"),
    assignee: keep.assignee ?? drop.assignee,
    referredBy: keep.referredBy ?? drop.referredBy,
    monthlyValue: keep.monthlyValue ?? drop.monthlyValue,
    oneOffValue: keep.oneOffValue ?? drop.oneOffValue,
    nextActionAt: keep.nextActionAt ?? drop.nextActionAt,
    nextAction: keep.nextAction || drop.nextAction,
  });
  await db().deleteLead(drop.id);
  return keep.id;
}

/** Deletes the lead with its uploaded documents: the stored files first, so no personal data stays behind in storage. */
export async function deleteLeadWithFiles(leadId: number) {
  for (const file of await db().files(leadId)) await removeFileByKey(file.key);
  await db().deleteLead(leadId);
}
