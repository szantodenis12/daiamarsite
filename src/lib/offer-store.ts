import { db, type Offer } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { changeStatus } from "@/lib/leads";
import { DEFAULT_TEMPLATES, EMPTY_OFFER_SETTINGS, offerTotals, type OfferSettings, type OfferTemplate } from "@/lib/offers";
import { notifyRecipients } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

export async function getOfferSettings(): Promise<OfferSettings> {
  const stored = await db().getSetting("offer_settings");
  return { ...EMPTY_OFFER_SETTINGS, ...(stored && typeof stored === "object" ? (stored as Partial<OfferSettings>) : {}) };
}
export const saveOfferSettings = (settings: OfferSettings) => db().setSetting("offer_settings", settings);

export async function getTemplates(): Promise<OfferTemplate[]> {
  const stored = await db().getSetting("offer_templates");
  return Array.isArray(stored) ? (stored as OfferTemplate[]) : DEFAULT_TEMPLATES;
}
export const saveTemplates = (templates: OfferTemplate[]) => db().setSetting("offer_templates", templates);

/** DAI-2026-0001, counted per year from the highest number already used. */
export function nextOfferNumber(offers: Pick<Offer, "number">[], now = new Date()): string {
  const prefix = `DAI-${now.getFullYear()}-`;
  const last = offers.filter((o) => o.number.startsWith(prefix)).reduce((max, o) => Math.max(max, Number(o.number.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(last + 1).padStart(4, "0")}`;
}

/** 24 random bytes, URL-safe: the online offer link cannot be guessed from the offer number. */
export function newOfferToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const offerUrl = (offer: Pick<Offer, "token">) => `${SITE_URL}/oferta/${offer.token}/`;

export async function recordView(offer: Offer) {
  const first = !offer.firstViewedAt;
  await db().updateOffer(offer.id, {
    viewCount: offer.viewCount + 1,
    firstViewedAt: offer.firstViewedAt ?? new Date().toISOString(),
    status: offer.status === "trimisa" ? "vazuta" : offer.status,
  });
  if (first && offer.leadId) {
    await db().insertActivity({ leadId: offer.leadId, type: "oferta", text: `Oferta ${offer.number} a fost deschisă online.`, author: "Client" });
  }
}

export async function emailOffer(offer: Offer, input: { to: string; subject: string; body: string; pdf: Buffer }) {
  const { replyTo } = await getOfferSettings();
  return sendEmail({
    to: [input.to],
    reply_to: replyTo || undefined,
    subject: input.subject,
    text: input.body,
    attachments: [{ filename: `Oferta-${offer.number}.pdf`, content: input.pdf.toString("base64") }],
  });
}

export async function acceptOffer(offer: Offer, name: string, comment: string) {
  const now = new Date().toISOString();
  await db().updateOffer(offer.id, { status: "acceptata", acceptedAt: now, acceptedName: name || null, acceptedComment: comment || null });
  const totals = offerTotals(offer.doc);
  const lead = offer.leadId ? await db().getLead(offer.leadId) : null;
  if (lead) {
    await db().updateLead(lead.id, { monthlyValue: Math.round(totals.netMonthly) || null, oneOffValue: Math.round(totals.netOneOff) || null });
    await db().insertActivity({
      leadId: lead.id,
      type: "oferta",
      text: `Oferta ${offer.number} a fost acceptată online${name ? ` de ${name}` : ""}.${comment ? ` Comentariu: ${comment}` : ""}`,
      author: "Client",
    });
    await changeStatus(lead, "client", "Client", { byTeam: false });
  }

  const { to } = await notifyRecipients();
  if (to.length) {
    const text = [
      `Oferta ${offer.number} a fost acceptată online.`,
      "",
      `Client: ${offer.doc.clientName}${offer.doc.clientCompany ? `, ${offer.doc.clientCompany}` : ""}`,
      ...(name ? [`Acceptată de: ${name}`] : []),
      ...(comment ? [`Comentariu: ${comment}`] : []),
      "",
      lead ? `Cererea: ${SITE_URL}/admin/leads/${lead.id}/` : `Oferta: ${SITE_URL}/admin/oferte/${offer.id}/`,
    ];
    await sendEmail({ to, subject: `Ofertă acceptată: ${offer.number} (${offer.doc.clientName})`, text: text.join("\n") }).catch(() => undefined);
  }
}
