import { NextResponse } from "next/server";
import { DEMO_MESSAGE, isDemoError } from "@/lib/demo";
import { company } from "@/lib/site";

// In-memory and per server instance: enough to stop a form being hammered, not a security boundary.
// The IP is only a map key in memory and is never stored.
const hits = new Map<string, number[]>();

/** Vercel sets x-real-ip and overwrites x-forwarded-for, so neither can be spoofed there. */
export function clientIp(headers: Headers): string {
  return headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

/** Counts a hit for `key` and says whether it is over `limit` within the window. */
export function overLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}

export function recentHits(key: string, windowMs: number): number {
  const now = Date.now();
  return (hits.get(key) ?? []).filter((t) => now - t < windowMs).length;
}

export const clearHits = (key: string) => hits.delete(key);

export function rateLimited(request: Request, bucket: string, limit: number, windowMs: number): boolean {
  return overLimit(`${bucket}:${clientIp(request.headers)}`, limit, windowMs);
}

/** Browsers always send Origin on cross-site POSTs; requests without it (curl, server-side) are let through. */
export function crossSite(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return true;
  }
}

export const forbidden = () => NextResponse.json({ error: "Cerere respinsă." }, { status: 403 });

const phones = company.phones.map((p) => p.label).join(" sau ");

/** The visitor's data could not be saved: say so plainly and give the phone numbers. */
export function unavailable(error: unknown) {
  if (isDemoError(error)) return demoBlocked();
  console.error("Public form failed", error);
  return NextResponse.json({ error: `Nu am putut salva mesajul acum. Sunați-ne la ${phones}.`, unavailable: true }, { status: 503 });
}

export function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

/** Single-line fields (name, company, phone): line breaks and runs of spaces become one space, so they cannot reach email headers. */
export const line = (value: unknown, max: number) => text(typeof value === "string" ? value.replace(/\s+/g, " ") : value, max);

export function deviceFrom(request: Request): string {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (/iPad|Tablet/i.test(userAgent)) return "tabletă";
  if (/Mobi|Android|iPhone/i.test(userAgent)) return "mobil";
  return "desktop";
}

export const isBot = (request: Request) => /bot|crawl|spider|slurp|headless|lighthouse|preview|curl|wget|python|scrapy/i.test(request.headers.get("user-agent") ?? "");

/** Demo mode: nothing is saved. Public forms show this message instead of a thank-you. */
export const demoBlocked = () => NextResponse.json({ ok: false, demo: true, error: DEMO_MESSAGE }, { status: 409 });
