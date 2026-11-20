"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readTouches } from "@/lib/attribution";
import { rememberConversion, useFormSession } from "@/lib/form-client";
import { isEmail } from "@/lib/lead";
import { FormFailure, FormSuccess } from "./FormStatus";
import styles from "./NewsletterForm.module.css";

type Props = { placement: string; compact?: boolean };
type Errors = { email?: string; consent?: string };

export default function NewsletterForm({ placement, compact }: Props) {
  const id = useId();
  const router = useRouter();
  const session = useFormSession();
  const [values, setValues] = useState({ email: "", name: "", company: "", consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "failed" | "done">("idle");
  const [failure, setFailure] = useState("");
  const [emailed, setEmailed] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors = {};
    if (!isEmail(values.email)) found.email = "Adresa de e-mail nu este validă.";
    if (!values.consent) found.consent = "Bifați acordul ca să vă putem trimite noutățile.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const { token } = await session();
      const response = await fetch("/api/newsletter/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, placement, page: location.pathname, website: form.get("website"), formToken: token, ...readTouches() }),
      });
      const result: { error?: string; errors?: Errors; emailed?: boolean; inline?: boolean } = await response.json().catch(() => ({ error: "Abonarea nu a reușit." }));
      if (!response.ok) {
        setErrors(result.errors ?? {});
        setFailure(result.error ?? "Abonarea nu a reușit.");
        setStatus("failed");
        return;
      }
      if (result.inline) {
        setEmailed(Boolean(result.emailed));
        setStatus("done");
        return;
      }
      rememberConversion("newsletter");
      router.push(`/multumim/?tip=newsletter${result.emailed ? "&email=1" : ""}`);
    } catch {
      setFailure("Abonarea nu a reușit. Verificați conexiunea și încercați din nou.");
      setStatus("failed");
    }
  }

  if (status === "done") return <FormSuccess kind="newsletter" placement={placement} emailed={emailed} />;

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ""}`} onSubmit={submit} onFocus={() => void session()} noValidate>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>E-mail</label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
          {errors.email && <span id={`${id}-email-error`} className={styles.error}>{errors.email}</span>}
        </div>
        {!compact && (
          <>
            <div className={styles.field}>
              <label htmlFor={`${id}-name`}>Nume <span className={styles.optional}>(opțional)</span></label>
              <input id={`${id}-name`} autoComplete="name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${id}-company`}>Firma <span className={styles.optional}>(opțional)</span></label>
              <input id={`${id}-company`} autoComplete="organization" value={values.company} onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))} />
            </div>
          </>
        )}
        <button type="submit" className={styles.submit} disabled={status === "sending"}>
          {status === "sending" ? "Se trimite..." : "Mă abonez"}
        </button>
      </div>

      <div className={styles.trap} aria-hidden>
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className={styles.consent}>
        <input type="checkbox" checked={values.consent} aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? `${id}-consent-error` : undefined} onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))} />
        <span>
          Vreau să primesc „Noutăți fiscale” de la Daiamar pe e-mail. Primesc un mesaj de confirmare și mă pot dezabona oricând, din orice e-mail.{" "}
          <Link href="/confidentialitate/">Politica de confidențialitate</Link>.
        </span>
      </label>
      {errors.consent && <span id={`${id}-consent-error`} className={styles.error}>{errors.consent}</span>}
      {status === "failed" && <FormFailure message={failure} placement={placement} />}
    </form>
  );
}
