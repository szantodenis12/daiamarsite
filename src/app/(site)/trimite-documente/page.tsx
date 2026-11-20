import type { Metadata } from "next";
import { FileLock2, ShieldCheck, Trash2 } from "lucide-react";
import { company } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import PageHead from "@/components/ui/PageHead";
import Reveal from "@/components/ui/Reveal";
import UploadForm from "@/components/UploadForm";
import TrackedLink from "@/components/TrackedLink";
import styles from "./documente.module.css";

export const metadata: Metadata = pageMeta({
  title: "Trimiteți documente",
  description: "Trimiteți documente către Daiamar, Oradea: PDF, JPG, PNG sau HEIC, până la 5 fișiere de cel mult 10 MB, printr-o legătură securizată.",
  path: "/trimite-documente/",
  noindex: true,
});

const points = [
  { icon: FileLock2, title: "Transfer criptat", text: "Fișierele ajung la noi prin conexiunea securizată a site-ului (HTTPS) și se păstrează într-un spațiu privat, fără linkuri publice." },
  { icon: ShieldCheck, title: "Acces numai pentru echipă", text: "Documentele se văd doar din panoul intern Daiamar, după autentificare. Nu se trimit mai departe." },
  { icon: Trash2, title: "Ștergere", text: "Dacă nu urmează o colaborare, documentele se șterg după perioada din politica de confidențialitate. Puteți cere ștergerea oricând." },
];

export default function DocumentsPage() {
  return (
    <>
      <PageHead
        crumbs={[{ name: "Acasă", href: "/" }, { name: "Contact", href: "/contact/" }, { name: "Trimiteți documente" }]}
        title="Trimiteți documente către Daiamar"
        intro={
          <p>
            Aici ne trimiteți documentele pe care vi le cerem la o discuție sau pe care vreți să le vedem înainte de o întâlnire: balanțe, decizii de
            impunere, avize de inspecție, contracte, acte ale firmei. Formatele acceptate sunt PDF, JPG, PNG și HEIC, cel mult 5 fișiere de 10 MB
            fiecare la o trimitere.
          </p>
        }
      />

      <section className={`wrap ${styles.grid}`}>
        <Reveal className={styles.formCard}>
          <h2>Încărcați documentele</h2>
          <p>Lăsați un telefon sau un e-mail ca să vă putem confirma primirea. Dacă aveți deja o solicitare la noi, documentele ajung la aceeași cerere.</p>
          <UploadForm placement="documente" />
        </Reveal>

        <Reveal delay={100} className={styles.aside}>
          <ul className={styles.points}>
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className={styles.tile}><Icon aria-hidden /></span>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Fișiere mai mari sau alte formate? Sunați la{" "}
            <TrackedLink kind="phone" href={company.phones[0].href} placement="documente" className="num">{company.phones[0].label}</TrackedLink>{" "}
            și stabilim altă cale de transmitere.
          </p>
        </Reveal>
      </section>
    </>
  );
}
