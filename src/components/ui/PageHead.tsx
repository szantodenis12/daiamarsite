import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { noOrphan } from "@/lib/text";
import Reveal from "@/components/ui/Reveal";
import ParallaxImage from "@/components/motion/ParallaxImage";
import TextReveal from "@/components/motion/TextReveal";
import styles from "./ui.module.css";

export type Crumb = { name: string; href?: string };

type Props = {
  title: React.ReactNode;
  intro?: React.ReactNode;
  crumbs?: Crumb[];
  image?: { src: string; alt: string };
};

export default function PageHead({ title, intro, crumbs, image }: Props) {
  return (
    <header className={`block ${styles.pageHead}`}>
      <div className={`wrap ${styles.pageHeadInner}`} data-image={image ? "true" : undefined}>
        <div>
          {crumbs && (
            <nav className={styles.crumbs} aria-label="Navigare">
              {crumbs.map((c, i) => (
                <Fragment key={c.name}>
                  {i > 0 && <ChevronRight aria-hidden />}
                  {c.href ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
                </Fragment>
              ))}
            </nav>
          )}
          <TextReveal as="h1" mode="load">
            {typeof title === "string" ? noOrphan(title) : title}
          </TextReveal>
          {intro && <div className={styles.intro}>{intro}</div>}
        </div>
        {image && (
          <Reveal variant="image" className={styles.pageHeadImage}>
            <ParallaxImage speed={0.1} className={styles.pxFill}>
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 480px" priority fetchPriority="high" />
            </ParallaxImage>
          </Reveal>
        )}
      </div>
    </header>
  );
}
