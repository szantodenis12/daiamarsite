import { LEAD_KIND_LABELS } from "@/lib/crm";
import { services, SITE_URL } from "@/lib/site";
import type { Touch } from "@/lib/attribution";
import type { LeadInput } from "@/lib/db";
import { canSendEmail, sendEmail } from "@/lib/email";
import { notifyRecipients } from "@/lib/settings";

function describeTouch(touch: Touch | null): string {
  if (!touch) return "-";
  const parts = [
    touch.utm_source && `sursă: ${touch.utm_source}`,
    touch.utm_medium && `mediu: ${touch.utm_medium}`,
    touch.utm_campaign && `campanie: ${touch.utm_campaign}`,
    touch.gclid && "gclid",
    touch.fbclid && "fbclid",
    touch.referrer && `referrer: ${touch.referrer}`,
    `pagina de intrare: ${touch.landing}`,
  ];
  return parts.filter(Boolean).join(", ");
}

export async function notifyNewLead(id: number, lead: LeadInput, firstChannel: string) {
  if (!canSendEmail()) return;
  const { to } = await notifyRecipients();
  if (!to.length) return;

  const service = services.find((s) => s.slug === lead.service)?.title ?? "nespecificat";
  const kind = LEAD_KIND_LABELS[lead.kind ?? "cerere"];
  const text = [
    `${kind} nouă de pe site (#${id})`,
    ...(lead.suspect ? ["Trimitere suspectă: formularul a fost trimis mai repede decât îl poate completa un om. Verificați înainte să sunați."] : []),
    "",
    `Nume: ${lead.name}`,
    `Firmă: ${lead.company ?? "-"}`,
    `Telefon: ${lead.phone ?? "-"}`,
    `Email: ${lead.email ?? "-"}`,
    `Serviciu: ${service}`,
    `Mesaj: ${lead.message ?? "-"}`,
    "",
    `Canal (ultima vizită): ${lead.channel}`,
    `Canal (prima vizită): ${firstChannel}`,
    `Formular: ${lead.placement}, pe pagina ${lead.page}`,
    `Prima vizită: ${describeTouch(lead.ft)}`,
    `Ultima vizită: ${describeTouch(lead.lt)}`,
    `Dispozitiv: ${lead.device}`,
    "",
    `Detalii: ${SITE_URL}/admin/leads/${id}/`,
  ].join("\n");

  const result = await sendEmail({ to, reply_to: lead.email ?? undefined, subject: `${kind}: ${lead.name} (${lead.channel})`, text });
  if (!result.ok) console.error("Resend failed", result.reason);
}
