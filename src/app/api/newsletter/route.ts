import { after, NextResponse } from "next/server";
import { sanitizeTouch } from "@/lib/attribution";
import { classify } from "@/lib/channel";
import { normalizeEmail } from "@/lib/crm";
import { db } from "@/lib/db";
import { canSendEmail } from "@/lib/email";
import { isSuspect } from "@/lib/form-token";
import { isEmail } from "@/lib/lead";
import { newSubscriberToken, sendConfirmation } from "@/lib/newsletter";
import { crossSite, forbidden, line, rateLimited, unavailable } from "../request";

const MIN_FILL_MS = 2000;

export async function POST(request: Request) {
  if (crossSite(request)) return forbidden();
  if (rateLimited(request, "newsletter", 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Prea multe încercări. Reveniți peste câteva minute." }, { status: 429 });
  }

  const body: Record<string, unknown> | null = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  if (body.website) return NextResponse.json({ ok: true, inline: true, emailed: false });

  const email = normalizeEmail(line(body.email, 160));
  const errors: Record<string, string> = {};
  if (!email || !isEmail(email)) errors.email = "Adresa de e-mail nu este validă.";
  if (body.consent !== true) errors.consent = "Avem nevoie de acordul dumneavoastră ca să vă trimitem noutățile.";
  if (Object.keys(errors).length) return NextResponse.json({ error: "Verificați câmpurile marcate.", errors }, { status: 400 });

  // A suspect signup is kept as "de confirmat" but gets no email: the team confirms it by hand if it is real.
  const suspect = await isSuspect(body.formToken, MIN_FILL_MS);
  const emailed = canSendEmail() && !suspect;

  try {
    const existing = await db().subscriberByEmail(email as string);
    // A confirmed address gets the same answer as a new one, so the form cannot be used to test who is subscribed.
    if (existing?.status === "confirmed") return NextResponse.json({ ok: true, inline: suspect, emailed });

    const name = line(body.name, 120);
    const companyName = line(body.company, 160);
    // While an address waits for confirmation, a second signup keeps its token (the first email's link keeps working)
    // and does not overwrite what was already filled in.
    const subscriber = existing
      ? { email: existing.email, name: existing.name ?? name, company: existing.company ?? companyName, token: existing.status === "pending" ? existing.token : newSubscriberToken() }
      : { email: email as string, name, company: companyName, token: newSubscriberToken() };

    if (existing) {
      await db().updateSubscriber(existing.id, { ...subscriber, status: "pending", unsubscribedAt: null });
    } else {
      const ft = sanitizeTouch(body.ft);
      const lt = sanitizeTouch(body.lt) ?? ft;
      await db().insertSubscriber({
        ...subscriber,
        status: "pending",
        placement: line(body.placement, 60) ?? "necunoscut",
        page: line(body.page, 200) ?? "/",
        channel: classify(lt).channel,
        ft,
        lt,
        confirmedAt: null,
        unsubscribedAt: null,
        suspect,
      });
    }
    if (emailed) after(() => sendConfirmation(subscriber).then((r) => !r.ok && console.error("Newsletter email failed", r.reason)));
  } catch (error) {
    return unavailable(error);
  }

  return NextResponse.json({ ok: true, inline: suspect, emailed });
}
