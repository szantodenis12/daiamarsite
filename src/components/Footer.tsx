import Image from "next/image";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/ConsentBanner";
import TrackedLink from "@/components/TrackedLink";
import { company, whatsappHref } from "@/lib/site";
import LangSwitch from "./LangSwitch";
import styles from "./Footer.module.css";

const serviceLinks = [
  { href: "/servicii/contabilitate/", label: "Contabilitate" },
  { href: "/servicii/salarizare-resurse-umane/", label: "Salarizare și HR" },
  { href: "/servicii/consultanta-fiscala/", label: "Consultanță fiscală" },
  { href: "/servicii/reprezentare-controale-anaf/", label: "Controale ANAF" },
  { href: "/servicii/audit-intern-extern/", label: "Audit" },
];

const firmLinks = [
  { href: "/despre/", label: "Despre" },
  { href: "/echipa/", label: "Echipa" },
  { href: "/clienti-din-toata-tara/", label: "Clienți din toată țara" },
  { href: "/servicii/", label: "Toate serviciile" },
];

const resourceLinks = [
  { href: "/resurse/", label: "Ghiduri" },
  { href: "/resurse/#noutati", label: "Noutăți fiscale" },
  { href: "/trimite-documente/", label: "Trimite documente" },
];

const legalLinks = [
  { href: "/confidentialitate/", label: "Confidențialitate" },
  { href: "/cookies/", label: "Cookie-uri" },
  { href: "/termeni/", label: "Termeni și condiții" },
];

// ANPC: the SAL pictogram is the official one from anpc.ro/sal ("Plachetă SAL"). The EU ODR platform closed on 20.07.2025;
// the Commission's replacement page lists the dispute resolution bodies, so SOL links there (checked 06.11.2026).
const anpc = [
  { href: "https://anpc.ro/sal", label: "ANPC, soluționarea alternativă a litigiilor (SAL)", image: "/img/anpc/sal.png" },
  { href: "https://consumer-redress.ec.europa.eu/index_ro", label: "Soluționarea online a litigiilor (SOL), Comisia Europeană" },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.col}>
      <p className={styles.label}>{title}</p>
      <ul className={styles.links}>{children}</ul>
    </div>
  );
}

export default function Footer() {
  const [mainPhone] = company.phones;
  return (
    <footer className={`block ${styles.footer}`}>
      <div className={`wrap ${styles.grid}`}>
        <nav className={styles.cols} aria-label="Subsol">
          <Column title="Servicii">
            {serviceLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </Column>
          <Column title="Firma">
            {firmLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </Column>
          <Column title="Resurse">
            {resourceLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </Column>
          <Column title="Contact">
            {company.phones.map((p) => (
              <li key={p.href}>
                <TrackedLink kind="phone" href={p.href} placement="footer" className="num">
                  {p.label}
                </TrackedLink>
              </li>
            ))}
            <li>
              <TrackedLink kind="whatsapp" href={whatsappHref} placement="footer">
                WhatsApp
              </TrackedLink>
            </li>
            <li>
              <TrackedLink kind="email" href={`mailto:${company.email}`} placement="footer">
                E-mail
              </TrackedLink>
            </li>
            <li>
              <TrackedLink kind="maps" href={company.mapsUrl} placement="footer">
                {company.street}
              </TrackedLink>
            </li>
            <li>{company.hours.label}</li>
          </Column>
        </nav>

        <aside className={styles.side}>
          <p className={styles.label}>Daiamar</p>
          <div className={styles.actions}>
            <Link href="/contact/#formular" className={styles.pill}>
              Solicitați o discuție
            </Link>
            <TrackedLink kind="phone" href={mainPhone.href} placement="footer-buton" className={`${styles.pill} ${styles.pillLine}`}>
              Sunați-ne
            </TrackedLink>
          </div>
          <ul className={styles.legal}>
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton className={styles.cookieBtn} />
            </li>
          </ul>
          <LangSwitch className={styles.lang} />
          <ul className={styles.anpc} aria-label="Protecția consumatorilor">
            {anpc.map((a) => (
              <li key={a.href}>
                <a href={a.href} target="_blank" rel="noopener noreferrer" aria-label={a.label} title={a.label}>
                  {a.image ? <Image src={a.image} alt={a.label} width={120} height={30} /> : <span>SOL</span>}
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.copy}>
            © {new Date().getFullYear()} {company.legal.name}
            <br />
            CUI {company.legal.cui}
            {company.ceccarNo && <> · CECCAR nr. {company.ceccarNo}</>}
          </p>
          <p className={styles.copy}>
            Site realizat de{" "}
            <a href="https://epicdigitalhub.ro" target="_blank" rel="noopener">
              Epic Digital Hub
            </a>
          </p>
        </aside>

        {/* TODO: de cerut de la client logo vectorial; the mark goes left of the wordmark, as in the reference. */}
        <p className={styles.wordmark} aria-hidden>
          Daiamar
        </p>
      </div>
    </footer>
  );
}
