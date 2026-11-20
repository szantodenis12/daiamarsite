import { NextResponse } from "next/server";
import { rateLimited } from "../request";

// Collects Content-Security-Policy reports in the server log (Vercel → Logs) while the header is Report-Only.
export async function POST(request: Request) {
  if (!rateLimited(request, "csp", 30, 60_000)) {
    const body = (await request.text().catch(() => "")).slice(0, 4000);
    console.warn("CSP report", body);
  }
  return new NextResponse(null, { status: 204 });
}
