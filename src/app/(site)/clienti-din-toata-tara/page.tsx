import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Laptop, MessageSquare } from "lucide-react";
import { company, services } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { noOrphan } from "@/lib/text";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import PageHead from "@/components/ui/PageHead";
import Faq, { faqSchema, type FaqItem } from "@/components/ui/Faq";
import CtaBand from "@/components/ui/CtaBand";
import JsonLd from "@/components/ui/JsonLd";
import Related from "@/components/ui/Related";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import TrackedLink from "@/components/TrackedLink";
import styles from "./zone.module.css";

const path = "/clienti-din-toata-tara/";
const title = "Clienți din toată țara, birou în Oradea";
const description =
  "Daiamar lucrează cu firme din toată România, din biroul din Oradea: documente trimise electronic, declarații depuse online, control ANAF în orice județ.";

export const metadata: Metadata = pageMeta({ title, description, path });

// Services asked for from other counties, in the order they are shown. A1 and work permits stay last (client rule).
const nationalSlugs = ["reprezentare-controale-anaf", "audit-intern-extern", "consultanta-fiscala", "firme-cu-probleme-financiare", "rambursari-tva-ue", "formulare-a1", "permise-de-munca"];

const faq: FaqItem[] = [
  {
    q: "Lucrați cu firme din afara județului Bihor?",
    a: "Da, cu firme din toată țara. Biroul este în Oradea, dar evidența, declarațiile și corespondența cu ANAF nu depind de județul în care este înregistrată firma.",
  },
  {
    q: "Trebuie să vin la birou ca să predau documentele?",
    a: "Nu. Documentele se trimit electronic, iar programele de contabilitate permit operare online. Firmele din Oradea și din localitățile apropiate le pot preda și la biroul de pe Str. Beiușului nr. 52.",
  },
  {
    q: "Declarațiile se depun la fel pentru o firmă din alt județ?",
    a: "Da. Declarațiile se depun electronic, prin Spațiul Privat Virtual, la organul fiscal de care aparține firma, oricare ar fi acesta.",
  },
];

export default function ClientiDinToataTaraPage() {
  const national = nationalSlugs.map((slug) => services.find((s) => s.slug === slug)).filter((s) => s !== undefined);

  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema(path, title, description),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Clienți din toată țara", path },
          ]),
          faqSchema(faq, path),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Clienți din toată țara" }]}
        title="Clienți din toată țara"
        intro={
          <p>
            Daiamar, societate de contabilitate membră CECCAR, are biroul pe {company.street}, Oradea, și lucrează cu firme din Oradea, din
            Bihor și din toată România. Documentele se transmit electronic, programele de contabilitate permit operare online, iar la sediul
            firmei venim atunci când se impune. Telefon: {company.phones[0].label}.
          </p>
        }
      />

      <section className={`wrap ${styles.section}`}>
        <Reveal className={styles.cols}>
          <div>
            <TextReveal>{noOrphan("Cum colaborăm cu o firmă din alt județ?")}</TextReveal>
          </div>
          <div className={styles.cards}>
            <div className={styles.card}>
              <span className={styles.tile}><Laptop aria-hidden /></span>
              <strong>Documentele, electronic</strong>
              <p>
                Facturile, extrasele de cont și pontajul se trimit pe e-mail, pe WhatsApp sau prin{" "}
                <Link href="/trimite-documente/">formularul de documente</Link>. Declarațiile se depun prin Spațiul Privat Virtual.
              </p>
            </div>
            <div className={styles.card}>
              <span className={styles.tile}><MessageSquare aria-hidden /></span>
              <strong>Comunicarea</strong>
              <p>
                Telefon, e-mail sau WhatsApp, cu persoana care lucrează pe dosarul firmei. Situațiile pentru conducere ajung lunar sau
                trimestrial, în formatul și limba stabilite de dumneavoastră.
              </p>
            </div>
            <div className={styles.card}>
              <span className={styles.tile}><Building2 aria-hidden /></span>
              <strong>La sediul firmei, când se impune</strong>
              <p>La preluarea evidenței, la inventar sau la pregătirea unui control. Deplasarea se stabilește de la caz la caz, înainte.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className={`wrap ${styles.section}`}>
        <Reveal className={styles.cols}>
          <div>
            <TextReveal>{noOrphan("Pentru ce ne caută firmele din alte județe?")}</TextReveal>
            <p className={styles.muted}>
              Controlul fiscal, auditul și consultanța nu țin de locul în care este biroul. Contabilitatea lunară și salarizarea se fac la
              fel, cu documentele transmise electronic.
            </p>
          </div>
          <div className={styles.services}>
            {national.map((s) => (
              <Link key={s.slug} href={`/servicii/${s.slug}/`} className={styles.serviceLink}>
                <strong>{s.title}</strong>
                <ArrowRight aria-hidden className={styles.serviceChip} />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className={`wrap ${styles.section}`}>
        <Reveal className={styles.cols}>
          <div>
            <TextReveal>{noOrphan("Biroul din Oradea")}</TextReveal>
          </div>
          <div className={styles.text}>
            <p>
              {company.address}, județul {company.region}.{" "}
              <TrackedLink kind="maps" href={company.mapsUrl} placement="toata-tara">
                Harta și indicațiile de drum
              </TrackedLink>
              . Firmele din Oradea și din zona metropolitană (Sânmartin, Băile Felix, Nojorid, Biharia, Borș) pot preda documentele și la
              birou. Pentru Salonta, Marghita, Beiuș, Aleșd și restul județului lucrăm la fel ca pentru orice alt județ: electronic, cu
              deplasare la sediu atunci când se impune.
            </p>
            <p className={styles.muted}>
              Pentru întrebări despre o firmă din altă localitate, sunați la{" "}
              <TrackedLink kind="phone" href={company.phones[0].href} placement="toata-tara" className="num">
                {company.phones[0].label}
              </TrackedLink>
              .
            </p>
          </div>
        </Reveal>
      </section>

      <section className={`wrap ${styles.section}`}>
        <Reveal className={styles.cols}>
          <div>
            <TextReveal>{noOrphan("Întrebări despre lucrul la distanță")}</TextReveal>
          </div>
          <Faq items={faq} />
        </Reveal>
      </section>

      <section className={`wrap ${styles.section}`}>
        <Related
          title="Pagini legate"
          links={[
            { href: "/servicii/", label: "Toate serviciile" },
            { href: "/despre/", label: "Despre Daiamar" },
            { href: "/contact/", label: "Contact și hartă" },
          ]}
        />
      </section>

      <CtaBand placement="toata-tara" text="Pentru firme din Oradea, din Bihor și din orice județ al țării." />
    </>
  );
}
