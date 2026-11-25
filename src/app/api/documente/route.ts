import { isDemo } from "@/lib/demo";
import { after, NextResponse } from "next/server";
import { sanitizeTouch, type Touch } from "@/lib/attribution";
import { classify } from "@/lib/channel";
import { PUBLIC_FORM_AUTHOR } from "@/lib/crm";
import { db, type LeadInput } from "@/lib/db";
import { isSuspect } from "@/lib/form-token";
import { validateLead } from "@/lib/lead";
import { blobEnabled, readFileHead, removeFileByKey, storeFile } from "@/lib/storage";
import { cleanFileName, detectType, MAX_FILE_BYTES, MAX_FILES, UPLOAD_KEY } from "@/lib/upload";
import { notifyNewLead } from "../leads/notify";
import { crossSite, demoBlocked, deviceFrom, forbidden, line, rateLimited, text, unavailable } from "../request";

const MIN_FILL_MS = 3000;
const decimal = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 1 });
const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${decimal.format(bytes / 1024 / 1024)} MB`);

/** A file that is already stored (local fallback: stored after the check; direct upload: stored by the browser, checked here). */
type Checked = { name: string; key: string; size: number; type: string };
type Fields = { name: unknown; phone: unknown; email: unknown; message: unknown; consent: boolean; formToken: unknown; ft: unknown; lt: unknown };

const tooMany = `Cel mult ${MAX_FILES} fișiere la o trimitere.`;

/** Local fallback (no Blob token): the files come in this request. Checked by their first bytes, then written to .data/uploads/. */
async function storeMultipart(entries: FormDataEntryValue[]): Promise<Checked[] | string> {
  const files = entries.filter((e): e is File => e instanceof File && e.size > 0);
  if (!files.length) return "Atașați cel puțin un fișier.";
  if (files.length > MAX_FILES) return tooMany;
  const checked: { file: File; bytes: Uint8Array; type: string; ext: string }[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) return `„${file.name}” depășește 10 MB.`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectType(bytes);
    if (!detected) return `„${file.name}” nu este PDF, JPG, PNG sau HEIC.`;
    checked.push({ file, bytes, type: detected.type, ext: detected.ext });
  }
  const stored: Checked[] = [];
  for (const c of checked) {
    stored.push({ name: cleanFileName(c.file.name, c.ext), key: await storeFile(c.bytes, c.ext, c.type), size: c.bytes.byteLength, type: c.type });
  }
  return stored;
}

const uploadedItems = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>) : {}))
    .map((item) => ({ key: typeof item.key === "string" ? item.key : "", name: typeof item.name === "string" ? item.name : "" }));

/** Deletes the files a rejected direct upload already put in Blob, so nothing is left behind. */
const discardUploads = (value: unknown) =>
  Promise.all([...new Set(uploadedItems(value).map((i) => i.key))].filter((key) => UPLOAD_KEY.test(key)).map(removeFileByKey));

/** Direct upload: the browser already put the files in Blob. Every one is checked here; if one fails, all of them are deleted. */
async function checkUploaded(value: unknown): Promise<Checked[] | string> {
  const items = uploadedItems(value);
  const keys = new Set(items.map((i) => i.key).filter((key) => UPLOAD_KEY.test(key)));
  const discard = async (message: string) => {
    await discardUploads(value);
    return message;
  };
  if (!items.length) return "Atașați cel puțin un fișier.";
  if (items.length > MAX_FILES) return discard(tooMany);
  if (keys.size !== items.length) return discard("Fișierele nu au putut fi verificate. Încercați din nou.");

  const checked: Checked[] = [];
  for (const item of items) {
    const stored = await readFileHead(item.key);
    if (!stored) return discard(`„${item.name}” nu a ajuns la noi. Încercați din nou.`);
    if (stored.size > MAX_FILE_BYTES) return discard(`„${item.name}” depășește 10 MB.`);
    const detected = detectType(stored.head);
    if (!detected) return discard(`„${item.name}” nu este PDF, JPG, PNG sau HEIC.`);
    checked.push({ name: cleanFileName(item.name, detected.ext), key: item.key, size: stored.size, type: detected.type });
  }
  return checked;
}

const parseTouch = (value: unknown): Touch | null => {
  if (typeof value !== "string") return sanitizeTouch(value);
  try {
    return sanitizeTouch(JSON.parse(value));
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  if (crossSite(request)) return forbidden();
  if (isDemo()) return demoBlocked();
  if (rateLimited(request, "documente", 3, 10 * 60_000)) {
    return NextResponse.json({ error: "Prea multe trimiteri. Încercați din nou peste câteva minute." }, { status: 429 });
  }

  const direct = request.headers.get("content-type")?.startsWith("application/json") ?? false;
  let fields: Fields;
  let honeypot: unknown;
  let files: () => Promise<Checked[] | string>;
  let uploaded: unknown = [];
  if (direct) {
    if (!blobEnabled()) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
    const body: Record<string, unknown> | null = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
    fields = { ...body, consent: body.consent === true } as Fields;
    honeypot = body.website;
    uploaded = body.files;
    files = () => checkUploaded(body.files);
  } else {
    const form = await request.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
    fields = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      message: form.get("message"),
      consent: form.get("consent") === "true",
      formToken: form.get("formToken"),
      ft: form.get("ft"),
      lt: form.get("lt"),
    };
    honeypot = form.get("website");
    files = () => storeMultipart(form.getAll("files"));
  }

  if (honeypot) {
    await discardUploads(uploaded);
    return NextResponse.json({ ok: true, inline: true });
  }

  const name = line(fields.name, 120);
  const phone = line(fields.phone, 40);
  const email = line(fields.email, 160);
  const errors: Record<string, string> = validateLead({ name: name ?? "", phone: phone ?? "", email: email ?? "", consent: fields.consent });
  if (Object.keys(errors).length) {
    await discardUploads(uploaded);
    return NextResponse.json({ error: "Verificați câmpurile marcate.", errors }, { status: 400 });
  }

  const suspect = await isSuspect(fields.formToken, MIN_FILL_MS);
  const ft = parseTouch(fields.ft);
  const lt = parseTouch(fields.lt) ?? ft;
  const message = text(fields.message, 2000);

  try {
    const checked = await files();
    if (typeof checked === "string") return NextResponse.json({ error: "Verificați câmpurile marcate.", errors: { files: checked } }, { status: 400 });

    // Always a new lead, even when the phone or email matches an existing one: nobody has checked who sent it. The duplicate
    // check flags it next to the known lead and the team merges the two by hand.
    const lead: LeadInput = {
      name: name as string,
      company: null,
      phone,
      email,
      service: null,
      message,
      placement: "documente",
      page: "/trimite-documente/",
      channel: classify(lt).channel,
      ft,
      lt,
      device: deviceFrom(request),
      kind: "documente",
      suspect,
    };
    const leadId = await db().insertLead(lead);
    for (const file of checked) await db().insertFile({ leadId, name: file.name, size: file.size, type: file.type, key: file.key });
    const list = checked.map((f) => `${f.name} (${formatSize(f.size)})`).join(", ");
    await db().insertActivity({ leadId, type: "documente", text: `Documente primite de pe site, trimise de „${name}”: ${list}.`, author: PUBLIC_FORM_AUTHOR });
    after(() => notifyNewLead(leadId, lead, classify(ft).channel).catch((error) => console.error("Lead email failed", error)));
  } catch (error) {
    return unavailable(error);
  }

  return NextResponse.json({ ok: true, inline: suspect });
}
