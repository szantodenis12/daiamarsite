import { ArrowRight, Check, Mail, MapPin, Phone } from "lucide-react";
import { company } from "@/lib/site";
import { images } from "@/lib/images";
import { baseGraph, webPageSchema } from "@/lib/schema";
import PageHead from "@/components/ui/PageHead";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import TrackedLink from "@/components/TrackedLink";
import styles from "./language.module.css";

export type LanguageContent = {
  lang: "en" | "it";
  path: string;
  description: string;
  title: React.ReactNode;
  intro: React.ReactNode;
  servicesHeading: string;
  services: { title: string; text: string }[];
  otherKicker: string;
  other: string[];
  workHeading: string;
  values: string;
  approach: string;
  closing: string;
  contactHeading: string;
  contactText: string;
  requestLabel: string;
  labels: { email: string; address: string; languages: string };
  languages: string;
};

// Homepage for English and Italian visitors: the live EN/IT text, one page each.
export default function LanguagePage({ content: c }: { content: LanguageContent }) {
  return (
    <div lang={c.lang}>
      <JsonLd data={baseGraph(webPageSchema(c.path, typeof c.title === "string" ? c.title : "Daiamar", c.description, "WebPage", c.lang))} />
      <PageHead
        title={c.title}
        intro={<p>{c.intro}</p>}
        image={{ src: images.intalnire.src, alt: c.lang === "en" ? "The Daiamar team in the meeting room of the Oradea office" : "Il team Daiamar nella sala riunioni dell’ufficio di Oradea" }}
      />

      <section className={`wrap ${styles.section}`}>
        <div className={styles.cols}>
          <TextReveal>{c.servicesHeading}</TextReveal>
          <Reveal delay={100} className={styles.text}>
            <ul className={styles.services}>
              {c.services.map((s) => (
                <li key={s.title} className={styles.service}>
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </li>
              ))}
            </ul>
            <p className={styles.otherTitle}>{c.otherKicker}</p>
            <ul className={styles.other}>
              {c.other.map((o) => (
                <li key={o}>
                  <Check aria-hidden /> {o}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`}>
        <div className={styles.cols}>
          <TextReveal>{c.workHeading}</TextReveal>
          <Reveal delay={100} className={styles.text}>
            <p className={styles.quote}>{c.values}</p>
            <p>{c.approach}</p>
            <p>{c.closing}</p>
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`}>
        <div className={styles.contact}>
          <div>
            <TextReveal>{c.contactHeading}</TextReveal>
            <p>{c.contactText}</p>
            <div className={styles.actions}>
              {company.phones.map((p) => (
                <TrackedLink key={p.href} kind="phone" href={p.href} placement={c.lang} className={`${styles.phone} num`}>
                  <Phone aria-hidden /> {p.label}
                </TrackedLink>
              ))}
              <Button href="/contact/#formular" variant="line">
                {c.requestLabel} <ArrowRight aria-hidden />
              </Button>
            </div>
          </div>
          <dl className={styles.nap}>
            <div>
              <dt>{c.labels.email}</dt>
              <dd>
                <TrackedLink kind="email" href={`mailto:${company.email}`} placement={c.lang}>
                  <Mail aria-hidden /> {company.email}
                </TrackedLink>
              </dd>
            </div>
            <div>
              <dt>{c.labels.address}</dt>
              <dd>
                <TrackedLink kind="maps" href={company.mapsUrl} placement={c.lang}>
                  <MapPin aria-hidden /> {company.address}, Romania
                </TrackedLink>
              </dd>
            </div>
            <div>
              <dt>{c.labels.languages}</dt>
              <dd>{c.languages}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
