import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleX, MailX } from "lucide-react";
import { db } from "@/lib/db";
import { NEWSLETTER_NAME } from "@/lib/newsletter";
import { pageMeta } from "@/lib/seo";
import { unsubscribeAction } from "../actions";
import styles from "../newsletter.module.css";

export const metadata: Metadata = pageMeta({ title: "Dezabonare", description: `Dezabonarea de la ${NEWSLETTER_NAME}, newsletterul Daiamar.`, path: "/newsletter/dezabonare/", noindex: true });
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ t?: string }> };

export default async function UnsubscribePage({ searchParams }: Props) {
  const { t } = await searchParams;
  const subscriber = t ? await db().subscriberByToken(t) : null;

  return (
    <section className={`wrap ${styles.page}`}>
      <div className={styles.card}>
        {subscriber?.status === "unsubscribed" ? (
          <>
            <CircleCheck aria-hidden className={styles.icon} />
            <h1>V-ați dezabonat</h1>
            <p className={styles.text}>Nu mai trimitem „{NEWSLETTER_NAME}” la {subscriber.email}. Dacă vă răzgândiți, vă puteți abona din nou de pe pagina Resurse.</p>
          </>
        ) : subscriber ? (
          <>
            <MailX aria-hidden className={styles.icon} />
            <h1>Dezabonare</h1>
            <p className={styles.text}>Apăsați butonul și nu mai trimitem „{NEWSLETTER_NAME}” la {subscriber.email}.</p>
            <form action={unsubscribeAction}>
              <input type="hidden" name="t" value={subscriber.token} />
              <button type="submit" className={styles.action}>Mă dezabonez</button>
            </form>
          </>
        ) : (
          <>
            <CircleX aria-hidden className={styles.icon} />
            <h1>Linkul nu mai este valabil</h1>
            <p className={styles.text}>Adresa a fost deja ștearsă sau linkul este incomplet. Scrieți-ne la contact@daiamar.ro și o ștergem manual.</p>
          </>
        )}
        <Link href="/resurse/">
          Resurse <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
