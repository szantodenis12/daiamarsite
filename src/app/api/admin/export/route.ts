import { requireApiSession } from "@/app/admin/session";
import { loadFilteredLeads, type LeadFilters } from "@/app/admin/stats";
import { classify } from "@/lib/channel";
import { LEAD_KIND_LABELS, LOST_LABELS, STATUS_LABELS, type LostReason } from "@/lib/crm";
import { csvResponse } from "@/lib/csv";
import { db } from "@/lib/db";

const COLUMNS = [
  "id", "data", "tip", "nume", "firma", "telefon", "email", "serviciu", "mesaj", "status", "motiv_pierdere", "asignat", "recomandat_de",
  "valoare_lunara_lei", "valoare_unica_lei", "urmatorul_pas", "data_urmatorului_pas", "primul_contact", "castigat_la", "note",
  "canal_ultima_vizita", "canal_prima_vizita", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "referrer", "pagina_intrare", "pagina_conversie", "formular", "dispozitiv", "suspect", "demo",
];

export async function GET(request: Request) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const separator = params.get("format") === "excel" ? ";" : ",";
  params.delete("format");
  const filters = Object.fromEntries(params) as LeadFilters;
  const leads = await loadFilteredLeads(filters, (since) => db().leadsSince(since));

  const rows = leads.map((l) => {
    const touch = l.lt ?? l.ft;
    return [
      l.id, l.createdAt, LEAD_KIND_LABELS[l.kind], l.name, l.company, l.phone, l.email, l.service, l.message, STATUS_LABELS[l.status],
      l.lostReason ? (LOST_LABELS[l.lostReason as LostReason] ?? l.lostReason) : null, l.assignee, l.referredBy,
      l.monthlyValue, l.oneOffValue, l.nextAction, l.nextActionAt, l.firstContactAt, l.wonAt, l.notes,
      l.channel, l.ft ? classify(l.ft).channel : l.channel, touch?.utm_source, touch?.utm_medium, touch?.utm_campaign, touch?.utm_term, touch?.utm_content,
      touch?.referrer, l.ft?.landing, l.page, l.placement, l.device, l.suspect ? "da" : "nu", l.demo ? "da" : "nu",
    ];
  });

  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(COLUMNS, rows, `cereri-daiamar-${date}${separator === ";" ? "-excel" : ""}.csv`, separator);
}
