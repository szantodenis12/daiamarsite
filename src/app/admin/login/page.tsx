import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Autentificare" };

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

  return (
    <main className={styles.login}>
      <form action="/api/login/" method="post" className={styles.loginCard}>
        <LockKeyhole aria-hidden size={22} className={styles.loginIcon} />
        <h1 className={styles.loginTitle}>Admin Daiamar</h1>
        {!configured && (
          <p className={styles.alert}>ADMIN_PASSWORD și ADMIN_SECRET nu sunt setate. Vezi DEPLOY.md.</p>
        )}
        <input type="hidden" name="next" value={next ?? "/admin/"} />
        <label className={styles.label} htmlFor="password">Parola</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={styles.input} autoFocus />
        {error && <p className={styles.alert} role="alert">Parola nu este corectă.</p>}
        <button type="submit" className={styles.primary}>Intră</button>
      </form>
    </main>
  );
}
