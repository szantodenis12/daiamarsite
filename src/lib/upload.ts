// Shared by the browser form and the API routes, so it must not import anything from Node.
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type Accepted = { type: string; ext: string; matches: (bytes: Uint8Array) => boolean };

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));

// The extension and the browser's MIME type are claims; the first bytes decide.
const ACCEPTED: Accepted[] = [
  { type: "application/pdf", ext: "pdf", matches: (b) => ascii(b, 0, 4) === "%PDF" },
  { type: "image/jpeg", ext: "jpg", matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", ext: "png", matches: (b) => b[0] === 0x89 && ascii(b, 1, 4) === "PNG" },
  { type: "image/heic", ext: "heic", matches: (b) => ascii(b, 4, 8) === "ftyp" && /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(ascii(b, 8, 12)) },
];

export const ACCEPTED_EXTENSIONS = ACCEPTED.map((a) => `.${a.ext}`).concat(".jpeg");
export const ACCEPTED_TYPES = ACCEPTED.map((a) => a.type);

export function detectType(bytes: Uint8Array): Accepted | null {
  return ACCEPTED.find((a) => a.matches(bytes)) ?? null;
}

/** Direct uploads to Blob: the browser picks a random key of this shape, and the server accepts no other. */
export const UPLOAD_KEY = /^documente\/[0-9a-f]{64}\.(pdf|jpg|png|heic)$/;

export function randomUploadKey(ext: string): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
  return `documente/${hex}.${ext}`;
}

export const cleanFileName = (name: string, ext: string) => name.replace(/[\r\n"]/g, "").slice(0, 160) || `document.${ext}`;
