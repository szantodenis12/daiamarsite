"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileCheck, X } from "lucide-react";
import { readTouches } from "@/lib/attribution";
import { rememberConversion, useFormSession } from "@/lib/form-client";
import { validateLead } from "@/lib/lead";
import { ACCEPTED_EXTENSIONS, detectType, MAX_FILE_BYTES, MAX_FILES, randomUploadKey } from "@/lib/upload";
import { FormFailure, FormSuccess } from "./FormStatus";
import styles from "./UploadForm.module.css";

type Values = { name: string; phone: string; email: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Values | "files", string>>;

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString("ro-RO", { maximumFractionDigits: 1 })} MB`;

export default function UploadForm({ placement }: { placement: string }) {
  const id = useId();
  const router = useRouter();
  const session = useFormSession();
  const input = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<Values>({ name: "", phone: "", email: "", message: "", consent: false });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "failed" | "done">("idle");
  const [failure, setFailure] = useState("");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const file of Array.from(list)) if (!next.some((f) => f.name === file.name && f.size === file.size)) next.push(file);
    setFiles(next.slice(0, MAX_FILES));
    setErrors((prev) => ({ ...prev, files: next.length > MAX_FILES ? `Cel mult ${MAX_FILES} fișiere. Le-am păstrat pe primele ${MAX_FILES}.` : undefined }));
    if (input.current) input.current.value = "";
  }

  function checkFiles(): string | undefined {
    if (!files.length) return "Atașați cel puțin un fișier.";
    const big = files.find((f) => f.size > MAX_FILE_BYTES);
    if (big) return `„${big.name}” depășește 10 MB.`;
    return undefined;
  }

  /** The server checks the first bytes again; checking here too tells the visitor at once which file is wrong. */
  async function detectAll() {
    const detected = [];
    for (const file of files) {
      const type = detectType(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
      if (!type) return `„${file.name}” nu este PDF, JPG, PNG sau HEIC.`;
      detected.push({ file, type });
    }
    return detected;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors = { ...validateLead({ ...values }), files: checkFiles() };
    for (const key of Object.keys(found) as (keyof Errors)[]) if (!found[key]) delete found[key];
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    const website = new FormData(event.currentTarget).get("website");
    try {
      const detected = await detectAll();
      if (typeof detected === "string") {
        setErrors({ files: detected });
        setStatus("idle");
        return;
      }
      const { token, uploads } = await session();
      const touches = readTouches();
      let response: Response;
      if (uploads === "blob") {
        // Straight from the browser to the private Blob store: a Vercel function would reject a body over 4.5 MB.
        const { upload } = await import("@vercel/blob/client");
        const stored = [];
        for (const { file, type } of detected) {
          const blob = await upload(randomUploadKey(type.ext), file, {
            access: "private",
            handleUploadUrl: "/api/documente/upload/",
            clientPayload: JSON.stringify({ formToken: token }),
            contentType: type.type,
          });
          stored.push({ key: blob.pathname, name: file.name });
        }
        response = await fetch("/api/documente/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, placement, website, formToken: token, ...touches, files: stored }),
        });
      } else {
        const body = new FormData();
        for (const [key, value] of Object.entries(values)) body.set(key, String(value));
        for (const file of files) body.append("files", file);
        body.set("placement", placement);
        if (website) body.set("website", String(website));
        if (token) body.set("formToken", token);
        body.set("ft", JSON.stringify(touches.ft));
        body.set("lt", JSON.stringify(touches.lt));
        response = await fetch("/api/documente/", { method: "POST", body });
      }
      const result: { error?: string; errors?: Errors; inline?: boolean } = await response.json().catch(() => ({ error: "Documentele nu au putut fi trimise." }));
      if (!response.ok) {
        setErrors(result.errors ?? {});
        setFailure(result.error ?? "Documentele nu au putut fi trimise.");
        setStatus("failed");
        return;
      }
      if (result.inline) {
        setStatus("done");
        return;
      }
      rememberConversion("documente");
      router.push(`/multumim/?tip=documente&f=${encodeURIComponent(placement)}`);
    } catch {
      setFailure("Documentele nu au putut fi trimise. Verificați conexiunea și încercați din nou.");
      setStatus("failed");
    }
  }

  const field = (key: keyof Values) => ({
    id: `${id}-${key}`,
    name: key,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
  });
  const error = (key: keyof Errors) => errors[key] && <span id={`${id}-${key}-error`} className={styles.error}>{errors[key]}</span>;

  if (status === "done") return <FormSuccess kind="documente" placement={placement} />;

  return (
    <form className={styles.form} onSubmit={submit} onFocus={() => void session()} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>Nume și prenume</label>
          <input {...field("name")} autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
          {error("name")}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-phone`}>Telefon</label>
          <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          {error("phone")}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>E-mail <span className={styles.optional}>(dacă nu lăsați telefon)</span></label>
          <input {...field("email")} type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
          {error("email")}
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <label htmlFor={`${id}-message`}>Mesaj <span className={styles.optional}>(opțional)</span></label>
          <textarea {...field("message")} rows={3} value={values.message} onChange={(e) => set("message", e.target.value)} placeholder="Ce conțin documentele și pentru ce firmă sunt." />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-files`}>Documente <span className={styles.optional}>(PDF, JPG, PNG sau HEIC, cel mult {MAX_FILES} fișiere, 10 MB fiecare)</span></label>
        <input
          ref={input}
          id={`${id}-files`}
          type="file"
          name="files"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className={styles.fileInput}
          aria-invalid={errors.files ? true : undefined}
          onChange={(e) => addFiles(e.target.files)}
        />
        {files.length > 0 && (
          <ul className={styles.files}>
            {files.map((f) => (
              <li key={`${f.name}-${f.size}`}>
                <FileCheck aria-hidden />
                <span>{f.name}</span>
                <small>{formatSize(f.size)}</small>
                <button type="button" onClick={() => setFiles(files.filter((x) => x !== f))} aria-label={`Scoate ${f.name}`}>
                  <X aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        {error("files")}
      </div>

      <div className={styles.trap} aria-hidden>
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.consent}>
        <label>
          <input {...field("consent")} type="checkbox" checked={values.consent} onChange={(e) => set("consent", e.target.checked)} />
          <span>
            Sunt de acord ca Daiamar să primească și să păstreze aceste documente, care pot conține date personale și financiare, ca să îmi răspundă la
            solicitare. Detalii în <Link href="/confidentialitate/">politica de confidențialitate</Link>.
          </span>
        </label>
        {error("consent")}
      </div>

      {status === "failed" && <FormFailure message={failure} placement={placement} />}

      <button type="submit" className={styles.submit} disabled={status === "sending"}>
        {status === "sending" ? "Se încarcă..." : "Trimite documentele"}
      </button>
    </form>
  );
}
