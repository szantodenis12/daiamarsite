"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { removeFileByKey } from "@/lib/storage";
import { currentAuthor, requireSession } from "../session";
import { guardedVoid } from "./demo";
import { id } from "./form";

export const deleteFile = guardedVoid(async function deleteFile(form: FormData) {
  await requireSession();
  const fileId = id(form);
  const file = fileId ? await db().getFile(fileId) : null;
  if (!file) return;
  await removeFileByKey(file.key);
  await db().deleteFile(file.id);
  await db().insertActivity({ leadId: file.leadId, type: "nota", text: `Fișier șters: ${file.name}.`, author: await currentAuthor() });
  revalidatePath(`/admin/leads/${file.leadId}`);
});
