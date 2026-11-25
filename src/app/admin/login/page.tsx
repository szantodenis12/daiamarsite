import type { Metadata } from "next";
import Image from "next/image";
import { ThemeToggle } from "../ui/ThemeToggle";
import styles from "../admin.module.css";
import local from "./login.module.css";

export const metadata: Metadata = { title: "Autentificare" };

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

  return (
    <main className={styles.login}>
      <div className={local.wrap}>
        <form action="/api/login/" method="post" className={local.card}>
          <div className={local.brand}>
            <Image src="/img/mark.png" alt="" width={32} height={32} />
            Daiamar <span>CRM</span>
          </div>
          <h1 className={local.title}>Autentificare</h1>
          <p className={local.lead}>Introduceți parola de acces la panou.</p>
          {!configured && (
            <p className={styles.alert}>Parola de acces nu este configurată pe server. Cereți ajutorul dezvoltatorului.</p>
          )}
          <input type="hidden" name="next" value={next ?? "/admin/"} />
          <div className={local.fields}>
            <label className={styles.label} htmlFor="password">Parola</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className={styles.input} autoFocus />
          </div>
          {error && <p className={styles.alert} role="alert">Parola nu este corectă.</p>}
          <button type="submit" className={styles.primary}>Intră</button>
        </form>
        <div className={local.theme}><ThemeToggle /></div>
      </div>
    </main>
  );
}
