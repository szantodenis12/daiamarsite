import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth";
import { clearHits, clientIp, crossSite, forbidden, overLimit, recentHits } from "../request";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;
const DELAY_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const lockedPage = `<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Prea multe încercări</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;line-height:1.5">
<h1 style="font-size:1.4rem">Prea multe încercări</h1><p>Parola a fost greșită de ${MAX_FAILURES} ori. Încercați din nou peste 15 minute.</p>
<p><a href="/admin/login/">Înapoi la autentificare</a></p></body></html>`;

// Failed attempts are counted per IP in memory, per server instance (see DEPLOY.md). Every attempt waits the same
// short time, so guessing is slow and the answer time says nothing about the password.
export async function POST(request: Request) {
  if (crossSite(request)) return forbidden();
  const key = `login:${clientIp(request.headers)}`;
  const form = await request.formData().catch(() => null);
  const next = String(form?.get("next") ?? "");
  const target = next.startsWith("/admin") ? next : "/admin/";
  await sleep(DELAY_MS);

  if (recentHits(key, WINDOW_MS) >= MAX_FAILURES) {
    return new NextResponse(lockedPage, { status: 429, headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": String(WINDOW_MS / 1000) } });
  }

  if (!(await checkPassword(String(form?.get("password") ?? "")))) {
    overLimit(key, MAX_FAILURES, WINDOW_MS);
    return NextResponse.redirect(new URL(`/admin/login/?error=1&next=${encodeURIComponent(target)}`, request.url), 303);
  }

  clearHits(key);
  const response = NextResponse.redirect(new URL(target, request.url), 303);
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return response;
}
