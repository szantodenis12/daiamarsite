import { NextResponse } from "next/server";
import { normalizePhone, STATUS_LABELS } from "@/lib/crm";
import { requireApiSession } from "@/app/admin/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const digits = normalizePhone(q) ?? (q.replace(/\D/g, "").length >= 4 ? q.replace(/\D/g, "") : null);

  const leads = await db().leadsSince(new Date(0));
  const results = leads
    .filter(
      (l) =>
        [l.name, l.company, l.email].some((v) => v?.toLowerCase().includes(q)) ||
        Boolean(digits && l.phone?.replace(/\D/g, "").includes(digits.replace(/^0/, ""))),
    )
    .slice(0, 8)
    .map((l) => ({ id: l.id, name: l.name, detail: l.company ?? l.phone ?? l.email ?? "", status: STATUS_LABELS[l.status] }));
  return NextResponse.json({ results });
}
