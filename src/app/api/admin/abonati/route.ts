import { requireApiSession } from "@/app/admin/session";
import { SUBSCRIBER_LABELS } from "@/app/admin/subscribers";
import { csvResponse } from "@/lib/csv";
import { db } from "@/lib/db";

const COLUMNS = ["id", "data", "email", "nume", "firma", "status", "confirmat_la", "dezabonat_la", "canal", "formular", "pagina", "utm_source", "utm_medium", "utm_campaign", "suspect", "demo"];

export async function GET(request: Request) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const separator = params.get("format") === "excel" ? ";" : ",";
  const status = params.get("status");
  const subscribers = (await db().subscribers()).filter((s) => !status || s.status === status);

  const rows = subscribers.map((s) => {
    const touch = s.lt ?? s.ft;
    return [s.id, s.createdAt, s.email, s.name, s.company, SUBSCRIBER_LABELS[s.status], s.confirmedAt, s.unsubscribedAt, s.channel, s.placement, s.page, touch?.utm_source, touch?.utm_medium, touch?.utm_campaign, s.suspect ? "da" : "nu", s.demo ? "da" : "nu"];
  });

  const date = new Date().toISOString().slice(0, 10);
  return csvResponse(COLUMNS, rows, `abonati-daiamar-${date}${separator === ";" ? "-excel" : ""}.csv`, separator);
}
