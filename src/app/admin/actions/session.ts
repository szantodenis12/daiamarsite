"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";
import { removeFileByKey } from "@/lib/storage";
import { getTeam } from "@/lib/settings";
import { AUTHOR_COOKIE, requireSession } from "../session";

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login/");
}

export async function setAuthor(formData: FormData) {
  await requireSession();
  const name = String(formData.get("author") ?? "");
  const store = await cookies();
  if (!(await getTeam()).includes(name)) store.delete(AUTHOR_COOKIE);
  else store.set(AUTHOR_COOKIE, name, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 365 * 86400 });
  revalidatePath("/admin", "layout");
}

export async function deleteDemoData() {
  await requireSession();
  for (const file of await db().demoFiles()) await removeFileByKey(file.key);
  await db().deleteDemo();
  revalidatePath("/admin", "layout");
}
