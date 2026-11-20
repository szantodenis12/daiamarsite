import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getOfferSettings, getTemplates } from "@/lib/offer-store";
import { getTeam, notifyRecipients } from "@/lib/settings";
import { deleteDemoData, setAuthor } from "../../actions/session";
import { saveRecipients, saveTeam } from "../../actions/settings";
import { formatNumber } from "../../format";
import { currentAuthor, requireSession } from "../../session";
import { ActionForm } from "../../ui/ActionForm";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { Field } from "../../ui/Field";
import { AuthorSelect } from "./AuthorSelect";
import { OfferDefaults } from "./OfferDefaults";
import { WeeklyTest } from "./WeeklyTest";
import styles from "./settings.module.css";
import admin from "../../admin.module.css";

export const metadata: Metadata = { title: "Setări" };
export const dynamic = "force-dynamic";

const Flag = ({ on, yes, no }: { on: boolean; yes: string; no: string }) => <dd className={on ? styles.ok : styles.off}>{on ? yes : no}</dd>;

export default async function SettingsPage() {
  await requireSession();
  const [team, author, recipients, leads, events, spend, links, offerSettings, templates, offers, subscribers] = await Promise.all([
    getTeam(),
    currentAuthor(),
    notifyRecipients(),
    db().leadsSince(new Date(0)),
    db().eventsSince(new Date(0)),
    db().spend(),
    db().links(),
    getOfferSettings(),
    getTemplates(),
    db().offers(),
    db().subscribers(),
  ]);
  const demo = leads.filter((l) => l.demo).length + events.filter((e) => e.demo).length + spend.filter((s) => s.demo).length + links.filter((l) => l.demo).length + offers.filter((o) => o.demo).length;
  const neon = db().kind === "neon";

  return (
    <>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>Notificări, echipă, bază de date</p>
          <h1 className={admin.h1}>Setări</h1>
        </div>
      </div>

      <div className={admin.cards}>
        <section className={admin.card}>
          <h2 className={admin.h2}>Emailuri de notificare</h2>
          <ActionForm action={saveRecipients} submitLabel="Salvează" className={styles.stack}>
            <Field
              label="Adrese (câte una pe rând)"
              name="emails"
              hint={
                recipients.from === "admin"
                  ? "Se folosesc adresele de aici. Lăsați gol ca să reveniți la LEAD_NOTIFY_TO."
                  : recipients.from === "env"
                    ? `Acum se folosește LEAD_NOTIFY_TO: ${recipients.to.join(", ")}. Adresele salvate aici au prioritate.`
                    : "Nicio adresă setată. Fără ele nu pleacă nici emailul la cerere nouă, nici rezumatul săptămânal."
              }
            >
              <textarea id="emails" name="emails" rows={3} defaultValue={recipients.from === "admin" ? recipients.to.join("\n") : ""} className={admin.input} placeholder="contact@daiamar.ro" />
            </Field>
          </ActionForm>
        </section>

        <section className={admin.card}>
          <h2 className={admin.h2}>Echipa</h2>
          <ActionForm action={saveTeam} submitLabel="Salvează" className={styles.stack}>
            <Field label="Nume (câte unul pe rând)" name="team" hint="Apar la „Asignat” pe fiecare cerere și ca autor în istoric.">
              <textarea id="team" name="team" rows={3} defaultValue={team.join("\n")} className={admin.input} />
            </Field>
          </ActionForm>
          {team.length > 0 && <AuthorSelect team={team} author={author} action={setAuthor} />}
        </section>

        <section className={admin.card}>
          <h2 className={admin.h2}>Rezumat săptămânal</h2>
          <div className={styles.stack}>
            <p className={admin.muted}>
              În fiecare luni dimineață: cererile din ultimele 7 zile pe canal, clienții câștigați și follow-up-urile restante, trimise la adresele de notificare.
            </p>
            <dl className={styles.status}>
              <div><dt>RESEND_API_KEY</dt><Flag on={Boolean(process.env.RESEND_API_KEY)} yes="setat" no="lipsește" /></div>
              <div><dt>CRON_SECRET</dt><Flag on={Boolean(process.env.CRON_SECRET)} yes="setat" no="lipsește" /></div>
              <div><dt>Destinatari</dt><Flag on={recipients.to.length > 0} yes={recipients.to.join(", ")} no="niciunul" /></div>
            </dl>
            <WeeklyTest />
          </div>
        </section>

        <section className={admin.card}>
          <h2 className={admin.h2}>Parola de admin</h2>
          <ol className={styles.steps}>
            <li>Vercel → proiectul <code>daiamar</code> → Settings → Environment Variables.</li>
            <li>Schimbați <code>ADMIN_PASSWORD</code> (Production și Preview).</li>
            <li>Deployments → Redeploy. Parola nouă merge după redeploy.</li>
            <li>Ca să deconectați pe toată lumea, schimbați și <code>ADMIN_SECRET</code> (<code>openssl rand -hex 32</code>).</li>
          </ol>
          <p className={`${admin.muted} ${styles.spaced}`}>Panoul are o singură parolă comună. Numele din „Echipa” arată doar cine a scris o notă.</p>
        </section>

        <OfferDefaults settings={offerSettings} templates={templates} />

        <section className={`${admin.card} ${admin.span2}`}>
          <h2 className={admin.h2}>Baza de date</h2>
          <dl className={styles.status}>
            <div><dt>Unde se salvează</dt><Flag on={neon} yes="Neon Postgres (DATABASE_URL)" no="Fișier local .data/db.json (doar pentru dezvoltare)" /></div>
            <div><dt>Cereri</dt><dd>{formatNumber(leads.length)}</dd></div>
            <div><dt>Vizite și clicuri</dt><dd>{formatNumber(events.length)}</dd></div>
            <div><dt>Oferte</dt><dd>{formatNumber(offers.length)}</dd></div>
            <div><dt>Abonați newsletter</dt><dd>{formatNumber(subscribers.length)}</dd></div>
            <div><dt>Documente încărcate</dt><Flag on={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} yes="Vercel Blob (BLOB_READ_WRITE_TOKEN)" no="Fișiere locale .data/uploads/ (doar pentru dezvoltare)" /></div>
            <div><dt>Luni cu buget / linkuri salvate</dt><dd>{formatNumber(new Set(spend.map((s) => s.month)).size)} / {formatNumber(links.length)}</dd></div>
            <div><dt>Înregistrări demo</dt><dd>{formatNumber(demo)}</dd></div>
          </dl>
          {demo > 0 && (
            <form action={deleteDemoData} className={admin.demo}>
              <p>Datele demo (generate cu <code>npm run seed</code>) apar în toate rapoartele până le ștergeți.</p>
              <ConfirmButton
                label="Șterge datele demo"
                title="Ștergeți datele demo?"
                text="Se șterg toate cererile, vizitele, bugetele, linkurile și ofertele marcate demo. Datele reale rămân."
                confirmLabel="Șterge"
              />
            </form>
          )}
        </section>
      </div>
    </>
  );
}
