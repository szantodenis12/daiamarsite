"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const langs = [
  { href: "/", code: "ro", label: "RO", name: "Română" },
  { href: "/en/", code: "en", label: "EN", name: "English" },
  { href: "/it/", code: "it", label: "IT", name: "Italiano" },
];

export default function LangSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const current = pathname.startsWith("/en/") ? "en" : pathname.startsWith("/it/") ? "it" : "ro";
  return (
    <nav aria-label="Limbă" className={`${styles.lang} ${className}`}>
      {langs.map((l) => (
        <Link key={l.code} href={l.href} hrefLang={l.code} lang={l.code} title={l.name} aria-current={l.code === current ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
