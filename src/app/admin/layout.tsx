import type { Metadata } from "next";
import { ThemeSync } from "./ui/ThemeToggle";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin Daiamar" },
  robots: { index: false, follow: false },
};

// Runs before first paint: stored choice, else the system preference. Scoped to the admin shell.
const THEME_SCRIPT = `(function(){try{var t=null;try{t=localStorage.getItem('dm_admin_theme')}catch(e){}if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.currentScript.parentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t}catch(e){}})()`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <ThemeSync />
      {children}
    </div>
  );
}
