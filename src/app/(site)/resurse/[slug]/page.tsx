import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import PageHead from "@/components/ui/PageHead";
import Faq, { faqSchema } from "@/components/ui/Faq";
import CtaBand from "@/components/ui/CtaBand";
import JsonLd from "@/components/ui/JsonLd";
import Related from "@/components/ui/Related";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import { articleSchema, baseGraph, breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { articles, author, formatDate, getArticle } from "../articles";
import styles from "../resurse.module.css";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Pagina nu există", robots: { index: false, follow: true } };
  return pageMeta({
    title: article.metaTitle,
    description: article.description,
    path: `/resurse/${article.slug}/`,
    image: null,
    type: "article",
    published: article.published,
    noindex: !article.reviewed,
  });
}

function sectionId(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const path = `/resurse/${article.slug}/`;
  const schema = baseGraph(
    webPageSchema(path, article.title, article.description),
    breadcrumbSchema([
      { name: "Acasă", path: "/" },
      { name: "Resurse", path: "/resurse/" },
      { name: article.title, path },
    ]),
    faqSchema(article.faq, path),
    ...(article.reviewed ? [articleSchema(article)] : []),
  );
  const relatedServices = article.services
    .map((s) => services.find((x) => x.slug === s))
    .filter((s) => s !== undefined)
    .map((s) => ({ href: `/servicii/${s.slug}/`, label: s.title }));

  return (
    <>
      <JsonLd data={schema} />
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Resurse", href: "/resurse/" }, { name: article.title }]}
        title={article.title}
        intro={<p>{article.lead}</p>}
      />

      <div className={`wrap ${styles.article}`}>
        <article className={styles.body}>
          {article.sections.map((s) => (
            <section key={s.title} id={sectionId(s.title)}>
              <TextReveal>{s.title}</TextReveal>
              {s.text?.map((p) => <p key={p}>{p}</p>)}
              {s.list && (
                <ul>
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.after && <p className={styles.after}>{s.after}</p>}
            </section>
          ))}
          <p className={styles.notice}>
            Articol informativ, valabil la data publicării ({formatDate(article.published)}). Nu înlocuiește consultanța pentru situația
            concretă a firmei dumneavoastră. Legislația se modifică; verificați termenele cu contabilul înainte de a acționa.
          </p>
          {!article.reviewed && process.env.NODE_ENV !== "production" && (
            <p className={styles.notice}>
              <span className="todo">de validat de Daiamar</span> Articolul este noindex și lipsește din sitemap până la validare (articles.ts, reviewed).
            </p>
          )}
        </article>

        <aside className={styles.aside}>
          <dl className={styles.asideCard}>
            {article.reviewed && (
              <>
                <dt>Autor</dt>
                <dd>{author}</dd>
              </>
            )}
            <dt>Publicat</dt>
            <dd className="num">{formatDate(article.published)}</dd>
            {article.updated !== article.published && (
              <>
                <dt>Actualizat</dt>
                <dd className="num">{formatDate(article.updated)}</dd>
              </>
            )}
            <dt>Legat de</dt>
            <dd><Link href={article.related.href}>{article.related.label}</Link></dd>
          </dl>
          <nav className={styles.asideCard} aria-label="Cuprins">
            <span className={styles.asideTitle}>Cuprins</span>
            <div className={styles.toc}>
              {article.sections.map((s) => (
                <a key={s.title} href={`#${sectionId(s.title)}`}>{s.title}</a>
              ))}
            </div>
          </nav>
          <Related links={relatedServices} />
        </aside>
      </div>

      <section className={`wrap ${styles.faqSection}`}>
        <div className={styles.cols}>
          <TextReveal>Pe scurt</TextReveal>
          <Reveal delay={100}>
            <Faq items={article.faq} />
          </Reveal>
        </div>
      </section>

      <CtaBand placement={`articol-${article.slug}`} title="Aveți o întrebare despre firma dumneavoastră?" />
    </>
  );
}
