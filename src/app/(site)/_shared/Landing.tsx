import type { LucideIcon } from "lucide-react";
import { Phone } from "lucide-react";
import { company } from "@/lib/site";
import Faq, { faqSchema, type FaqItem } from "@/components/ui/Faq";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import JsonLd from "@/components/ui/JsonLd";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";
import styles from "./landing.module.css";

export type LandingContent = {
  slug: string;
  service?: string;
  register?: "tu" | "dumneavoastră";
  title: string;
  subtitle: string;
  intro: string;
  form: { title: string; text: string };
  help: { heading: string; lede: string; items: { icon: LucideIcon; title: string; text: string }[] };
  steps: { heading: string; items: { title: string; text: string }[] };
  note?: string;
  faq: FaqItem[];
};

// Ad landing: form and phones above the fold, one topic, no side links.
export default function Landing({ content }: { content: LandingContent }) {
  const { slug } = content;
  return (
    <>
      <JsonLd data={faqSchema(content.faq)} />

      <section className={`block ${styles.heroBand}`}>
        <div className={`wrap ${styles.hero}`}>
          <div>
            <TextReveal as="h1" mode="load">{content.title}</TextReveal>
            <p className={styles.sub}>{content.subtitle}</p>
            <p className={styles.intro}>{content.intro}</p>
            <div className={styles.phones}>
              {company.phones.map((p) => (
                <TrackedLink key={p.href} kind="phone" href={p.href} placement={slug} className={`${styles.phone} num`}>
                  <Phone aria-hidden /> {p.label}
                </TrackedLink>
              ))}
            </div>
            <p className={styles.nap}>
              <span>{company.address}</span>
              <TrackedLink kind="email" href={`mailto:${company.email}`} placement={slug}>{company.email}</TrackedLink>
            </p>
          </div>
          <div className={styles.formCard} id="formular">
            <h2>{content.form.title}</h2>
            <p>{content.form.text}</p>
            <LeadForm placement={slug} service={content.service} register={content.register} compact />
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.section}`}>
        <Reveal>
          <TextReveal>{content.help.heading}</TextReveal>
          <p className={styles.lede}>{content.help.lede}</p>
        </Reveal>
        <Reveal delay={100} className={styles.panel}>
          {content.help.items.map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.item}>
              <span className={styles.icon}><Icon aria-hidden /></span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className={`wrap ${styles.section}`}>
        <TextReveal>{content.steps.heading}</TextReveal>
        <ol className={styles.steps}>
          {content.steps.items.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className={styles.step}>
              <span className={`${styles.stepNo} num`}>{i + 1}</span>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
        {content.note && <p className={styles.note}>{content.note}</p>}
      </section>

      <section className={`wrap ${styles.section}`}>
        <div className={styles.cols}>
          <TextReveal>Pe scurt</TextReveal>
          <Reveal delay={100}>
            <Faq items={content.faq} />
          </Reveal>
        </div>
      </section>

    </>
  );
}
