"use client";

import { useEffect, useRef } from "react";
import { CircleCheck, Phone } from "lucide-react";
import { company } from "@/lib/site";
import { newsletterThanks, THANKS, type ThanksKind } from "@/lib/thanks";
import TrackedLink from "@/components/TrackedLink";
import styles from "./FormStatus.module.css";

function Phones({ placement, label }: { placement: string; label: string }) {
  return (
    <span className={styles.phones}>
      {label}
      {company.phones.map((p) => (
        <TrackedLink key={p.href} kind="phone" href={p.href} placement={placement}>
          <Phone aria-hidden /> {p.label}
        </TrackedLink>
      ))}
    </span>
  );
}

/** Shown in place of the form when the submission is not sent on to /multumim/ (no conversion is counted for it). */
export function FormSuccess({ kind, placement, emailed = false }: { kind: ThanksKind; placement: string; emailed?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => box.current?.focus(), []);
  const content = THANKS[kind];
  return (
    <div ref={box} tabIndex={-1} role="status" className={styles.success}>
      <CircleCheck aria-hidden />
      <h3>{content.title}</h3>
      <p>{kind === "newsletter" ? newsletterThanks(emailed) : content.text}</p>
      {kind !== "newsletter" && <Phones placement={placement} label="Dacă este urgent, sunați direct:" />}
    </div>
  );
}

/** Every error keeps the phone numbers in view, so a visitor whose message did not go through can still reach Daiamar. */
export function FormFailure({ message, placement }: { message: string; placement: string }) {
  return (
    <div className={styles.failure} role="alert" data-form-failure>
      <p>{message}</p>
      <Phones placement={placement} label="Ne puteți suna:" />
    </div>
  );
}
