import HeroVideo from "@/components/HeroVideo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Calculator,
  Check,
  ClipboardCheck,
  FileSearch,
  Gavel,
  Globe,
  Landmark,
  MapPin,
  MonitorCheck,
  Phone,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { company, services } from "@/lib/site";
import { images } from "@/lib/images";
import { pageMeta } from "@/lib/seo";
import { baseGraph, webPageSchema } from "@/lib/schema";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import Reveal from "@/components/ui/Reveal";
import { noOrphan } from "@/lib/text";
import TextReveal from "@/components/motion/TextReveal";
import Parallax from "@/components/motion/Parallax";
import ParallaxImage from "@/components/motion/ParallaxImage";
import CountUp from "@/components/motion/CountUp";
import ScrollProgress from "@/components/motion/ScrollProgress";
import GoogleReviews from "@/components/GoogleReviews";
import LeadForm from "@/components/LeadForm";
import MapEmbed from "@/components/MapEmbed";
import TrackedLink from "@/components/TrackedLink";
import { articles, formatDate } from "./resurse/articles";
import styles from "./home.module.css";

const title = "Servicii contabilitate Oradea, experiență ANAF";
const description =
  "Daiamar, firmă de contabilitate în Oradea, membră CECCAR: contabilitate, consultanță fiscală, salarizare, audit, reprezentare la controale ANAF. 20+ ani ANAF.";

export const metadata: Metadata = {
  ...pageMeta({ title, description, path: "/", languages: { ro: "/", en: "/en/", it: "/it/", "x-default": "/" } }),
  title: { absolute: `${title} | Daiamar` },
};

const photos = { heroSmall: images.monicaBirou, about: images.monicaBiroulLat, control: images.daianaBirou };

const trust = [
  { icon: BadgeCheck, label: "Membră CECCAR" },
  { icon: MonitorCheck, label: "Program SAP implementat" },
  { icon: Globe, label: "Lucrăm în română, engleză și italiană" },
  { icon: MapPin, label: `${company.city}, ${company.region}` },
];

// A1 and work permits are never in this grid (client rule); they stay on the hub and in the footer.
const serviceCards: { slug: string; icon: LucideIcon }[] = [
  { slug: "contabilitate", icon: Calculator },
  { slug: "consultanta-fiscala", icon: Landmark },
  { slug: "salarizare-resurse-umane", icon: Users },
  { slug: "reprezentare-controale-anaf", icon: ShieldCheck },
  { slug: "audit-intern-extern", icon: ClipboardCheck },
  { slug: "servicii-juridice", icon: Gavel },
  { slug: "infiintari-lichidari-firme", icon: Briefcase },
  { slug: "rambursari-tva-ue", icon: Globe },
];

const aboutPoints = [
  { icon: ShieldCheck, title: "Reprezentare la controale", text: "Pe bază de împuternicire, în relația cu ANAF și ITM." },
  { icon: ClipboardCheck, title: "Audit intern și extern", text: "Verificăm evidența înainte să o verifice un inspector." },
  { icon: TrendingUp, title: "Situații pentru conducere", text: "Lunare sau trimestriale, în formatul și limba stabilite de client." },
];

const controlItems = [
  {
    title: "Reprezentare la controale ANAF și ITM",
    text: "Inspecții generale sau parțiale. Pregătim documentele, suntem prezenți la control și răspundem în locul dumneavoastră.",
  },
  {
    title: "Audit intern și audit extern",
    text: "Verificăm evidența contabilă a firmei înainte să o verifice un inspector.",
  },
  {
    title: "Contestații și acțiuni în instanță",
    text: "Întocmim contestația și, dacă este nevoie, mergem mai departe în instanță, împreună cu avocații colaboratori.",
  },
];

const segments = [
  {
    icon: Briefcase,
    title: "Firme nou înființate și PFA-uri",
    text: "Înființare, explicarea obligațiilor, contabilitate de la primele documente.",
    href: "/firme-noi/",
    image: images.mariusDosare,
  },
  {
    icon: Scale,
    title: "Firme în creștere, cu activitate complexă",
    text: "Analize economice lunare, programe integrate, bilanțuri consolidate pentru grupuri.",
    href: "/servicii/contabilitate/",
    image: images.birouDoiColegi,
  },
  {
    icon: FileSearch,
    title: "Firme aflate în control sau cu probleme fiscale",
    text: "Reprezentare la control, contestații, dosare de eșalonare.",
    href: "/control-anaf/",
    image: images.sedintaEcran,
  },
];

const steps = [
  {
    title: "O discuție despre firmă",
    text: "Sunați sau trimiteți formularul. Ne spuneți ce face firma, câți angajați are și ce aveți de rezolvat: o evidență rămasă în urmă, un control anunțat, o preluare de la alt contabil.",
  },
  {
    title: "Verificăm ce există",
    text: "Ne uităm pe actele firmei: balanța și declarațiile, dacă preluăm de la alt contabil, sau avizul, dacă urmează un control. Vă spunem ce trebuie corectat și ce termene urmează.",
  },
  {
    title: "Lucrul lunar",
    text: "Contabilitate, salarizare, declarații și situații lunare pentru conducere.",
  },
];



export default function HomePage() {
  const bySlug = (slug: string) => services.find((s) => s.slug === slug)!;

  return (
    <>
      <JsonLd data={baseGraph(webPageSchema("/", title, description))} />

      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <TextReveal as="h1" mode="load"><span className={styles.heroLine}>Servicii contabilitate</span> în Oradea</TextReveal>
            <p className={`${styles.heroSub} ${styles.fadeUp}`} style={{ "--d": "380ms" } as React.CSSProperties}>Peste 20 de ani de experiență în cadrul ANAF, divizia control fiscal</p>
            <p className={`${styles.heroLede} ${styles.fadeUp}`} style={{ "--d": "480ms" } as React.CSSProperties}>
              Contabilitate, consultanță fiscală, resurse umane și reprezentare la controale, pentru firme din Oradea, din Bihor și din toată țara.
            </p>
            <div className={`${styles.heroActions} ${styles.fadeUp}`} style={{ "--d": "580ms" } as React.CSSProperties}>
              <TrackedLink kind="phone" href={company.phones[0].href} placement="home-hero" className={`${styles.heroPhone} num`}>
                <Phone aria-hidden /> {company.phones[0].label}
              </TrackedLink>
              <Button href="#formular" variant="light">
                Solicitați o discuție <ArrowRight aria-hidden />
              </Button>
            </div>
          </div>

          <div className={styles.collage}>
            <Parallax speed={0.04} className={styles.collageMain}>
              <HeroVideo poster="/video/daiamar-birou-poster.jpg" label="Echipa Daiamar la lucru, în biroul din Oradea" />
            </Parallax>
            <Parallax speed={-0.06} className={styles.collageSmall}>
              <Image src={photos.heroSmall.src} alt={photos.heroSmall.alt} fill sizes="240px" />
            </Parallax>
            <Parallax speed={-0.1} className={`${styles.chipPos} ${styles.chipTop}`}>
              <div className={styles.chip} style={{ "--d": "700ms" } as React.CSSProperties}>
                <span className={styles.chipIcon}><Landmark aria-hidden /></span>
                <span>
                  <strong>20+ ani în ANAF</strong>
                  <small>divizia control fiscal</small>
                </span>
              </div>
            </Parallax>
            <Parallax speed={-0.05} className={`${styles.chipPos} ${styles.chipBottom}`}>
              <div className={`${styles.chip} ${styles.chipFromRight}`} style={{ "--d": "820ms" } as React.CSSProperties}>
                <span className={styles.chipIcon}><BadgeCheck aria-hidden /></span>
                <span>
                  <strong>Membră CECCAR</strong>
                  <small>experți contabili</small>
                </span>
              </div>
            </Parallax>
          </div>
        </div>
      </section>

      <section className={`block ${styles.trust}`} aria-label="Repere">
        <ul className={`wrap ${styles.trustList}`}>
          {trust.map(({ icon: Icon, label }) => (
            <li key={label}>
              <Icon aria-hidden /> {label}
            </li>
          ))}
        </ul>
      </section>

      <section className={`wrap ${styles.section}`} id="servicii">
        <Reveal variant="fade" className={styles.head}>
          <div>
            <TextReveal>{noOrphan("Ce servicii oferă Daiamar în Oradea?")}</TextReveal>
          </div>
          <Button href="/servicii/" variant="light">
            Toate serviciile <ArrowRight aria-hidden />
          </Button>
        </Reveal>
        <ul className={styles.serviceGrid}>
          {serviceCards.map(({ slug, icon: Icon }, i) => {
            const s = bySlug(slug);
            return (
              <Reveal as="li" key={slug} delay={(i % 4) * 70}>
                <Link href={`/servicii/${slug}/`} className={styles.serviceCard}>
                  <span className={styles.tile}><Icon aria-hidden /></span>
                  <strong>
                    {s.title}
                    <ArrowRight aria-hidden className={styles.serviceArrow} />
                  </strong>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className={`wrap ${styles.section}`} id="despre">
        <div className={styles.about}>
          <div className={styles.aboutPhoto}>
            <Reveal variant="image" className={styles.aboutFrame}>
              <ParallaxImage speed={0.1} className={styles.fill}>
                <Image src={photos.about.src} alt={photos.about.alt} fill sizes="(max-width: 900px) 100vw, 560px" />
              </ParallaxImage>
            </Reveal>
            <Reveal delay={350} className={styles.stat}>
              <strong className="num"><CountUp value={20} suffix="+" /></strong>
              <span>ani în ANAF, divizia control fiscal</span>
            </Reveal>
          </div>
          <Reveal delay={100} className={styles.aboutText}>
            <TextReveal>Despre Daiamar</TextReveal>
            <p>Societate de contabilitate din Oradea, membră CECCAR, pentru societăți comerciale, PFA și întreprinderi individuale din Oradea, din Bihor și din restul țării.</p>
            <ul className={styles.aboutPoints}>
              {aboutPoints.map(({ icon: Icon, title, text }, i) => (
                <Reveal as="li" key={title} delay={i * 80}>
                  <span className={styles.tile}><Icon aria-hidden /></span>
                  <span>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </span>
                </Reveal>
              ))}
            </ul>
            <Link href="/despre/" className={styles.textLink}>
              Despre Daiamar <ArrowUpRight aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={`block ${styles.dark}`} id="control">
        <div className={`wrap ${styles.darkGrid}`}>
          <Reveal className={styles.darkText}>
            <TextReveal>{noOrphan("Reprezentare la controale ANAF și audit")}</TextReveal>
            <p className={styles.darkLede}>
              Monica Diana Pop a lucrat peste 20 de ani în divizia control fiscal a ANAF. La un control, asta înseamnă: reprezentare în timpul inspecției, documentele cerute pregătite la
              timp și, dacă este cazul, contestația.
            </p>
            <ul className={styles.darkList}>
              {controlItems.map((it, i) => (
                <Reveal as="li" key={it.title} delay={i * 80}>
                  <Check aria-hidden />
                  <span>
                    <strong>{it.title}</strong>
                    <small>{it.text}</small>
                  </span>
                </Reveal>
              ))}
            </ul>
            <div className={styles.darkActions}>
              <Button href="/control-anaf/">
                Control ANAF anunțat? <ArrowRight aria-hidden />
              </Button>
              <Button href="/servicii/audit-intern-extern/" variant="line">
                Audit intern și extern
              </Button>
            </div>
            {/* TODO: de cerut de la client tipurile de audit oferite și pentru ce firme */}
          </Reveal>
          <Reveal delay={120} variant="image" className={styles.darkPhoto}>
            <ParallaxImage speed={0.1} className={styles.fill}>
              <Image src={photos.control.src} alt={photos.control.alt} fill sizes="(max-width: 900px) 100vw, 520px" />
            </ParallaxImage>
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`} id="pentru-cine">
        <Reveal variant="fade" className={styles.head}>
          <div>
            <TextReveal>Cu cine lucrăm?</TextReveal>
          </div>
        </Reveal>
        <ul className={styles.segments}>
          {segments.map(({ icon: Icon, title, text, href, image }, i) => (
            <Reveal as="li" key={title} delay={i * 80}>
              <Link href={href} className={styles.segment}>
                <div className={styles.segmentPhoto}>
                  <ParallaxImage speed={0.08} className={styles.fill}>
                    <Image src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 400px" />
                  </ParallaxImage>
                  <span className={styles.badge}><Icon aria-hidden /></span>
                </div>
                <span className={styles.segmentBody}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                  <span className={styles.more}>
                    Detalii <ArrowRight aria-hidden className={styles.moreChip} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className={`block ${styles.soft}`} id="cum-incepem">
        <div className={`wrap ${styles.work}`}>
          <Reveal className={styles.workText}>
            <TextReveal>{noOrphan("Cum începem colaborarea cu firma dumneavoastră?")}</TextReveal>
            <ScrollProgress start={0.75} end={0.35}>
              <ol className={styles.steps}>
                {steps.map((st, i) => (
                  <li key={st.title} style={{ "--i": i } as React.CSSProperties}>
                  <span className={`${styles.stepNo} num`}>{i + 1}</span>
                  <span>
                    <strong>{st.title}</strong>
                    <small>{st.text}</small>
                  </span>
                </li>
              ))}
              </ol>
            </ScrollProgress>
          </Reveal>
          <Reveal delay={100} className={styles.formBox} as="div">
            <div id="formular" className={styles.formAnchor} />
            <TextReveal>Solicitați o discuție</TextReveal>
            <p className={styles.formNote}>
              Vă contactăm telefonic sau prin e-mail și stabilim o discuție la birou sau la telefon. Sau sunați direct:{" "}
              {company.phones.map((p, i) => (
                <span key={p.href}>
                  {i > 0 && " · "}
                  <TrackedLink kind="phone" href={p.href} placement="home-form" className="num">
                    {p.label}
                  </TrackedLink>
                </span>
              ))}
            </p>
            <LeadForm placement="home" />
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`} id="birou">
        <Reveal variant="fade" className={styles.head}>
          <div>
            <TextReveal>{noOrphan("Unde ne găsiți în Oradea?")}</TextReveal>
            <p>{company.address}, județul {company.region}.</p>
          </div>
        </Reveal>
        <div className={styles.place}>
          <Reveal>
            <MapEmbed placement="home" compact />
          </Reveal>
          <Reveal delay={100}>
            <GoogleReviews placement="home" />
          </Reveal>
        </div>
      </section>

      <section className={`wrap ${styles.section}`} id="resurse">
        <Reveal variant="fade" className={styles.head}>
          <div>
            <TextReveal>{noOrphan("Ghiduri practice pentru antreprenori")}</TextReveal>
          </div>
          <Button href="/resurse/" variant="light">
            Toate articolele <ArrowRight aria-hidden />
          </Button>
        </Reveal>
        <ul className={styles.articles}>
          {articles.slice(0, 3).map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 80}>
              <Link href={`/resurse/${a.slug}/`} className={styles.article}>
                <div className={styles.articlePhoto}>
                  <ParallaxImage speed={0.08} className={styles.fill}>
                    <Image src={a.cover.src} alt={a.cover.alt} fill sizes="(max-width: 900px) 100vw, 400px" />
                  </ParallaxImage>
                </div>
                <span className={styles.articleBody}>
                  <small className="num">{formatDate(a.published)}</small>
                  <strong>{a.title}</strong>
                  <span className={styles.more}>
                    Citiți articolul <ArrowRight aria-hidden className={styles.moreChip} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>


    </>
  );
}
