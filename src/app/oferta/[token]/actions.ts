"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { acceptOffer } from "@/lib/offer-store";
import { shownStatus } from "@/lib/offers";

export type AcceptState = { ok?: boolean; error?: string };

// Public action: the unguessable token is the only key, and only an open, unexpired offer can be accepted.
export async function accept(_: AcceptState, form: FormData): Promise<AcceptState> {
  const token = String(form.get("token") ?? "");
  const offer = token ? await db().offerByToken(token) : null;
  if (!offer) return { error: "Oferta nu a fost găsită." };
  const status = shownStatus(offer);
  if (status === "acceptata") return { ok: true };
  if (status !== "trimisa" && status !== "vazuta") return { error: "Oferta nu mai poate fi acceptată online. Vă rugăm să ne contactați telefonic." };
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const comment = String(form.get("comment") ?? "").trim().slice(0, 1000);
  await acceptOffer(offer, name, comment);
  revalidatePath(`/oferta/${token}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
