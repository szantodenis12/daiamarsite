"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, type Offer } from "@/lib/db";
import { renderOfferPdf } from "@/lib/offer-pdf/OfferPdf";
import { emailOffer, getOfferSettings, getTemplates, newOfferToken, nextOfferNumber, offerUrl, saveOfferSettings, saveTemplates } from "@/lib/offer-store";
import { isOneOf } from "@/lib/crm";
import { logActivity } from "@/lib/leads";
import { OFFER_UNITS, VAT_MODES, type OfferDoc, type OfferItem } from "@/lib/offers";
import { services } from "@/lib/site";
import { currentAuthor, requireSession } from "../session";
import { demoError, guarded, guardedVoid } from "./demo";
import { id, text, type FormState } from "./form";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const refresh = () => revalidatePath("/admin", "layout");
const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const num = (value: unknown, min: number, max: number) => (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null);

function parseItem(raw: unknown): OfferItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = str(r.title, 160);
  const quantity = num(r.quantity, 0.01, 100_000);
  if (!title || quantity === null || !isOneOf(OFFER_UNITS, r.unit)) return null;
  return {
    service: typeof r.service === "string" && services.some((s) => s.slug === r.service) ? r.service : null,
    title,
    description: str(r.description, 1000),
    quantity,
    unit: r.unit,
    price: r.price === null ? null : num(r.price, 0, 10_000_000),
    recurring: r.recurring === true,
  };
}

/** Everything the builder sends is checked here; the browser state is never trusted as is. */
function parseDoc(raw: unknown): OfferDoc | string {
  if (!raw || typeof raw !== "object") return "Ofertă invalidă.";
  const r = raw as Record<string, unknown>;
  const items = Array.isArray(r.items) ? r.items.map(parseItem) : [];
  if (!items.length) return "Adăugați cel puțin un serviciu.";
  if (items.some((i) => i === null)) return "Fiecare rând are nevoie de denumire, cantitate și unitate.";
  const clientEmail = str(r.clientEmail, 160);
  if (clientEmail && !EMAIL.test(clientEmail)) return "Adresa de email a clientului nu este validă.";
  const doc: OfferDoc = {
    clientName: str(r.clientName, 120),
    clientCompany: str(r.clientCompany, 160),
    clientEmail,
    intro: str(r.intro, 3000),
    items: items as OfferItem[],
    discount: num(r.discount, 0, 100) ?? 0,
    vatMode: isOneOf(Object.keys(VAT_MODES) as (keyof typeof VAT_MODES)[], r.vatMode) ? r.vatMode : "plus",
    vatRate: num(r.vatRate, 0, 100) ?? 21,
    validDays: Math.round(num(r.validDays, 1, 365) ?? 30),
    paymentTerms: str(r.paymentTerms, 2000),
    notes: str(r.notes, 3000),
    preparedBy: str(r.preparedBy, 80),
  };
  if (!doc.clientName) return "Scrieți numele clientului.";
  return doc;
}

export type SaveOfferResult = { id?: number; error?: string };

export const saveOffer = guarded(async function saveOffer(input: { id: number | null; leadId: number | null; doc: unknown }): Promise<SaveOfferResult> {
  await requireSession();
  const doc = parseDoc(input.doc);
  if (typeof doc === "string") return { error: doc };

  if (input.id) {
    const offer = await db().getOffer(input.id);
    if (!offer) return { error: "Oferta nu mai există." };
    if (offer.status === "acceptata") return { error: "Oferta a fost acceptată și nu se mai modifică. Creați o ofertă nouă." };
    await db().updateOffer(offer.id, { doc });
    refresh();
    return { id: offer.id };
  }

  const leadId = input.leadId && (await db().getLead(input.leadId)) ? input.leadId : null;
  const offerId = await db().insertOffer({
    number: nextOfferNumber(await db().offers()),
    token: newOfferToken(),
    leadId,
    status: "ciorna",
    doc,
    sentAt: null,
    firstViewedAt: null,
    viewCount: 0,
    acceptedAt: null,
    acceptedName: null,
    acceptedComment: null,
  });
  refresh();
  return { id: offerId };
}, demoError);

async function markSentNow(offer: Offer, how: string) {
  if (offer.status === "ciorna") await db().updateOffer(offer.id, { status: "trimisa", sentAt: new Date().toISOString() });
  if (offer.leadId) await logActivity({ leadId: offer.leadId, type: "oferta", text: `Oferta ${offer.number} trimisă ${how}.`, author: await currentAuthor() });
}

export type SendState = FormState & { fallback?: boolean };

export const sendOffer = guarded(async function sendOffer(_: SendState, form: FormData): Promise<SendState> {
  await requireSession();
  const offerId = id(form);
  const offer = offerId ? await db().getOffer(offerId) : null;
  if (!offer) return { error: "Oferta nu mai există." };
  const to = text(form, "to", 160) ?? "";
  const subject = text(form, "subject", 200);
  const body = text(form, "body", 5000);
  if (!EMAIL.test(to)) return { error: "Adresa de email nu este validă.", errors: { to: "Adresa de email nu este validă." } };
  if (!subject || !body) return { error: "Completați subiectul și textul." };

  const pdf = await renderOfferPdf(offer, await getOfferSettings(), offerUrl(offer));
  const result = await emailOffer(offer, { to, subject, body, pdf });
  if (!result.ok) {
    return { error: `Emailul nu a plecat: ${result.reason} Descărcați PDF-ul și trimiteți-l din emailul dumneavoastră, apoi apăsați „Marchează ca trimisă”.`, fallback: true };
  }
  await markSentNow(offer, `pe email către ${to}`);
  refresh();
  return { ok: true };
}, demoError);

export const markOfferSent = guardedVoid(async function markOfferSent(form: FormData) {
  await requireSession();
  const offerId = id(form);
  const offer = offerId ? await db().getOffer(offerId) : null;
  if (!offer) return;
  await markSentNow(offer, String(form.get("how") ?? "manual").slice(0, 60));
  refresh();
});

export const markOfferRefused = guardedVoid(async function markOfferRefused(form: FormData) {
  await requireSession();
  const offerId = id(form);
  const offer = offerId ? await db().getOffer(offerId) : null;
  if (!offer || offer.status === "acceptata") return;
  await db().updateOffer(offer.id, { status: "refuzata" });
  if (offer.leadId) await db().insertActivity({ leadId: offer.leadId, type: "oferta", text: `Oferta ${offer.number} a fost refuzată.`, author: await currentAuthor() });
  refresh();
});

export const deleteOffer = guardedVoid(async function deleteOffer(form: FormData) {
  await requireSession();
  const offerId = id(form);
  if (offerId) await db().deleteOffer(offerId);
  refresh();
  redirect("/admin/oferte/");
});

export const saveTemplate = guarded(async function saveTemplate(name: string, items: unknown): Promise<SaveOfferResult> {
  await requireSession();
  const parsed = Array.isArray(items) ? items.map(parseItem) : [];
  const title = str(name, 80);
  if (!title) return { error: "Dați un nume șablonului." };
  if (!parsed.length || parsed.some((i) => i === null)) return { error: "Șablonul are nevoie de rânduri complete." };
  const templates = await getTemplates();
  const key = `t-${Date.now().toString(36)}`;
  await saveTemplates([...templates.filter((t) => t.name !== title), { key, name: title, items: parsed as OfferItem[] }]);
  revalidatePath("/admin/oferte", "layout");
  return {};
}, demoError);

export const deleteTemplate = guardedVoid(async function deleteTemplate(form: FormData) {
  await requireSession();
  const key = String(form.get("key") ?? "");
  await saveTemplates((await getTemplates()).filter((t) => t.key !== key));
  revalidatePath("/admin/setari");
});

export const saveOfferDefaults = guarded(async function saveOfferDefaults(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const replyTo = text(form, "replyTo", 160) ?? "";
  const vatRate = Number(text(form, "vatRate", 5)?.replace(",", ".") ?? 21);
  if (replyTo && !EMAIL.test(replyTo)) return { error: "Adresa de răspuns nu este validă.", errors: { replyTo: "Adresa nu este validă." } };
  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) return { error: "Cota TVA nu este validă.", errors: { vatRate: "Între 0 și 100." } };
  await saveOfferSettings({
    intro: text(form, "intro", 3000) ?? "",
    paymentTerms: text(form, "paymentTerms", 2000) ?? "",
    terms: text(form, "terms", 3000) ?? "",
    legalName: text(form, "legalName", 160) ?? "",
    cui: text(form, "cui", 40) ?? "",
    regCom: text(form, "regCom", 40) ?? "",
    bank: text(form, "bank", 120) ?? "",
    iban: text(form, "iban", 40)?.replace(/\s/g, "").toUpperCase() ?? "",
    replyTo,
    vatRate,
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}, demoError);
