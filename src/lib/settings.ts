import { db } from "@/lib/db";

const asStrings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.length > 0) : []);

export const getTeam = async () => asStrings(await db().getSetting("team"));
export const setTeam = (names: string[]) => db().setSetting("team", names);

export const getStoredRecipients = async () => asStrings(await db().getSetting("notify_to"));
export const setStoredRecipients = (emails: string[]) => db().setSetting("notify_to", emails);

const envRecipients = () =>
  (process.env.LEAD_NOTIFY_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

/** Addresses saved in admin win over LEAD_NOTIFY_TO, so the office can change them without a redeploy. */
export async function notifyRecipients(): Promise<{ to: string[]; from: "admin" | "env" | "none" }> {
  const stored = await getStoredRecipients();
  if (stored.length) return { to: stored, from: "admin" };
  const env = envRecipients();
  return { to: env, from: env.length ? "env" : "none" };
}
