import { isDemo } from "@/lib/demo";
import { after, NextResponse } from "next/server";
import { sanitizeTouch } from "@/lib/attribution";
import { classify } from "@/lib/channel";
import { db, type LeadInput } from "@/lib/db";
import { isSuspect } from "@/lib/form-token";
import { validateLead } from "@/lib/lead";
import { services } from "@/lib/site";
import { crossSite, demoBlocked, deviceFrom, forbidden, line, rateLimited, text, unavailable } from "../request";
import { notifyNewLead } from "./notify";

const MIN_FILL_MS = 3000;

export async function POST(request: Request) {
  if (crossSite(request)) return forbidden();
  if (isDemo()) return demoBlocked();
  if (rateLimited(request, "leads", 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Prea multe cereri. Încercați din nou peste câteva minute." }, { status: 429 });
  }

  const body: Record<string, unknown> | null = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  // A filled hidden field is a bot: answer as if it worked (so it doesn't retry), store nothing, count no conversion.
  if (body.website) return NextResponse.json({ ok: true, inline: true });

  const kind = body.kind === "apel" ? "apel" : "cerere";
  const name = line(body.name, 120);
  const phone = line(body.phone, 40);
  const email = kind === "apel" ? null : line(body.email, 160);
  const service = kind === "apel" ? null : text(body.service, 80);
  const errors = validateLead({ name: name ?? "", phone: phone ?? "", email: email ?? "", consent: body.consent === true }, kind);
  if (service && !services.some((s) => s.slug === service)) errors.service = "Serviciu necunoscut.";
  if (Object.keys(errors).length) return NextResponse.json({ error: "Verificați câmpurile marcate.", errors }, { status: 400 });

  // Too fast for a person (or no valid form token): kept and flagged, so a quick human is never lost, but not counted as a conversion.
  const suspect = await isSuspect(body.formToken, MIN_FILL_MS);
  const ft = sanitizeTouch(body.ft);
  const lt = sanitizeTouch(body.lt) ?? ft;
  const lead: LeadInput = {
    name: name as string,
    company: kind === "apel" ? null : line(body.company, 160),
    phone,
    email,
    service,
    message: kind === "apel" ? null : text(body.message, 2000),
    placement: line(body.placement, 60) ?? "necunoscut",
    page: line(body.page, 200) ?? "/",
    channel: classify(lt).channel,
    ft,
    lt,
    device: deviceFrom(request),
    kind,
    suspect,
  };

  let id: number;
  try {
    id = await db().insertLead(lead);
  } catch (error) {
    return unavailable(error);
  }
  after(() => notifyNewLead(id, lead, classify(ft).channel).catch((error) => console.error("Lead email failed", error)));

  return NextResponse.json({ ok: true, inline: suspect });
}
