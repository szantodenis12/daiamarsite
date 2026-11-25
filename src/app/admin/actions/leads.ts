"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ACTIVITY_TYPES, isOneOf, LEAD_STATUSES, LOST_REASONS, MANUAL_PLACEMENT, MANUAL_SOURCES, SYSTEM_ACTIVITY_TYPES, type LeadStatus, type LostReason } from "@/lib/crm";
import { db } from "@/lib/db";
import { validateLead } from "@/lib/lead";
import { changeStatus, deleteLeadWithFiles, logActivity, mergeLeads } from "@/lib/leads";
import { getTeam } from "@/lib/settings";
import { services } from "@/lib/site";
import { currentAuthor, requireSession } from "../session";
import { demoError, guarded, guardedVoid } from "./demo";
import { day, id, lei, text, type FormState } from "./form";

const refresh = () => revalidatePath("/admin", "layout");

async function contactFields(form: FormData) {
  const values = {
    name: text(form, "name", 120),
    company: text(form, "company", 160),
    phone: text(form, "phone", 40),
    email: text(form, "email", 160),
    service: text(form, "service", 80),
    assignee: text(form, "assignee", 80),
    referredBy: text(form, "referredBy", 120),
    monthlyValue: lei(form, "monthlyValue"),
    oneOffValue: lei(form, "oneOffValue"),
  };
  const errors: Record<string, string> = { ...validateLead({ name: values.name ?? "", phone: values.phone ?? "", email: values.email ?? "", consent: true }) };
  if (values.service && !services.some((s) => s.slug === values.service)) errors.service = "Serviciu necunoscut.";
  if (values.assignee && !(await getTeam()).includes(values.assignee)) errors.assignee = "Alegeți un nume din listă.";
  if (values.monthlyValue === undefined) errors.monthlyValue = "Scrieți suma în lei, fără zecimale.";
  if (values.oneOffValue === undefined) errors.oneOffValue = "Scrieți suma în lei, fără zecimale.";
  return { values, errors };
}

export const createLead = guarded(async function createLead(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const { values, errors } = await contactFields(form);
  const source = form.get("source");
  const status = form.get("status") === "nou" ? "nou" : "contactat";
  const nextActionAt = day(form, "nextActionAt");
  if (!isOneOf(MANUAL_SOURCES, source)) errors.source = "Alegeți de unde a venit.";
  if (nextActionAt === undefined) errors.nextActionAt = "Data nu este validă.";
  if (Object.keys(errors).length) return { error: "Verificați câmpurile marcate.", errors };

  const leadId = await db().insertLead({
    ...values,
    name: values.name as string,
    monthlyValue: values.monthlyValue ?? null,
    oneOffValue: values.oneOffValue ?? null,
    referredBy: source === "Recomandare" ? values.referredBy : null,
    message: text(form, "message", 2000),
    placement: MANUAL_PLACEMENT,
    page: "-",
    channel: source as string,
    ft: null,
    lt: null,
    device: "-",
    status,
    nextActionAt: nextActionAt ?? null,
    nextAction: text(form, "nextAction", 200) ?? "",
  });
  // A "nou" lead (e.g. a name passed on by a client) still waits for its first call, so it gets no timeline entry yet.
  if (status === "contactat") {
    const from = source === "Recomandare" && values.referredBy ? ` (recomandat de ${values.referredBy})` : "";
    await db().insertActivity({ leadId, type: "nota", text: `Adăugată manual după o discuție. Sursa: ${source}${from}.`, author: await currentAuthor() });
  }
  refresh();
  redirect(`/admin/leads/${leadId}/`);
}, demoError);

export const saveDetails = guarded(async function saveDetails(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const leadId = id(form);
  const { values, errors } = await contactFields(form);
  if (!leadId) return { error: "Cerere necunoscută." };
  if (Object.keys(errors).length) return { error: "Verificați câmpurile marcate.", errors };
  await db().updateLead(leadId, {
    ...values,
    name: values.name as string,
    monthlyValue: values.monthlyValue ?? null,
    oneOffValue: values.oneOffValue ?? null,
  });
  refresh();
  return { ok: true };
}, demoError);

async function applyStatus(leadId: number, status: unknown, reason: unknown): Promise<string | null> {
  if (!isOneOf(LEAD_STATUSES, status)) return "Status necunoscut.";
  if (status === "pierdut" && !isOneOf(LOST_REASONS, reason)) return "Alegeți motivul pentru care s-a pierdut.";
  const lead = await db().getLead(leadId);
  if (!lead) return "Cererea nu mai există.";
  await changeStatus(lead, status as LeadStatus, await currentAuthor(), { lostReason: status === "pierdut" ? (reason as LostReason) : undefined });
  return null;
}

export const saveStatus = guarded(async function saveStatus(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const leadId = id(form);
  if (!leadId) return { error: "Cerere necunoscută." };
  const error = await applyStatus(leadId, form.get("status"), form.get("lostReason"));
  if (error) return { error, errors: { lostReason: error } };
  await db().updateLead(leadId, { notes: text(form, "notes", 4000) ?? "" });
  refresh();
  return { ok: true };
}, demoError);

/** Used by the pipeline board, which moves cards without a form. */
export const moveLead = guarded(async function moveLead(leadId: number, status: string, reason?: string): Promise<FormState> {
  await requireSession();
  if (!Number.isInteger(leadId)) return { error: "Cerere necunoscută." };
  const error = await applyStatus(leadId, status, reason);
  if (error) return { error };
  refresh();
  return { ok: true };
}, demoError);

export const saveFollowUp = guarded(async function saveFollowUp(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const leadId = id(form);
  const nextActionAt = day(form, "nextActionAt");
  if (!leadId) return { error: "Cerere necunoscută." };
  if (nextActionAt === undefined) return { error: "Data nu este validă.", errors: { nextActionAt: "Data nu este validă." } };
  await db().updateLead(leadId, { nextActionAt, nextAction: text(form, "nextAction", 200) ?? "" });
  refresh();
  return { ok: true };
}, demoError);

export const clearFollowUp = guardedVoid(async function clearFollowUp(form: FormData) {
  await requireSession();
  const leadId = id(form);
  if (!leadId) return;
  const lead = await db().getLead(leadId);
  if (!lead?.nextActionAt) return;
  await db().updateLead(leadId, { nextActionAt: null, nextAction: "" });
  await db().insertActivity({ leadId, type: "nota", text: `Pas făcut: ${lead.nextAction || "follow-up"}.`, author: await currentAuthor() });
  refresh();
});

export const addActivity = guarded(async function addActivity(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const leadId = id(form);
  const type = form.get("type");
  const body = text(form, "text", 2000);
  if (!leadId) return { error: "Cerere necunoscută." };
  if (!isOneOf(ACTIVITY_TYPES, type) || SYSTEM_ACTIVITY_TYPES.includes(type)) return { error: "Alegeți tipul." };
  if (!body) return { error: "Scrieți ce s-a întâmplat.", errors: { text: "Scrieți ce s-a întâmplat." } };
  await logActivity({ leadId, type, text: body, author: await currentAuthor() });
  refresh();
  return { ok: true };
}, demoError);

export const mergeLead = guardedVoid(async function mergeLead(form: FormData) {
  await requireSession();
  const [a, b] = await Promise.all([id(form), id(form, "other")].map((n) => (n ? db().getLead(n) : null)));
  if (!a || !b || a.id === b.id) return;
  const kept = await mergeLeads(a, b, await currentAuthor());
  refresh();
  redirect(`/admin/leads/${kept}/`);
});

export const deleteLead = guardedVoid(async function deleteLead(form: FormData) {
  await requireSession();
  const leadId = id(form);
  if (leadId) await deleteLeadWithFiles(leadId);
  refresh();
  redirect("/admin/leads/");
});
