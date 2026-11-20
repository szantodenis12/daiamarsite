import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackedLink from "@/components/TrackedLink";
import { company, services } from "@/lib/site";
import styles from "@/components/ui/ui.module.css";

export const metadata: Metadata = {
  title: "Pagina nu există",
  robots: { index: false, follow: true },
};

const links = [
  { href: "/servicii/", label: "Toate serviciile" },
  { href: "/servicii/reprezentare-controale-anaf/", label: "Reprezentare la controale ANAF și ITM" },
  { href: "/servicii/contabilitate/", label: "Contabilitate" },
  { href: "/despre/", label: "Despre Daiamar" },
  { href: "/resurse/", label: "Ghiduri practice" },
  { href: "/contact/", label: "Contact" },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="continut">
        <div className={`wrap ${styles.notFound}`}>
          <h1>Pagina nu există sau a fost mutată</h1>
          <p>
            Site-ul daiamar.ro a fost refăcut și unele adrese vechi nu mai sunt valabile. Căutați mai jos pagina de care aveți nevoie sau
            sunați-ne la{" "}
            <TrackedLink kind="phone" href={company.phones[0].href} placement="404" className="num">
              {company.phones[0].label}
            </TrackedLink>
            .
          </p>
          <div className={styles.notFoundLinks}>
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                <ArrowRight aria-hidden /> {l.label}
              </Link>
            ))}
          </div>
          <p>
            Servicii: {services.map((s) => s.title.toLowerCase()).slice(0, 5).join(", ")} și altele.{" "}
            <TrackedLink kind="phone" href={company.phones[1].href} placement="404" className="num">
              <Phone aria-hidden size={16} /> {company.phones[1].label}
            </TrackedLink>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
