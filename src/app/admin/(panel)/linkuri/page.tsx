import type { Metadata } from "next";
import { Link2, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteLink, saveLink } from "../../actions/links";
import { formatNumber, formatShortDate } from "../../format";
import { campaignUrl } from "../../links";
import { linkStats } from "../../reports";
import { countable } from "../../stats";
import { ActionForm } from "../../ui/ActionForm";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { EmptyState } from "../../ui/EmptyState";
import { LinkBuilder } from "./LinkBuilder";
import { CopyButton, QrDownloads } from "./QrTools";
import styles from "./links.module.css";
import admin from "../../admin.module.css";
import { requireSession } from "../../session";

export const metadata: Metadata = { title: "Linkuri de campanie" };
export const dynamic = "force-dynamic";

export default async function LinksPage() {
  await requireSession();
  const [links, allLeads, events] = await Promise.all([db().links(), db().leadsSince(new Date(0)), db().eventsSince(new Date(0))]);
  const leads = countable(allLeads);

  return (
    <>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>Link cu sursă + cod QR pentru flyere, cărți de vizită, reclame</p>
          <h1 className={admin.h1}>Linkuri de campanie</h1>
        </div>
      </div>

      <div className={admin.cards}>
        <section className={`${admin.card} ${admin.span2}`}>
          <h2 className={admin.h2}>Link nou</h2>
          <ActionForm action={saveLink} submitLabel="Salvează în listă">
            <LinkBuilder />
          </ActionForm>
          <p className={admin.footnote}>
            Pentru Google Ads nu e nevoie de link: auto-tagging-ul (gclid) e suficient. Testați codul QR cu telefonul înainte de tipărire.
          </p>
        </section>

        <section className={`${admin.card} ${admin.span2}`}>
          <h2 className={admin.h2}>Linkuri salvate <small>vizite și cereri de la fiecare</small></h2>
          {links.length ? (
            <ul className={styles.saved}>
              {links.map((link) => {
                const url = campaignUrl(link);
                const stats = linkStats(link, leads, events);
                return (
                  <li key={link.id}>
                    <div className={styles.savedHead}>
                      <strong>{link.label}</strong>
                      <span className={styles.stats}>
                        <span><b>{formatNumber(stats.visits)}</b> vizite</span>
                        <span><b>{formatNumber(stats.leads)}</b> cereri</span>
                        <span>din {formatShortDate(link.createdAt)}</span>
                      </span>
                    </div>
                    <code className={styles.savedUrl}>{url}</code>
                    <div className={styles.savedActions}>
                      <CopyButton text={url} />
                      <QrDownloads url={url} name={link.label} />
                      <form action={deleteLink}>
                        <input type="hidden" name="id" value={link.id} />
                        <ConfirmButton
                          className={`${admin.ghost} ${admin.small}`}
                          label={<><Trash2 aria-hidden size={14} /> Șterge</>}
                          title="Ștergeți linkul din listă?"
                          text="Linkul tipărit continuă să funcționeze și vizitele se numără în continuare pe canal. Dispare doar din această listă."
                          confirmLabel="Șterge"
                        />
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={Link2} title="Niciun link salvat" text="Creați primul link mai sus, de exemplu pentru flyerul ONRC." />
          )}
        </section>
      </div>
    </>
  );
}
