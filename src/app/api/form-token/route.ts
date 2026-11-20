import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/form-token";
import { blobEnabled } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Each form fetches this once when it loads. `uploads` tells the document form whether to send files straight to Blob.
export async function GET() {
  return NextResponse.json(
    { token: await issueFormToken(), uploads: blobEnabled() ? "blob" : "local" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
