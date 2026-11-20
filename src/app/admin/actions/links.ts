"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { LINK_PAGES } from "../links";
import { requireSession } from "../session";
import { id, text, type FormState } from "./form";

const UTM = /^[a-z0-9][a-z0-9._-]*$/;

export async function saveLink(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const values = {
    label: text(form, "label", 80),
    page: text(form, "page", 200),
    source: text(form, "source", 60)?.toLowerCase() ?? null,
    medium: text(form, "medium", 60)?.toLowerCase() ?? null,
    campaign: text(form, "campaign", 80)?.toLowerCase() ?? null,
    content: text(form, "content", 80)?.toLowerCase() ?? "",
  };
  const errors: Record<string, string> = {};
  if (!values.label) errors.label = "Dați-i un nume, ca să-l recunoașteți în listă.";
  if (!values.page || !LINK_PAGES.some((p) => p.path === values.page)) errors.page = "Alegeți pagina.";
  for (const key of ["source", "medium", "campaign"] as const) {
    if (!values[key] || !UTM.test(values[key])) errors[key] = "Doar litere mici, cifre, - și _.";
  }
  if (values.content && !UTM.test(values.content)) errors.content = "Doar litere mici, cifre, - și _.";
  if (Object.keys(errors).length) return { error: "Verificați câmpurile marcate.", errors };

  await db().insertLink(values as { label: string; page: string; source: string; medium: string; campaign: string; content: string });
  revalidatePath("/admin/linkuri");
  return { ok: true };
}

export async function deleteLink(form: FormData) {
  await requireSession();
  const linkId = id(form);
  if (linkId) await db().deleteLink(linkId);
  revalidatePath("/admin/linkuri");
}
