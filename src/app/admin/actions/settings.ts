"use server";

import { revalidatePath } from "next/cache";
import { setStoredRecipients, setTeam } from "@/lib/settings";
import { sendWeeklySummary } from "@/lib/weekly";
import { requireSession } from "../session";
import { demoError, guarded } from "./demo";
import { DEMO_MESSAGE } from "@/lib/demo";
import type { FormState } from "./form";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/[\n,;]/)
    .map((line) => line.trim())
    .filter(Boolean);

export const saveRecipients = guarded(async function saveRecipients(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const emails = [...new Set(lines(form.get("emails")).map((e) => e.toLowerCase()))];
  const bad = emails.filter((e) => !EMAIL.test(e));
  if (bad.length) return { error: `Adrese invalide: ${bad.join(", ")}` };
  if (emails.length > 10) return { error: "Cel mult 10 adrese." };
  await setStoredRecipients(emails);
  revalidatePath("/admin/setari");
  return { ok: true };
}, demoError);

export const saveTeam = guarded(async function saveTeam(_: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const names = [...new Set(lines(form.get("team")).map((n) => n.slice(0, 60)))];
  if (names.length > 12) return { error: "Cel mult 12 nume." };
  await setTeam(names);
  revalidatePath("/admin", "layout");
  return { ok: true };
}, demoError);

export type WeeklyTestState = { message?: string; tone?: "ok" | "warn" | "error"; preview?: string };

export const sendWeeklyTest = guarded(async function sendWeeklyTest(): Promise<WeeklyTestState> {
  await requireSession();
  const result = await sendWeeklySummary();
  if (result.status === "sent") return { tone: "ok", message: `Trimis către ${result.to.join(", ")}.` };
  if (result.status === "skipped") return { tone: "warn", message: `Nu s-a trimis: ${result.reason} Iată ce ar fi conținut:`, preview: `${result.subject}\n\n${result.text}` };
  return { tone: "error", message: `Eroare: ${result.reason}` };
}, { tone: "warn", message: DEMO_MESSAGE });
