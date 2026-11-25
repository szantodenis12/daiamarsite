"use server";

import { redirect } from "next/navigation";
import { isDemo } from "@/lib/demo";
import { db } from "@/lib/db";
import { confirmSubscriber, unsubscribe } from "@/lib/newsletter";

const token = (form: FormData) => String(form.get("t") ?? "").slice(0, 64);

// The links in the emails only open a page; the change happens here, on the button's POST. Mail scanners that pre-fetch
// links (Outlook Safe Links, corporate gateways) therefore cannot confirm or unsubscribe anyone.
export async function confirmAction(form: FormData) {
  const t = token(form);
  const subscriber = t && !isDemo() ? await db().subscriberByToken(t) : null;
  if (subscriber) await confirmSubscriber(subscriber);
  redirect(`/newsletter/confirmare/?t=${encodeURIComponent(t)}`);
}

export async function unsubscribeAction(form: FormData) {
  const t = token(form);
  const subscriber = t && !isDemo() ? await db().subscriberByToken(t) : null;
  if (subscriber) await unsubscribe(subscriber);
  redirect(`/newsletter/dezabonare/?t=${encodeURIComponent(t)}`);
}
