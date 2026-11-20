import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, Paperclip, Phone } from "lucide-react";
import { company } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { newsletterThanks, THANKS, type ThanksKind } from "@/lib/thanks";
import ThanksTracker from "@/components/ThanksTracker";
import TrackedLink from "@/components/TrackedLink";
import styles from "./multumim.module.css";

export const metadata: Metadata = pageMeta({
  title: "Mulțumim",
  description: "Am primit mesajul dumneavoastră. Pagina de confirmare a formularelor de pe daiamar.ro.",
  path: "/multumim/",
  noindex: true,
});

const isKind = (value: string | undefined): value is ThanksKind => Boolean(value && value in THANKS);

type Props = { searchParams: Promise<{ tip?: string; f?: string; email?: string }> };

export default async function ThanksPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind: ThanksKind = isKind(params.tip) ? params.tip : "cerere";
  const content = THANKS[kind];

  return (
    <section className={`wrap ${styles.page}`}>
      <ThanksTracker kind={kind} placement={params.f} />
      <div className={styles.card}>
        <CircleCheck aria-hidden className={styles.icon} />
        <h1>{content.title}</h1>
        <p className={styles.text}>{kind === "newsletter" ? newsletterThanks(Boolean(params.email)) : content.text}</p>

        {kind !== "newsletter" && (
          <div className={styles.phones}>
            <span>Dacă este urgent, sunați direct:</span>
            {company.phones.map((p) => (
              <TrackedLink key={p.href} kind="phone" href={p.href} placement="multumim" className="num">
                <Phone aria-hidden /> {p.label}
              </TrackedLink>
            ))}
          </div>
        )}

        <div className={styles.links}>
          {(kind === "cerere" || kind === "apel") && (
            <Link href="/trimite-documente/">
              <Paperclip aria-hidden /> Aveți documente de trimis? Le puteți încărca aici
            </Link>
          )}
          <Link href="/servicii/">
            <ArrowRight aria-hidden /> Serviciile Daiamar
          </Link>
          <Link href="/resurse/">
            <ArrowRight aria-hidden /> Ghiduri pentru antreprenori
          </Link>
        </div>
      </div>
    </section>
  );
}
