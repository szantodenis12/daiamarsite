import { isDemo } from "@/lib/demo";
import { NextResponse } from "next/server";
import { sanitizeTouch } from "@/lib/attribution";
import { classify } from "@/lib/channel";
import { db, EVENT_KINDS, type EventKind } from "@/lib/db";
import { crossSite, isBot, rateLimited } from "../request";

const isKind = (value: unknown): value is EventKind => EVENT_KINDS.includes(value as EventKind);

// Sent with navigator.sendBeacon as text/plain, so the body is parsed by hand. A visit is one anonymous row
// (channel, landing page, campaign tags): no cookie is needed or set for it.
export async function POST(request: Request) {
  if (crossSite(request)) return new NextResponse(null, { status: 403 });
  if (isDemo()) return new NextResponse(null, { status: 204 });
  if (rateLimited(request, "events", 60, 60_000)) return new NextResponse(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!isKind(body.kind)) return new NextResponse(null, { status: 400 });
  if (body.kind === "visit" && isBot(request)) return new NextResponse(null, { status: 204 });

  const ft = sanitizeTouch(body.ft);
  const lt = sanitizeTouch(body.lt) ?? ft;
  try {
    await db().insertEvent({
      kind: body.kind,
      placement: typeof body.placement === "string" ? body.placement.slice(0, 60) : null,
      page: typeof body.page === "string" ? body.page.slice(0, 200) : "/",
      channel: classify(lt).channel,
      ft,
      lt,
    });
  } catch (error) {
    console.error("Event not stored", error);
    return new NextResponse(null, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}
