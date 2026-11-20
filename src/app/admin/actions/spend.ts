"use server";

import { revalidatePath } from "next/cache";
import { AD_CHANNELS } from "@/lib/crm";
import { db } from "@/lib/db";
import { requireSession } from "../session";
import { lei, text, type FormState } from "./form";

/** Saves one month: one amount per ad channel. An empty field removes that channel's amount. */
export async function saveSpendMonth(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const month = text(form, "month", 7);
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return { error: "Alegeți luna." };
  const amounts = AD_CHANNELS.map((c) => [c.key, lei(form, c.key)] as const);
  const invalid = amounts.filter(([, amount]) => amount === undefined).map(([key]) => [key, "Sumă invalidă."]);
  if (invalid.length) return { error: "Verificați sumele marcate.", errors: Object.fromEntries(invalid) };
  for (const [key, amount] of amounts) await db().setSpend(month, key, amount ?? 0);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
