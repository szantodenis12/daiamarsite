import { requireApiSession } from "@/app/admin/session";
import { db } from "@/lib/db";
import { pdfResponse } from "@/lib/offer-pdf/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const offerId = Number((await params).id);
  const offer = Number.isInteger(offerId) ? await db().getOffer(offerId) : null;
  if (!offer) return new Response("Not found", { status: 404 });
  return pdfResponse(offer, new URL(request.url).searchParams.has("download"));
}
