import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_URL, services, type ServiceGroup } from "@/lib/site";
import { images } from "@/lib/images";
import { pageMeta } from "@/lib/seo";
import { noOrphan } from "@/lib/text";
import PageHead from "@/components/ui/PageHead";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import JsonLd from "@/components/ui/JsonLd";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { groups } from "./content";
import { icons } from "./visuals";
import styles from "./servicii.module.css";

const title = "Servicii contabilitate și fiscalitate Oradea";
const description =
  "Serviciile Daiamar în Oradea: reprezentare la controale ANAF și ITM, audit, contabilitate, salarizare, consultanță fiscală, înființări de firme, TVA din UE.";

export const metadata: Metadata = pageMeta({ title, description, path: "/servicii/" });

function Cards({ group }: { group: ServiceGroup }) {
  return (
    <div className={styles.cards}>
      {services.map((s, i) => {
        if (s.group !== group) return null;
        const Icon = icons[s.slug];
        return (
          <Reveal key={s.slug} delay={(i % 3) * 80}>
            <Link href={`/servicii/${s.slug}/`} className={styles.card}>
              <span className={styles.tile}>
                <Icon aria-hidden />
              </span>
              <h3>{s.title}</h3>
              <p>{s.short}</p>
              <span className={styles.cardMore}>
                Detalii <ArrowRight aria-hidden className={styles.cardChip} />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

function GroupHead({ group }: { group: ServiceGroup }) {
  const g = groups[group];
  return (
    <Reveal className={styles.groupHead}>
      <TextReveal>{noOrphan(g.title)}</TextReveal>
      <p>{g.text}</p>
    </Reveal>
  );
}

export default function ServiciiPage() {
  const list = {
    "@type": "ItemList",
    "@id": `${SITE_URL}/servicii/#lista`,
    itemListElement: services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: `${SITE_URL}/servicii/${s.slug}/` })),
  };

  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/servicii/", title, description, "CollectionPage"),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii/" },
          ]),
          list,
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Servicii" }]}
        title="Servicii de contabilitate și fiscalitate în Oradea"
        intro={
          <p>
            Daiamar, Oradea: contabilitate, salarizare, consultanță fiscală, reprezentare la controale ANAF și ITM, audit intern și extern,
            pentru firme din Oradea, din Bihor și din toată țara.
          </p>
        }
        image={images.documenteMasa}
      />

      <section className={`wrap ${styles.group}`}>
        <div className={styles.control}>
          <GroupHead group="control" />
          <Cards group="control" />
        </div>
      </section>

      <section className={`wrap ${styles.group}`}>
        <GroupHead group="baza" />
        <Cards group="baza" />
      </section>

      <section className={`wrap ${styles.group}`}>
        <GroupHead group="situatii" />
        <Cards group="situatii" />
      </section>

      <section className={`wrap ${styles.group}`}>
        <GroupHead group="specializate" />
        <ul className={styles.rows}>
          {services.map((s, i) => {
            if (s.group !== "specializate") return null;
            const Icon = icons[s.slug];
            return (
              <Reveal as="li" key={s.slug} delay={(i % 4) * 70}>
                <Link href={`/servicii/${s.slug}/`} className={styles.row}>
                  <span className={styles.tile}>
                    <Icon aria-hidden />
                  </span>
                  <span>
                    <strong>{s.title}</strong>
                    <span>{s.short}</span>
                  </span>
                  <ArrowRight aria-hidden className={styles.rowArrow} />
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <CtaBand placement="servicii-hub" text="Spuneți-ne de ce are nevoie firma dumneavoastră și vă răspundem cu pașii următori." />
    </>
  );
}
