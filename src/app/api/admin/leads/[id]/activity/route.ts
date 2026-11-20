import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentAuthor, requireApiSession } from "@/app/admin/session";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/leads";

const QUICK = { apel: "Apel inițiat din panou.", whatsapp: "Mesaj WhatsApp deschis din panou.", email: "Email deschis din panou." } as const;

// The quick contact buttons post here with keepalive, so logging survives the jump to the phone, WhatsApp or mail app.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const leadId = Number((await params).id);
  const body: { type?: unknown } | null = await request.json().catch(() => null);
  const type = body?.type;
  if (!Number.isInteger(leadId) || typeof type !== "string" || !(type in QUICK)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!(await db().getLead(leadId))) return NextResponse.json({ error: "not found" }, { status: 404 });

  const key = type as keyof typeof QUICK;
  await logActivity({ leadId, type: key, text: QUICK[key], author: await currentAuthor() });
  revalidatePath("/admin", "layout");
  return NextResponse.json({ ok: true });
}
