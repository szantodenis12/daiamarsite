import { db } from "@/lib/db";
import { pdfResponse } from "@/lib/offer-pdf/response";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const offer = await db().offerByToken((await params).token);
  if (!offer || offer.status === "ciorna") return new Response("Not found", { status: 404 });
  return pdfResponse(offer, true);
}
