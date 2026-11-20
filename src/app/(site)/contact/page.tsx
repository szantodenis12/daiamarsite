import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Paperclip, Phone } from "lucide-react";
import { company, whatsappHref } from "@/lib/site";
import { images } from "@/lib/images";
import { pageMeta } from "@/lib/seo";
import { noOrphan } from "@/lib/text";
import { baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import PageHead from "@/components/ui/PageHead";
import Faq, { faqSchema, type FaqItem } from "@/components/ui/Faq";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import JsonLd from "@/components/ui/JsonLd";
import Related from "@/components/ui/Related";
import LeadForm from "@/components/LeadForm";
import MapEmbed from "@/components/MapEmbed";
import TrackedLink from "@/components/TrackedLink";
import styles from "./contact.module.css";

const title = "Contact Daiamar, contabilitate Oradea";
const description = `Contactați Daiamar, contabilitate în Oradea: ${company.phones[0].label} sau ${company.phones[1].label}, ${company.email}, ${company.address}. Formular de solicitare pe pagină.`;

export const metadata: Metadata = pageMeta({ title, description, path: "/contact/" });

const faq: FaqItem[] = [
  {
    q: "Ce scriu în formular ca să primesc un răspuns util?",
    a: "Tipul firmei (SRL, PFA, întreprindere individuală), domeniul de activitate, dacă aveți angajați și de ce aveți nevoie: contabilitate, un control în curs, salarizare, consultanță. Documentele le trimiteți separat, prin pagina de trimitere a documentelor.",
  },
  {
    q: "Pot trimite o solicitare în engleză sau italiană?",
    a: `Da. Lucrăm în ${company.languages.join(", ")}.`,
  },
  {
    q: "Ce se întâmplă cu datele trimise prin formular?",
    a: "Le folosim doar ca să vă răspundem la solicitare.",
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={baseGraph(
          webPageSchema("/contact/", title, description, "ContactPage"),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Contact", path: "/contact/" },
          ]),
          faqSchema(faq, "/contact/"),
        )}
      />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Contact" }]}
        title="Contactați Daiamar"
        intro={
          <p>
            Biroul Daiamar este pe {company.street}, în Oradea, județul Bihor. Puteți suna sau trimite o solicitare
            prin formular, iar noi vă contactăm telefonic sau prin e-mail. Reprezentare controale ANAF, contabilitate,
            consultanță fiscală, resurse umane.
          </p>
        }
        image={images.birouLaptop}
      />

      <section className={`wrap ${styles.grid}`}>
        <Reveal className={styles.sheet}>
          <div className={styles.row}>
            <span className={styles.tile}><Phone aria-hidden /></span>
            <div>
              <span className={styles.label}>Telefon</span>
              <div className={styles.value}>
                {company.phones.map((p) => (
                  <TrackedLink key={p.href} kind="phone" href={p.href} placement="contact" className="num">{p.label}</TrackedLink>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.tile}><MessageCircle aria-hidden /></span>
            <div>
              <span className={styles.label}>WhatsApp</span>
              <div className={styles.value}>
                <TrackedLink kind="whatsapp" href={whatsappHref} placement="contact" className="num">{company.whatsapp.label}</TrackedLink>
                <span className={styles.small}>Scrieți-ne un mesaj, răspundem de pe același număr.</span>
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.tile}><Mail aria-hidden /></span>
            <div>
              <span className={styles.label}>E-mail</span>
              <div className={styles.value}>
                <TrackedLink kind="email" href={`mailto:${company.email}`} placement="contact">{company.email}</TrackedLink>
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.tile}><MapPin aria-hidden /></span>
            <div>
              <span className={styles.label}>Adresă</span>
              <div className={styles.value}>
                <TrackedLink kind="maps" href={company.mapsUrl} placement="contact">{company.address}</TrackedLink>
                <span className={styles.small}>Județul {company.region}</span>
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.tile}><Clock aria-hidden /></span>
            <div>
              <span className={styles.label}>Program</span>
              <div className={styles.value}>
                <span>{company.hours.label}</span>
              </div>
            </div>
          </div>
          <div className={styles.callback}>
            <h2>Preferați să vă sunăm noi?</h2>
            <p>Lăsați numele și numărul de telefon.</p>
            <LeadForm placement="contact-apel" variant="callback" />
          </div>
        </Reveal>

        <Reveal delay={100} as="section" className={styles.form}>
          <div className={styles.formCard} id="formular">
            <h2>Trimiteți o solicitare</h2>
            <p>Spuneți-ne pe scurt de ce aveți nevoie. Vă contactăm telefonic sau prin e-mail.</p>
            <LeadForm placement="contact" />
          </div>
          <Link href="/trimite-documente/" className={styles.docsLink}>
            <span className={styles.tile}><Paperclip aria-hidden /></span>
            <span>
              <strong>Aveți documente de trimis?</strong>
              <small>Pagina de trimitere a documentelor: PDF, JPG, PNG sau HEIC, până la 5 fișiere.</small>
            </span>
            <ArrowRight aria-hidden className={styles.docsChip} />
          </Link>
        </Reveal>
      </section>

      <section className={`wrap ${styles.mapSection}`}>
        <Reveal>
          <MapEmbed placement="contact" />
        </Reveal>
      </section>

      <section className={`wrap ${styles.section}`}>
        <div className={styles.cols}>
          <TextReveal>{noOrphan("Înainte să ne scrieți")}</TextReveal>
          <Reveal delay={100}>
            <Faq items={faq} />
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`}>
        <Related
          links={[
            { href: "/servicii/reprezentare-controale-anaf/", label: "Reprezentare la controale ANAF și ITM" },
            { href: "/servicii/contabilitate/", label: "Contabilitate pentru firme și PFA" },
            { href: "/servicii/consultanta-fiscala/", label: "Consultanță fiscală" },
            { href: "/clienti-din-toata-tara/", label: "Clienți din toată țara" },
          ]}
        />
      </section>
    </>
  );
}
