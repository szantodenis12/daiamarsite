import type { Offer } from "@/lib/db";
import { getOfferSettings, offerUrl } from "@/lib/offer-store";
import { renderOfferPdf } from "./OfferPdf";

export async function pdfResponse(offer: Offer, download: boolean) {
  const pdf = await renderOfferPdf(offer, await getOfferSettings(), offerUrl(offer));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="Oferta-${offer.number}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
