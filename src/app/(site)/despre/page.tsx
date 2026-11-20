import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Check } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { images } from "@/lib/images";
import { noOrphan } from "@/lib/text";
import PageHead from "@/components/ui/PageHead";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/ui/Reveal";
import ParallaxImage from "@/components/motion/ParallaxImage";
import TextReveal from "@/components/motion/TextReveal";
import JsonLd from "@/components/ui/JsonLd";
import Related from "@/components/ui/Related";
import Button from "@/components/ui/Button";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import styles from "./despre.module.css";

const title = "Despre Daiamar: firmă contabilitate Oradea, CECCAR";
const description =
  "Daiamar, societate de contabilitate din Oradea, membră CECCAR. Peste 20 de ani de experiență în cadrul ANAF, divizia control fiscal. Română, engleză, italiană.";

export const metadata: Metadata = pageMeta({ title, description, path: "/despre/" });

// Live site text, with diacritics. A1 and work permits stay at the end of the list.
const offer = [
  "Înființări societăți",
  "Servicii contabilitate & consultanță fiscală",
  "Audit intern și audit extern",
  "Servicii resurse umane",
  "Rambursări TVA din țări membre UE",
  "Întocmire documentație pentru fonduri europene",
  "Servicii juridice (comerciale, civile, penale)",
  "Lichidări societăți comerciale",
  "Obținere formulare A1",
  "Permise de muncă pentru cetățeni non-UE",
];


export default function DesprePage() {
  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/despre/", title, description, "AboutPage"),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Despre", path: "/despre/" },
          ]),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Despre" }]}
        title="Despre Daiamar"
        intro={
          <p>
            Daiamar este o societate de contabilitate din Oradea, membră CECCAR, cu experiență în cadrul ANAF, divizia control fiscal. Lucrăm cu
            firme din Oradea, din Bihor și din toată țara.
          </p>
        }
        image={images.intalnire}
      />

      <section className={`wrap ${styles.section}`}>
        <div className={styles.cols}>
          <TextReveal>{noOrphan("Cu ce se ocupă Daiamar?")}</TextReveal>
          <Reveal delay={100} className={styles.text}>
            <p>
              Clienții noștri sunt societăți comerciale, PFA-uri și întreprinderi individuale, din Oradea și din toată țara.
            </p>
            <ul className={styles.offer}>
              {offer.map((item) => (
                <li key={item}>
                  <Check aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div>
              <Button href="/servicii/" variant="light">Toate serviciile</Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`}>
        <div className={styles.split}>
          <Reveal variant="image" className={styles.photo}>
            <ParallaxImage speed={0.1} className={styles.pxFill}>
              <Image src={images.birouColegi.src} alt={images.birouColegi.alt} fill sizes="(max-width: 900px) 100vw, 560px" />
            </ParallaxImage>
          </Reveal>
          <Reveal delay={100} className={styles.text}>
            <TextReveal>{noOrphan("De unde vine experiența la controalele ANAF?")}</TextReveal>
            <p className={styles.lead}>Monica Diana Pop, expert contabil și consultant fiscal, a lucrat peste 20 de ani în cadrul ANAF, în divizia control fiscal.</p>
            <p>
              Daiamar oferă servicii de reprezentare în timpul controalelor ANAF: inspecții generale și parțiale, controale ITM,
              întocmire contestații, acțiuni în instanță.
            </p>
            <div>
              <Button href="/servicii/reprezentare-controale-anaf/">Reprezentare la controale ANAF</Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`}>
        <Reveal className={styles.values}>
          <TextReveal>{noOrphan("Ce principii urmează echipa?")}</TextReveal>
          <p className={styles.quote}>
            Respect și loialitate față de clienți, calitate și performanță, perfecționare continuă a membrilor Daiamar.
          </p>
          <div className={styles.valuesText}>
            <p>
              Experții Daiamar urmăresc permanent modificările legislative, contabile și fiscale, așa că răspunsul pe care îl primiți leagă
                contabilitatea, fiscalitatea și partea economică a firmei.
            </p>
          </div>
        </Reveal>
      </section>

      <section className={`wrap ${styles.section}`}>
        <div className={styles.cols}>
          <TextReveal>{noOrphan("Ce înseamnă că Daiamar este membră CECCAR?")}</TextReveal>
          <Reveal delay={100} className={styles.card}>
            <span className={styles.tile}><BadgeCheck aria-hidden /></span>
            {/* TODO: de confirmat sursa topului cu clientul */}
            <p className={styles.lead}>
              Daiamar este o societate membră CECCAR și a intrat doi ani la rând în topul celor mai bune firme de
              contabilitate din România.
            </p>
          </Reveal>
        </div>
      </section>


      <section className={`wrap ${styles.section}`}>
        <Related
          title="Pagini legate"
          links={[
            { href: "/servicii/reprezentare-controale-anaf/", label: "Reprezentare la controale ANAF și ITM" },
            { href: "/servicii/contabilitate/", label: "Contabilitate pentru firme și PFA" },
            { href: "/clienti-din-toata-tara/", label: "Clienți din toată țara" },
            { href: "/echipa/", label: "Echipa Daiamar" },
          ]}
        />
      </section>

      <CtaBand placement="despre" />
    </>
  );
}
