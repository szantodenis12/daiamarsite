import { Plus } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import styles from "./ui.module.css";

export type FaqItem = { q: string; a: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className={styles.faq}>
      {items.map((it) => (
        <details key={it.q}>
          <summary>
            <span>{it.q}</span>
            <Plus aria-hidden />
          </summary>
          <p>{it.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqSchema(items: FaqItem[], path?: string) {
  return {
    "@type": "FAQPage",
    ...(path && { "@id": `${SITE_URL}${path}#faq` }),
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
}
