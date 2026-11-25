import { isDemo } from "@/lib/demo";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { blobEnabled } from "@/lib/storage";
import { MAX_FILES } from "@/lib/upload";
import { UploadRefused, uploadTokenOptions } from "@/lib/upload-token";
import { crossSite, demoBlocked, forbidden, rateLimited } from "../../request";

// Hands the browser a short-lived token to upload one file straight to the private Blob store, so the file never passes
// through a Vercel function (they reject bodies over 4.5 MB). /api/documente/ then checks the stored files and files them.
export async function POST(request: Request) {
  if (crossSite(request)) return forbidden();
  if (isDemo()) return demoBlocked();
  if (!blobEnabled()) return NextResponse.json({ error: "Încărcarea directă nu este configurată." }, { status: 404 });
  if (rateLimited(request, "upload-token", 3 * MAX_FILES, 10 * 60_000)) {
    return NextResponse.json({ error: "Prea multe trimiteri. Încercați din nou peste câteva minute." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (body?.type !== "blob.generate-client-token") return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  try {
    return NextResponse.json(await handleUpload({ request, body, onBeforeGenerateToken: (pathname, clientPayload) => uploadTokenOptions(pathname, clientPayload) }));
  } catch (error) {
    if (error instanceof UploadRefused) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Upload token failed", error);
    return NextResponse.json({ error: "Încărcarea nu a putut începe." }, { status: 500 });
  }
}
