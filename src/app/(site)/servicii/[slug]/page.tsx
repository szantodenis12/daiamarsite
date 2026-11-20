import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Phone } from "lucide-react";
import { company, services } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import PageHead from "@/components/ui/PageHead";
import Faq, { faqSchema } from "@/components/ui/Faq";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import JsonLd from "@/components/ui/JsonLd";
import Related from "@/components/ui/Related";
import { baseGraph, breadcrumbSchema, serviceSchema, webPageSchema } from "@/lib/schema";
import LeadForm from "@/components/LeadForm";
import TrackedLink from "@/components/TrackedLink";
import { articles } from "../../resurse/articles";
import { content, type Line } from "../content";
import { photos } from "../visuals";
import styles from "../servicii.module.css";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = content[slug];
  if (!c) return { title: "Pagina nu există", robots: { index: false, follow: true } };
  return pageMeta({ title: c.metaTitle, description: c.metaDescription, path: `/servicii/${slug}/`, image: null });
}

const visible = (line: Line) => typeof line === "string" || process.env.NODE_ENV !== "production";

function LineText({ line }: { line: Line }) {
  if (typeof line === "string") return <span>{line}</span>;
  return (
    <span>
      {line.text} <span className="todo">de cerut de la client</span>
    </span>
  );
}

const landings: Record<string, { href: string; label: string }> = {
  contabilitate: { href: "/schimba-contabilul/", label: "Schimbați contabilul? Cum preluăm evidența" },
  "infiintari-lichidari-firme": { href: "/firme-noi/", label: "Contabilitate pentru firme noi" },
  "reprezentare-controale-anaf": { href: "/control-anaf/", label: "Aveți un control acum?" },
};

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  const c = content[slug];
  if (!service || !c) notFound();

  const path = `/servicii/${slug}/`;
  const related = c.related.map((r) => services.find((s) => s.slug === r)).filter((s) => s !== undefined);
  const guides = articles.filter((a) => a.services.includes(slug)).map((a) => ({ href: `/resurse/${a.slug}/`, label: a.title }));
  const landing = landings[slug];

  const schema = baseGraph(
    webPageSchema(path, c.metaTitle, c.metaDescription, "ItemPage"),
    serviceSchema(slug, service.title, c.metaDescription, c.national),
    breadcrumbSchema([
      { name: "Acasă", path: "/" },
      { name: "Servicii", path: "/servicii/" },
      { name: service.title, path },
    ]),
    faqSchema(c.faq, path),
  );

  return (
    <>
      <JsonLd data={schema} />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Servicii", href: "/servicii/" }, { name: service.title }]}
        title={service.title}
        intro={c.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
        image={photos[slug]}
      />

      <div className="wrap">
        {c.angle && (
          <Reveal className={styles.angle}>
            <TextReveal>{c.angle.title}</TextReveal>
            <p>{c.angle.text}</p>
          </Reveal>
        )}

        <div className={styles.layout}>
          <div className={styles.main}>
            <Reveal className={styles.section}>
              <TextReveal>Ce include serviciul?</TextReveal>
              <div className={styles.docs}>
                {c.includes.map((sec, i) => (
                  <div key={sec.heading ?? i} className={styles.doc}>
                    {sec.heading && <h3>{sec.heading}</h3>}
                    {sec.note && <p className={styles.docNote}>{sec.note}</p>}
                    <ul className={styles.list}>
                      {sec.items.filter(visible).map((item) => (
                        <li key={typeof item === "string" ? item : item.text}>
                          <Check aria-hidden />
                          <LineText line={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className={styles.section}>
              <TextReveal>Pentru cine este serviciul?</TextReveal>
              <ul className={styles.list}>
                {c.forWhom.map((item) => (
                  <li key={item}>
                    <Check aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className={styles.section}>
              <TextReveal>Ce documente pregătiți?</TextReveal>
              <ul className={styles.list}>
                {c.documents.filter(visible).map((item) => (
                  <li key={typeof item === "string" ? item : item.text}>
                    <Check aria-hidden />
                    <LineText line={item} />
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className={styles.section}>
              <TextReveal>Cum lucrăm?</TextReveal>
              <ol className={styles.steps}>
                {c.steps.map((step, i) => (
                  <li key={step.title} className={styles.step}>
                    <span className={`${styles.stepNo} num`}>{i + 1}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className={styles.section}>
              <TextReveal>Întrebări frecvente</TextReveal>
              <Faq items={c.faq} />
            </Reveal>
          </div>

          <aside className={styles.aside}>
            <div className={styles.contact}>
              <h2>Discutați cu noi</h2>
              <p>Spuneți-ne pe scurt situația firmei.</p>
              <div className={styles.phones}>
                {company.phones.map((p) => (
                  <TrackedLink key={p.href} kind="phone" href={p.href} placement="serviciu-aside" className="num">
                    <Phone aria-hidden />
                    {p.label}
                  </TrackedLink>
                ))}
              </div>
              <LeadForm placement="serviciu" service={slug} title="Trimiteți o solicitare" compact />
            </div>
            <Related links={related.map((r) => ({ href: `/servicii/${r.slug}/`, label: r.title }))} />
            <Related title="Ghiduri și pagini legate" links={[...guides, ...(landing ? [landing] : [])]} />
          </aside>
        </div>
      </div>

      <CtaBand placement={`serviciu-${slug}`} />
    </>
  );
}
