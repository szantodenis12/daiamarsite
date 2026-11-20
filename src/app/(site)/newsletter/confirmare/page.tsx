import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleX, MailCheck } from "lucide-react";
import { db } from "@/lib/db";
import { NEWSLETTER_NAME } from "@/lib/newsletter";
import { pageMeta } from "@/lib/seo";
import { confirmAction } from "../actions";
import styles from "../newsletter.module.css";

export const metadata: Metadata = pageMeta({ title: "Confirmare abonare", description: `Confirmarea abonării la ${NEWSLETTER_NAME}, newsletterul Daiamar.`, path: "/newsletter/confirmare/", noindex: true });
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ t?: string }> };

export default async function ConfirmPage({ searchParams }: Props) {
  const { t } = await searchParams;
  const subscriber = t ? await db().subscriberByToken(t) : null;

  return (
    <section className={`wrap ${styles.page}`}>
      <div className={styles.card}>
        {subscriber?.status === "confirmed" ? (
          <>
            <CircleCheck aria-hidden className={styles.icon} />
            <h1>Adresa a fost confirmată</h1>
            <p className={styles.text}>
              Veți primi „{NEWSLETTER_NAME}” la {subscriber.email}. Fiecare e-mail are un link de dezabonare, iar linkul de mai jos funcționează oricând.
            </p>
            <Link href={`/newsletter/dezabonare/?t=${subscriber.token}`}>Dezabonare</Link>
          </>
        ) : subscriber ? (
          <>
            <MailCheck aria-hidden className={styles.icon} />
            <h1>Confirmați abonarea</h1>
            <p className={styles.text}>Apăsați butonul ca să primiți „{NEWSLETTER_NAME}” la {subscriber.email}.</p>
            <form action={confirmAction}>
              <input type="hidden" name="t" value={subscriber.token} />
              <button type="submit" className={styles.action}>Confirm abonarea</button>
            </form>
          </>
        ) : (
          <>
            <CircleX aria-hidden className={styles.icon} />
            <h1>Linkul nu mai este valabil</h1>
            <p className={styles.text}>Linkul de confirmare a fost folosit cu alt token sau adresa a fost ștearsă. Vă puteți abona din nou de pe pagina Resurse.</p>
            <Link href="/resurse/">
              Resurse <ArrowRight aria-hidden />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
