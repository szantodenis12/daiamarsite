export const SESSION_COOKIE = "dm_admin";
export const SESSION_DAYS = 14;

const encoder = new TextEncoder();

async function hmac(value: string): Promise<string> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not set");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const expires = String(Date.now() + SESSION_DAYS * 86400_000);
  return `${expires}.${await hmac(expires)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.ADMIN_SECRET) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return sameString(signature, await hmac(expires));
}

// Both sides are hashed first so the comparison time does not depend on the password length.
export async function checkPassword(input: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !process.env.ADMIN_SECRET) return false;
  return sameString(await hmac(`pw:${input}`), await hmac(`pw:${password}`));
}
