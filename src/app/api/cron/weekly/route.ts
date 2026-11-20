import { NextResponse } from "next/server";
import { sendWeeklySummary } from "@/lib/weekly";

export const dynamic = "force-dynamic";

// Vercel Cron sends "Authorization: Bearer $CRON_SECRET" when the variable is set on the project.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendWeeklySummary();
  return NextResponse.json(result, { status: result.status === "error" ? 502 : 200 });
}
