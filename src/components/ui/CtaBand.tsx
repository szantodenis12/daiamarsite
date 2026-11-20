import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { company } from "@/lib/site";
import { noOrphan } from "@/lib/text";
import TrackedLink from "@/components/TrackedLink";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import styles from "./ui.module.css";

type Props = { title?: string; text?: string; placement: string };

export default function CtaBand({ title = "Aveți o întrebare despre firma dumneavoastră?", text, placement }: Props) {
  return (
    <section className="wrap">
      <Reveal className={styles.cta}>
        <div>
          <TextReveal>{noOrphan(title, 16)}</TextReveal>
          {text && <p>{text}</p>}
        </div>
        <div className={styles.ctaActions}>
          {company.phones.map((p) => (
            <TrackedLink key={p.href} kind="phone" href={p.href} placement={placement} className={styles.ctaPhone}>
              <Phone /> {p.label}
            </TrackedLink>
          ))}
          <Link href="/contact/#formular" className={styles.ctaForm}>
            Trimite o solicitare <ArrowRight />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
