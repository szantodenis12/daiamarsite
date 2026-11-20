import { db, type Subscriber } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { company, SITE_URL } from "@/lib/site";

export const NEWSLETTER_NAME = "Noutăți fiscale";

/** 24 random bytes, URL-safe: the confirm and unsubscribe links cannot be guessed from the email. */
export function newSubscriberToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const confirmUrl = (token: string) => `${SITE_URL}/newsletter/confirmare/?t=${token}`;
export const unsubscribeUrl = (token: string) => `${SITE_URL}/newsletter/dezabonare/?t=${token}`;
const oneClickUrl = (token: string) => `${SITE_URL}/api/newsletter/dezabonare/?t=${token}`;

export async function sendConfirmation(subscriber: Pick<Subscriber, "email" | "name" | "token">) {
  const text = [
    `Bună ziua${subscriber.name ? `, ${subscriber.name}` : ""},`,
    "",
    `Ați cerut să primiți „${NEWSLETTER_NAME}” de la ${company.name}. Ca să confirmați adresa, apăsați pe link:`,
    confirmUrl(subscriber.token),
    "",
    "Dacă nu dumneavoastră ați făcut cererea, ignorați acest mesaj: fără confirmare nu trimitem nimic.",
    "",
    `${company.name}, ${company.address}`,
    `Dezabonare oricând: ${unsubscribeUrl(subscriber.token)}`,
  ].join("\n");
  return sendEmail({
    to: [subscriber.email],
    subject: `Confirmați abonarea la ${NEWSLETTER_NAME}`,
    text,
    headers: { "List-Unsubscribe": `<${oneClickUrl(subscriber.token)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}

export async function confirmSubscriber(subscriber: Subscriber) {
  if (subscriber.status === "confirmed") return;
  await db().updateSubscriber(subscriber.id, { status: "confirmed", confirmedAt: new Date().toISOString(), unsubscribedAt: null });
}

export async function unsubscribe(subscriber: Subscriber) {
  if (subscriber.status === "unsubscribed") return;
  await db().updateSubscriber(subscriber.id, { status: "unsubscribed", unsubscribedAt: new Date().toISOString() });
}
