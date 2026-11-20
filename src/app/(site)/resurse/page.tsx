import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { noOrphan } from "@/lib/text";
import PageHead from "@/components/ui/PageHead";
import CtaBand from "@/components/ui/CtaBand";
import NewsletterForm from "@/components/NewsletterForm";
import JsonLd from "@/components/ui/JsonLd";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { articles, formatDate } from "./articles";
import styles from "./resurse.module.css";

const title = "Ghiduri fiscale și contabile pentru firme";
const description =
  "Ghiduri practice pentru antreprenori, scrise de Daiamar: obligațiile unei firme noi, cum decurge un control ANAF, ce verificați când schimbați contabilul.";

export const metadata: Metadata = pageMeta({ title, description, path: "/resurse/" });


export default function ResursePage() {
  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/resurse/", title, description, "CollectionPage"),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Resurse", path: "/resurse/" },
          ]),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Resurse" }]}
        title="Ghiduri practice pentru antreprenori"
        intro={
          <p>
            Ghiduri publicate de Daiamar, Oradea, pentru administratori de firme și PFA-uri: ce obligații are firma în primul an, cum
            decurge un control ANAF, ce verificați când schimbați contabilul. Informațiile sunt generale, cu trimitere la lege, și se
            verifică pentru situația fiecărei firme.
          </p>
        }
      />
      <section className="wrap">
        <ul className={styles.list}>
          {articles.map((a, i) => {
            const cover = a.cover;
            return (
              <Reveal as="li" key={a.slug} delay={i * 80}>
                <Link href={`/resurse/${a.slug}/`} className={styles.card}>
                  <span className={styles.cover}>
                    <Image src={cover.src} alt={cover.alt} fill sizes="(max-width: 900px) 100vw, 400px" />
                  </span>
                  <span className={styles.cardBody}>
                    <span className={styles.meta}>
                      <span className="num">{formatDate(a.published)}</span>
                    </span>
                    <h2>{a.title}</h2>
                    <p>{a.description}</p>
                    <span className={styles.more}>Citiți articolul <ArrowRight aria-hidden className={styles.moreChip} /></span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>
      <section className={`wrap ${styles.newsletter}`} id="noutati">
        <Reveal className={styles.newsletterBox}>
          <div>
            <TextReveal>{noOrphan("Modificările fiscale care contează, pe e-mail")}</TextReveal>
            <p>
              Când se schimbă un termen, o cotă sau o declarație, scriem pe scurt ce înseamnă pentru firma dumneavoastră. Primiți un e-mail de
              confirmare înainte de orice altceva și vă puteți dezabona oricând.
            </p>
          </div>
          <NewsletterForm placement="resurse" />
        </Reveal>
      </section>
      <CtaBand placement="resurse" title="Aveți o situație concretă?" text="Un ghid nu înlocuiește o discuție despre firma dumneavoastră." />
    </>
  );
}
