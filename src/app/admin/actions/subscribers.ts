"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { confirmSubscriber, unsubscribe } from "@/lib/newsletter";
import { requireSession } from "../session";

const refresh = () => revalidatePath("/admin/abonati");

async function find(form: FormData) {
  await requireSession();
  const token = form.get("token");
  return typeof token === "string" && token ? db().subscriberByToken(token) : null;
}

/** For addresses that could not get the confirmation email (no Resend yet) or that confirmed by phone. */
export async function confirmManually(form: FormData) {
  const subscriber = await find(form);
  if (subscriber) await confirmSubscriber(subscriber);
  refresh();
}

export async function unsubscribeManually(form: FormData) {
  const subscriber = await find(form);
  if (subscriber) await unsubscribe(subscriber);
  refresh();
}

export async function deleteSubscriber(form: FormData) {
  const subscriber = await find(form);
  if (subscriber) await db().deleteSubscriber(subscriber.id);
  refresh();
}
