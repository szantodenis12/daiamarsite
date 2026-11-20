import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unsubscribe } from "@/lib/newsletter";

// One-click unsubscribe (RFC 8058): mail apps POST here from the List-Unsubscribe header. A GET only opens the page with the button.
export async function POST(request: Request) {
  const t = new URL(request.url).searchParams.get("t");
  const subscriber = t ? await db().subscriberByToken(t) : null;
  if (subscriber) await unsubscribe(subscriber);
  return new NextResponse(null, { status: subscriber ? 200 : 404 });
}
