import type { Metadata } from "next";
import Image from "next/image";
import { pageMeta } from "@/lib/seo";
import PageHead from "@/components/ui/PageHead";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/ui/Reveal";
import JsonLd from "@/components/ui/JsonLd";
import LanguageFlags, { type Lang } from "@/components/ui/LanguageFlags";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import styles from "./echipa.module.css";

const title = "Echipa Daiamar, contabilitate Oradea";
const description =
  "Echipa Daiamar din Oradea: experți contabili, economiști și resurse umane. Lucrăm în română, engleză, italiană, franceză, germană și spaniolă.";

export const metadata: Metadata = pageMeta({ title, description, path: "/echipa/" });

// Names, roles and languages as sent by Monica Pop, 11.11.2026; RO + EN for everyone per Roland 12.11. Portraits: office shoot 11.11.2026, background swapped to warm grey studio backdrop with Higgsfield (nano_banana_pro), raw gens in _ref/foto-echipa-higgsfield/.
const team: { name: string; role: string; langs: Lang[]; photo: string }[] = [
  { name: "Monica Diana Pop", role: "Expert contabil senior, consultant fiscal", langs: ["ro", "it"], photo: "monica-diana-pop" },
  { name: "Daiana Maria Pop", role: "Expert contabil junior, auditor junior", langs: ["ro", "en", "fr", "de"], photo: "daiana-maria-pop" },
  { name: "Bianca Petrița", role: "Economist, analist financiar", langs: ["ro"], photo: "bianca-petrita" },
  { name: "Marius Pop", role: "Economist senior", langs: ["ro", "en"], photo: "marius-pop" },
  { name: "Andreea Buciu", role: "Economist", langs: ["ro", "es"], photo: "andreea-buciu" },
  { name: "Romeo Petre", role: "Resurse umane", langs: ["ro", "en", "hu"], photo: "romeo-petre" },
  { name: "Dominika Szanto", role: "Resurse umane", langs: ["ro", "en", "hu"], photo: "dominika-szanto" },
];

export default function EchipaPage() {
  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/echipa/", title, description, "AboutPage"),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Echipa", path: "/echipa/" },
          ]),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Echipa" }]}
        title="Echipa Daiamar"
        intro={
          <>
            <p>
              Echipa Daiamar lucrează din biroul din Oradea, pentru firme din Oradea, din Bihor și din toată țara.
            </p>
          </>
        }
      />

      <section className="wrap">
        <ul className={styles.grid}>
          {team.map((p, i) => (
            <Reveal as="li" key={p.photo} delay={i * 60} className={styles.card}>
              <figure className={styles.photo}>
                <Image src={`/img/echipa/${p.photo}-foto.jpg`} alt={`${p.name}, ${p.role.toLowerCase()} la Daiamar`} fill sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 300px" />
              </figure>
              <div className={styles.body}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.role}>{p.role}</span>
                <div className={styles.bio}>
                  <LanguageFlags langs={p.langs} />
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaBand placement="echipa" />
    </>
  );
}
