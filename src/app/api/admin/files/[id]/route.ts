import { requireApiSession } from "@/app/admin/session";
import { db } from "@/lib/db";
import { readFileByKey } from "@/lib/storage";

type Props = { params: Promise<{ id: string }> };

// The storage key never reaches the browser: the file is streamed through here, to a signed-in admin only.
export async function GET(_: Request, { params }: Props) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const id = Number((await params).id);
  const file = Number.isInteger(id) ? await db().getFile(id) : null;
  const stored = file ? await readFileByKey(file.key) : null;
  if (!file || !stored) return new Response("Fișierul nu există.", { status: 404 });

  const name = encodeURIComponent(file.name);
  return new Response(stored.stream, {
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(stored.size),
      "Content-Disposition": `attachment; filename="${name}"; filename*=UTF-8''${name}`,
      "Cache-Control": "private, no-store",
    },
  });
}
