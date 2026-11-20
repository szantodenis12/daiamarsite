import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";

function randomKey(ext: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}.${ext}`;
}

export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const localDir = () => path.join(process.cwd(), ".data", "uploads");

/** Vercel's filesystem is read-only: without Blob there is nowhere to keep a file, so say what is missing. */
function assertWritable() {
  if (!blobEnabled() && process.env.VERCEL) throw new Error("BLOB_READ_WRITE_TOKEN is not set. Connect Vercel Blob (see DEPLOY.md).");
}

export type Stored = { stream: ReadableStream<Uint8Array>; size: number };

/** Private Vercel Blob when BLOB_READ_WRITE_TOKEN is set, else .data/uploads/ for local development. Returns the storage key. */
export async function storeFile(bytes: Uint8Array, ext: string, contentType: string): Promise<string> {
  assertWritable();
  const key = `documente/${randomKey(ext)}`;
  if (blobEnabled()) {
    await put(key, Buffer.from(bytes), { access: "private", contentType, addRandomSuffix: false });
    return key;
  }
  const file = path.join(localDir(), path.basename(key));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
  return key;
}

export async function readFileByKey(key: string): Promise<Stored | null> {
  if (blobEnabled()) {
    const result = await get(key, { access: "private" });
    return result?.statusCode === 200 ? { stream: result.stream, size: result.blob.size } : null;
  }
  try {
    const buffer = await readFile(path.join(localDir(), path.basename(key)));
    return { stream: new Blob([buffer]).stream(), size: buffer.byteLength };
  } catch {
    return null;
  }
}

/** Size and the first `count` bytes of a stored file, without downloading the rest. Null when the file does not exist. */
export async function readFileHead(key: string, count = 16): Promise<{ size: number; head: Uint8Array } | null> {
  const stored = await readFileByKey(key);
  if (!stored) return null;
  const reader = stored.stream.getReader();
  const head = new Uint8Array(count);
  let filled = 0;
  while (filled < count) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    const take = value.subarray(0, count - filled);
    head.set(take, filled);
    filled += take.length;
  }
  await reader.cancel().catch(() => undefined);
  return { size: stored.size, head: head.subarray(0, filled) };
}

export async function removeFileByKey(key: string): Promise<void> {
  if (blobEnabled()) {
    await del(key).catch(() => undefined);
    return;
  }
  await rm(path.join(localDir(), path.basename(key)), { force: true });
}
