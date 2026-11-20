import { formAge } from "@/lib/form-token";
import { ACCEPTED_TYPES, MAX_FILE_BYTES, MAX_FILES, UPLOAD_KEY } from "@/lib/upload";

const TOKEN_MINUTES = 15;

// Per form token, in memory and per instance like the other limits: one form load may upload at most MAX_FILES files.
const issued = new Map<string, number>();

export class UploadRefused extends Error {}

/**
 * Checks a request for a direct-upload token (the onBeforeGenerateToken step of @vercel/blob's handleUpload) and returns
 * the constraints Blob enforces on the upload itself: type, size, no overwrite, short validity.
 */
export async function uploadTokenOptions(pathname: string, clientPayload: string | null, now = Date.now()) {
  if (!UPLOAD_KEY.test(pathname)) throw new UploadRefused("Nume de fișier invalid.");
  let formToken: unknown = null;
  try {
    formToken = (JSON.parse(clientPayload ?? "null") as { formToken?: unknown } | null)?.formToken;
  } catch {
    throw new UploadRefused("Cerere invalidă.");
  }
  if ((await formAge(formToken, now)) === null) throw new UploadRefused("Formularul a expirat. Reîncărcați pagina.");

  const count = issued.get(formToken as string) ?? 0;
  if (count >= MAX_FILES) throw new UploadRefused(`Cel mult ${MAX_FILES} fișiere la o trimitere.`);
  issued.set(formToken as string, count + 1);
  if (issued.size > 5000) issued.clear();

  return {
    allowedContentTypes: ACCEPTED_TYPES,
    maximumSizeInBytes: MAX_FILE_BYTES,
    addRandomSuffix: false,
    allowOverwrite: false,
    validUntil: now + TOKEN_MINUTES * 60_000,
  };
}
