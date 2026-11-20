import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./ui.module.css";

export type RelatedLink = { href: string; label: string };

type Props = { title?: string; links: RelatedLink[]; className?: string };

export default function Related({ title = "Servicii conexe", links, className = "" }: Props) {
  if (links.length === 0) return null;
  return (
    <nav className={`${styles.related} ${className}`} aria-label={title}>
      <h2>{title}</h2>
      {links.map((l) => (
        <Link key={l.href} href={l.href}>
          {l.label}
          <ArrowRight aria-hidden />
        </Link>
      ))}
    </nav>
  );
}
