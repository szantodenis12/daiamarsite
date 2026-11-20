export const PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "li_fat_id",
] as const;

export type ParamKey = (typeof PARAM_KEYS)[number];

export type Touch = Partial<Record<ParamKey, string>> & {
  referrer?: string;
  landing: string;
  at: string;
};

export type Touches = { ft: Touch | null; lt: Touch | null };

const FIRST_TOUCH = "dm_ft";
const LAST_TOUCH = "dm_lt";
const FIRST_TOUCH_DAYS = 90;
const MAX_VALUE = 200;

function clip(value: unknown, max = MAX_VALUE): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function sanitizeTouch(input: unknown): Touch | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const landing = clip(raw.landing) ?? "/";
  const at = clip(raw.at, 40);
  const touch: Touch = { landing, at: at && !Number.isNaN(Date.parse(at)) ? at : new Date().toISOString() };
  for (const key of PARAM_KEYS) {
    const value = clip(raw[key]);
    if (value) touch[key] = value;
  }
  const referrer = clip(raw.referrer, 300);
  if (referrer) touch.referrer = referrer;
  return touch;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, touch: Touch, days?: number) {
  const expires = days ? `; max-age=${days * 86400}` : "";
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(touch))}; path=/; samesite=lax${expires}${secure}`;
}

function parseCookie(name: string): Touch | null {
  const value = readCookie(name);
  if (!value) return null;
  try {
    return sanitizeTouch(JSON.parse(value));
  } catch {
    return null;
  }
}

function externalReferrer(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    return new URL(document.referrer).host === location.host ? undefined : document.referrer;
  } catch {
    return undefined;
  }
}

// Kept in this module for the life of the page: it survives client-side navigation, and without consent it is the only
// place the touches live. The forms send it with the submission either way.
const memory: Touches = { ft: null, lt: null };
let captured = false;

/**
 * Runs once per full page load. Cookies are read and written only when the visitor accepted the functional category.
 * Returns true when this load starts a new last-touch session, so the caller can count it as a visit.
 */
export function captureAttribution(cookiesAllowed: boolean): boolean {
  if (captured) return false;
  captured = true;
  const params = new URLSearchParams(location.search);
  const touch: Touch = { landing: location.pathname, at: new Date().toISOString() };
  for (const key of PARAM_KEYS) {
    const value = clip(params.get(key));
    if (value) touch[key] = value;
  }
  const referrer = externalReferrer();
  if (referrer) touch.referrer = referrer.slice(0, 300);
  const hasSignal = Boolean(referrer) || PARAM_KEYS.some((key) => touch[key]);

  const stored = cookiesAllowed ? { ft: parseCookie(FIRST_TOUCH), lt: parseCookie(LAST_TOUCH) } : { ft: null, lt: null };
  const newSession = hasSignal || !stored.lt;
  memory.ft = stored.ft ?? touch;
  memory.lt = newSession ? touch : stored.lt;
  if (cookiesAllowed) persistAttribution();
  return newSession;
}

/** After "Accept": writes what was kept in memory. The first touch is never overwritten once its cookie exists. */
export function persistAttribution() {
  if (memory.ft && !parseCookie(FIRST_TOUCH)) writeCookie(FIRST_TOUCH, memory.ft, FIRST_TOUCH_DAYS);
  if (memory.lt) writeCookie(LAST_TOUCH, memory.lt);
}

/** After "Refuz" (or switching the category off): removes the cookies. The touches stay in memory for this page only. */
export function forgetAttribution() {
  for (const name of [FIRST_TOUCH, LAST_TOUCH]) document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function readTouches(): Touches {
  return captured ? { ...memory } : { ft: parseCookie(FIRST_TOUCH), lt: parseCookie(LAST_TOUCH) };
}

export function sendEvent(kind: string, placement?: string) {
  const body = JSON.stringify({ kind, placement, page: location.pathname, ...readTouches() });
  const sent = navigator.sendBeacon?.("/api/events/", new Blob([body], { type: "text/plain" }));
  if (!sent) void fetch("/api/events/", { method: "POST", body, keepalive: true }).catch(() => undefined);
}
