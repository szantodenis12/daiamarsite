// A form asks for this token when it loads. Signed with FORM_SECRET (or ADMIN_SECRET), it proves when the form was shown,
// so the minimum fill time is measured on the server and cannot be faked by sending a number.
const encoder = new TextEncoder();
const MAX_AGE_MS = 24 * 3600_000;

const secret = () => process.env.FORM_SECRET || process.env.ADMIN_SECRET || null;

async function sign(value: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(`form:${key}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** `<issued ms>.<nonce>.<hmac>`; null when no secret is configured. */
export async function issueFormToken(now = Date.now()): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("");
  const value = `${now}.${nonce}`;
  return `${value}.${await sign(value, key)}`;
}

/** Milliseconds since the form was shown, or null when the token is missing, forged or older than a day. */
export async function formAge(token: unknown, now = Date.now()): Promise<number | null> {
  const key = secret();
  if (!key || typeof token !== "string") return null;
  const [issued, nonce, signature] = token.split(".");
  if (!issued || !nonce || !signature || !sameString(signature, await sign(`${issued}.${nonce}`, key))) return null;
  const age = now - Number(issued);
  return Number.isFinite(age) && age >= 0 && age <= MAX_AGE_MS ? age : null;
}

/**
 * Suspect = sent faster than a person could fill the form, or without a valid token. Without any secret (local setup
 * without admin) nothing is suspect, since there is no way to sign the time.
 */
export async function isSuspect(token: unknown, minFillMs: number): Promise<boolean> {
  if (!secret()) return false;
  const age = await formAge(token);
  return age === null || age < minFillMs;
}
