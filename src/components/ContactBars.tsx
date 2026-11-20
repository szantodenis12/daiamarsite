import Link from "next/link";
import { MessageCircle, Phone, Send } from "lucide-react";
import { company, whatsappHref } from "@/lib/site";
import TrackedLink from "@/components/TrackedLink";
import styles from "./ContactBars.module.css";

/** Desktop and tablet: one WhatsApp button, bottom right. Hidden under 769px, where the call bar takes over. */
export function FloatingWhatsApp() {
  return (
    <TrackedLink kind="whatsapp" href={whatsappHref} placement="floating" className={styles.floating} aria-label={`WhatsApp ${company.whatsapp.label}`}>
      <MessageCircle aria-hidden />
      <span>WhatsApp</span>
    </TrackedLink>
  );
}

/** Phones only: Sună, WhatsApp, Cerere. The site wrapper reserves its height so the footer stays reachable. */
export function MobileBar() {
  return (
    <nav className={styles.bar} aria-label="Contact rapid">
      <TrackedLink kind="phone" href={company.phones[0].href} placement="bara-mobil" className={styles.barItem}>
        <Phone aria-hidden /> Sună acum
      </TrackedLink>
      <TrackedLink kind="whatsapp" href={whatsappHref} placement="bara-mobil" className={styles.barItem}>
        <MessageCircle aria-hidden /> WhatsApp
      </TrackedLink>
      <Link href="/contact/#formular" className={`${styles.barItem} ${styles.barPrimary}`}>
        <Send aria-hidden /> Cerere
      </Link>
    </nav>
  );
}
