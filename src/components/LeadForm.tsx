"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readTouches } from "@/lib/attribution";
import { rememberConversion, useFormSession } from "@/lib/form-client";
import { validateLead } from "@/lib/lead";
import { services } from "@/lib/site";
import { FormFailure, FormSuccess } from "./FormStatus";
import styles from "./LeadForm.module.css";

export type LeadFormProps = {
  /** where the form sits, stored with the lead: "home-hero", "contact", "serviciu", "landing-firme-noi" ... */
  placement: string;
  /** preselected service slug from lib/site.ts */
  service?: string;
  title?: string;
  compact?: boolean;
  /** "callback" = name + phone only ("Vă sunăm noi"); the lead is tagged "Sună înapoi" in admin */
  variant?: "full" | "callback";
  /** "tu" on the informal landings (ONRC flyer); the default matches the service pages */
  register?: "tu" | "dumneavoastră";
};

type Values = { name: string; company: string; phone: string; email: string; service: string; message: string; consent: boolean };
type Errors = Partial<Record<keyof Values, string>>;

export default function LeadForm({ placement, service = "", title, compact = false, variant = "full", register = "dumneavoastră" }: LeadFormProps) {
  const id = useId();
  const router = useRouter();
  const session = useFormSession();
  const callback = variant === "callback";
  const kind = callback ? "apel" : "cerere";
  const [values, setValues] = useState<Values>({ name: "", company: "", phone: "", email: "", service, message: "", consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "failed" | "done">("idle");
  const [failure, setFailure] = useState("");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors = validateLead(values, kind);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      // After React has rendered the error, so the field is announced with its message.
      requestAnimationFrame(() => document.getElementById(`${id}-${firstInvalid}`)?.focus());
      return;
    }

    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const { token } = await session();
      const response = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          service: values.service || null,
          kind,
          placement,
          page: location.pathname,
          website: form.get("website"),
          formToken: token,
          ...readTouches(),
        }),
      });
      const result: { error?: string; errors?: Errors; inline?: boolean } = await response.json().catch(() => ({ error: "Cererea nu a putut fi trimisă." }));
      if (!response.ok) {
        setErrors(result.errors ?? {});
        setFailure(result.error ?? "Cererea nu a putut fi trimisă.");
        setStatus("failed");
        return;
      }
      if (result.inline) {
        setStatus("done");
        return;
      }
      // The thank-you page fires the conversion event once, for this submission only.
      rememberConversion(kind);
      router.push(`/multumim/?tip=${kind}&f=${encodeURIComponent(placement)}`);
    } catch {
      setFailure("Cererea nu a putut fi trimisă. Verificați conexiunea și încercați din nou.");
      setStatus("failed");
    }
  }

  const field = (key: keyof Values) => ({
    id: `${id}-${key}`,
    name: key,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
  });

  const error = (key: keyof Values) =>
    errors[key] && (
      <span id={`${id}-${key}-error`} className={styles.error}>
        {errors[key]}
      </span>
    );

  if (status === "done") return <FormSuccess kind={kind} placement={placement} />;

  const consentText = callback
    ? "Sunt de acord ca Daiamar să mă sune la acest număr. Detalii în"
    : "Sunt de acord ca Daiamar să folosească aceste date ca să mă contacteze. Detalii în";

  return (
    <form className={`${styles.form} ${compact || callback ? styles.compact : ""}`} onSubmit={submit} onFocus={() => void session()} noValidate>
      {title && <p className={styles.title}>{title}</p>}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>Nume și prenume</label>
          <input {...field("name")} autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
          {error("name")}
        </div>

        {!compact && !callback && (
          <div className={styles.field}>
            <label htmlFor={`${id}-company`}>Firma <span className={styles.optional}>(opțional)</span></label>
            <input {...field("company")} autoComplete="organization" value={values.company} onChange={(e) => set("company", e.target.value)} />
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor={`${id}-phone`}>Telefon</label>
          <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          {error("phone")}
        </div>

        {!callback && (
          <>
            <div className={styles.field}>
              <label htmlFor={`${id}-email`}>E-mail <span className={styles.optional}>{register === "tu" ? "(dacă nu lași telefon)" : "(dacă nu lăsați telefon)"}</span></label>
              <input {...field("email")} type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
              {error("email")}
            </div>

            <div className={`${styles.field} ${compact ? "" : styles.wide}`}>
              <label htmlFor={`${id}-service`}>{register === "tu" ? "Serviciul care te interesează" : "Serviciul care vă interesează"}</label>
              <select {...field("service")} value={values.service} onChange={(e) => set("service", e.target.value)}>
                <option value="">Nu știu încă</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {!compact && !callback && (
          <div className={`${styles.field} ${styles.wide}`}>
            <label htmlFor={`${id}-message`}>Mesaj <span className={styles.optional}>(opțional)</span></label>
            <textarea {...field("message")} rows={4} value={values.message} onChange={(e) => set("message", e.target.value)} />
          </div>
        )}
      </div>

      <div className={styles.trap} aria-hidden>
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.consent}>
        <label>
          <input {...field("consent")} type="checkbox" checked={values.consent} onChange={(e) => set("consent", e.target.checked)} />
          <span>
            {consentText} <Link href="/confidentialitate/">politica de confidențialitate</Link>.
          </span>
        </label>
        {error("consent")}
      </div>

      {status === "failed" && <FormFailure message={failure} placement={placement} />}

      <button type="submit" className={styles.submit} disabled={status === "sending"}>
        {status === "sending" ? "Se trimite..." : callback ? "Vă sunăm noi" : "Trimite cererea"}
      </button>
    </form>
  );
}
