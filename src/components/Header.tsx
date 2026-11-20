import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderEffects from "./HeaderEffects";
import HeaderMenu from "./HeaderMenu";
import LangSwitch from "./LangSwitch";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.logo} aria-label="Daiamar, pagina principală">
          <Logo priority />
        </Link>
        <HeaderMenu />
        <LangSwitch className={styles.barLang} />
      </div>
      <HeaderEffects />
    </header>
  );
}
