import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsentBanner from "@/components/ConsentBanner";
import { FloatingWhatsApp, MobileBar } from "@/components/ContactBars";
import SmoothScroll from "@/components/motion/SmoothScroll";
import styles from "./site.module.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <SmoothScroll />
      <a href="#continut" className="sr-only">
        Sari la conținut
      </a>
      {/* First in the DOM so keyboard users reach it right after the skip link; it is position: fixed, so the layout is unchanged. */}
      <ConsentBanner />
      <Header />
      <main id="continut">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <MobileBar />
    </div>
  );
}
