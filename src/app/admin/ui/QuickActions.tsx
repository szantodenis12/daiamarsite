"use client";

import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { normalizePhone, whatsappNumber } from "@/lib/crm";
import { company } from "@/lib/site";
import styles from "./quick.module.css";

type Props = { leadId: number; phone: string | null; email: string | null; service?: string | null; compact?: boolean };

function telHref(phone: string) {
  const local = normalizePhone(phone) ?? phone.replace(/\D/g, "");
  return local.startsWith("0") && local.length === 10 ? `tel:+40${local.slice(1)}` : `tel:${local}`;
}

const WHATSAPP_TEXT = "Bună ziua, vă scriu de la Daiamar în legătură cu cererea dumneavoastră. Când putem vorbi la telefon?";

function mailHref(email: string, service?: string | null) {
  const subject = "Cererea dumneavoastră către Daiamar";
  const body = [
    "Bună ziua,",
    "",
    `Vă scriu în legătură cu cererea trimisă către Daiamar${service ? ` (${service})` : ""}. Când vă pot suna pentru câteva minute?`,
    "",
    "Cu stimă,",
    "Daiamar",
    company.phones[0].label,
  ].join("\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Contact links that also write the attempt to the lead's timeline. */
export function QuickActions({ leadId, phone, email, service, compact }: Props) {
  const router = useRouter();
  const log = (type: "apel" | "whatsapp" | "email") => {
    void fetch(`/api/admin/leads/${leadId}/activity/`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
      .then(() => router.refresh())
      .catch(() => undefined);
  };
  const wa = phone ? whatsappNumber(phone) : null;

  return (
    <div className={styles.quick} data-compact={compact || undefined}>
      {phone && (
        <a href={telHref(phone)} onClick={() => log("apel")} className={styles.action}>
          <Phone aria-hidden size={16} /> <span>Sună</span>
        </a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}?text=${encodeURIComponent(WHATSAPP_TEXT)}`} target="_blank" rel="noreferrer" onClick={() => log("whatsapp")} className={styles.action}>
          <MessageCircle aria-hidden size={16} /> <span>WhatsApp</span>
        </a>
      )}
      {email && (
        <a href={mailHref(email, service)} onClick={() => log("email")} className={styles.action}>
          <Mail aria-hidden size={16} /> <span>Email</span>
        </a>
      )}
    </div>
  );
}
