import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy, Download, FilePlus2, GitMerge, Paperclip, ShieldAlert, Trash2 } from "lucide-react";
import type { Touch } from "@/lib/attribution";
import { classify } from "@/lib/channel";
import { ACTIVITY_LABELS, ACTIVITY_TYPES, LEAD_KIND_LABELS, LOST_LABELS, MANUAL_PLACEMENT, SYSTEM_ACTIVITY_TYPES, type LostReason } from "@/lib/crm";
import { db } from "@/lib/db";
import { findDuplicates } from "@/lib/leads";
import { formatLeiExact, offerTotals, shownStatus } from "@/lib/offers";
import { getTeam } from "@/lib/settings";
import { deleteFile } from "../../../actions/files";
import { addActivity, deleteLead, mergeLead, saveDetails, saveFollowUp, saveStatus } from "../../../actions/leads";
import { formatDate, formatShortDate, formatSize, serviceTitle, STATUS_LABELS } from "../../../format";
import { ActionForm } from "../../../ui/ActionForm";
import { ConfirmButton } from "../../../ui/ConfirmButton";
import { Field } from "../../../ui/Field";
import { QuickActions } from "../../../ui/QuickActions";
import { LeadFields } from "../LeadFields";
import { FollowUpFields } from "./FollowUpFields";
import { StatusFields } from "./StatusFields";
import { OfferStatus } from "../../oferte/OfferStatus";
import { Timeline } from "./Timeline";
import styles from "./lead.module.css";
import admin from "../../../admin.module.css";
import { requireSession } from "../../../session";

export const metadata: Metadata = { title: "Cerere" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function TouchDetails({ title, touch }: { title: string; touch: Touch | null }) {
  const { channel, detail } = classify(touch);
  const rows: [string, string | undefined][] = touch
    ? [
        ["Canal", detail ? `${channel} (${detail})` : channel],
        ["Sursă / mediu", touch.utm_source ? `${touch.utm_source} / ${touch.utm_medium ?? "-"}` : undefined],
        ["Campanie", touch.utm_campaign],
        ["Cuvânt cheie", touch.utm_term],
        ["Conținut", touch.utm_content],
        ["Click ID", [touch.gclid && "gclid", touch.gbraid && "gbraid", touch.wbraid && "wbraid", touch.fbclid && "fbclid", touch.msclkid && "msclkid", touch.li_fat_id && "li_fat_id"].filter(Boolean).join(", ") || undefined],
        ["Venit de pe", touch.referrer],
        ["Pagina de intrare", touch.landing],
        ["Data", formatDate(touch.at)],
      ]
    : [["Canal", "Direct (fără date)"]];

  return (
    <section className={styles.step}>
      <h3 className={styles.stepTitle}>{title}</h3>
      <dl className={admin.dl}>
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </section>
  );
}

export default async function LeadPage({ params }: Props) {
  await requireSession();
  const id = Number((await params).id);
  const lead = Number.isInteger(id) ? await db().getLead(id) : null;
  if (!lead) notFound();

  const [activities, all, team, allOffers, files] = await Promise.all([db().activities(lead.id), db().leadsSince(new Date(0)), getTeam(), db().offers(), db().files(lead.id)]);
  const offers = allOffers.filter((o) => o.leadId === lead.id);
  const duplicateIds = findDuplicates(all).get(lead.id) ?? [];
  const duplicates = all.filter((l) => duplicateIds.includes(l.id));
  const manual = lead.placement === MANUAL_PLACEMENT;

  return (
    <>
      <Link href="/admin/leads/" className={admin.back}><ArrowLeft aria-hidden size={16} /> Toate cererile</Link>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>
            #{lead.id} · {formatDate(lead.createdAt)} · {lead.channel}
            {lead.referredBy && ` (de la ${lead.referredBy})`}
            {lead.demo && " · demo"}
          </p>
          <h1 className={admin.h1}>{lead.name}</h1>
          <div className={styles.headMeta}>
            <span className={admin.status} data-status={lead.status}>{STATUS_LABELS[lead.status]}</span>
            {lead.kind !== "cerere" && <span className={admin.chip} data-tone="brand">{LEAD_KIND_LABELS[lead.kind]}</span>}
            {lead.suspect && <span className={admin.chip} data-tone="warn" title="Formularul a fost trimis mai repede decât îl poate completa un om. Cererea nu intră în rapoarte și conversii."><ShieldAlert aria-hidden size={12} /> Trimitere suspectă</span>}
            {lead.status === "pierdut" && lead.lostReason && <span className={admin.chip}>{LOST_LABELS[lead.lostReason as LostReason] ?? lead.lostReason}</span>}
            {lead.company && <span className={admin.muted}>{lead.company}</span>}
            {lead.assignee && <span className={admin.chip} data-tone="brand">{lead.assignee}</span>}
          </div>
        </div>
        <div className={styles.headActions}>
          <QuickActions leadId={lead.id} phone={lead.phone} email={lead.email} service={lead.service ? serviceTitle(lead.service) : null} />
          <Link href={`/admin/oferte/noua/?lead=${lead.id}`} className={admin.primary}><FilePlus2 aria-hidden size={16} /> Creează ofertă</Link>
        </div>
      </div>

      {duplicates.length > 0 && (
        <section className={styles.duplicates}>
          <h2 className={admin.h2}><Copy aria-hidden size={16} /> Posibil duplicat</h2>
          <p className={admin.muted}>Același telefon sau email ca:</p>
          <ul>
            {duplicates.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/leads/${d.id}/`}>#{d.id} {d.name}</Link>
                <span className={admin.muted}>{d.channel} · {formatShortDate(d.createdAt)} · {STATUS_LABELS[d.status]}</span>
                <form action={mergeLead}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="other" value={d.id} />
                  <ConfirmButton
                    className={`${admin.secondary} ${admin.small}`}
                    label={<><GitMerge aria-hidden size={14} /> Unește</>}
                    title={`Uniți #${lead.id} cu #${d.id}?`}
                    text={`Rămâne cererea mai veche (#${lead.createdAt <= d.createdAt ? lead.id : d.id}). Notele, istoricul, documentele, ofertele și câmpurile completate se mută pe ea, iar cealaltă se șterge.`}
                    confirmLabel="Unește"
                  />
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.layout}>
        <div className={styles.column}>
          <section className={admin.card}>
            <h2 className={admin.h2}>Istoric</h2>
            <ActionForm action={addActivity} submitLabel="Adaugă" className={styles.activityForm} resetOnSuccess>
              <input type="hidden" name="id" value={lead.id} />
              <div className={styles.activityTypes} role="radiogroup" aria-label="Tip">
                {ACTIVITY_TYPES.filter((t) => !SYSTEM_ACTIVITY_TYPES.includes(t)).map((t, i) => (
                  <label key={t}>
                    <input type="radio" name="type" value={t} defaultChecked={i === 0} />
                    {ACTIVITY_LABELS[t]}
                  </label>
                ))}
              </div>
              <Field label="Ce s-a întâmplat" name="text">
                <textarea id="text" name="text" rows={2} className={admin.input} placeholder="ex. Am vorbit 10 minute, vrea ofertă pentru contabilitate și salarizare (4 angajați)." />
              </Field>
            </ActionForm>
            <Timeline activities={activities} createdAt={lead.createdAt} />
          </section>

          {offers.length > 0 && (
            <section className={admin.card}>
              <h2 className={admin.h2}>Oferte</h2>
              <ul className={styles.offers}>
                {offers.map((o) => {
                  const totals = offerTotals(o.doc);
                  return (
                    <li key={o.id}>
                      <Link href={`/admin/oferte/${o.id}/`}>{o.number}</Link>
                      <OfferStatus status={shownStatus(o)} />
                      <span className={admin.muted}>{formatLeiExact(totals.netMonthly)}/lună · {formatLeiExact(totals.netOneOff)} unic</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {files.length > 0 && (
            <section className={admin.card}>
              <h2 className={admin.h2}><Paperclip aria-hidden size={16} /> Documente</h2>
              <ul className={styles.files}>
                {files.map((f) => (
                  <li key={f.id}>
                    <a href={`/api/admin/files/${f.id}/`}><Download aria-hidden size={14} /> {f.name}</a>
                    <span className={admin.muted}>{formatSize(f.size)} · {formatShortDate(f.createdAt)}</span>
                    <form action={deleteFile}>
                      <input type="hidden" name="id" value={f.id} />
                      <ConfirmButton className={`${admin.danger} ${admin.small}`} label="Șterge" title={`Ștergeți ${f.name}?`} text="Fișierul se șterge definitiv din stocare." confirmLabel="Șterge" />
                    </form>
                  </li>
                ))}
              </ul>
              <p className={`${admin.muted} ${styles.spaced}`}>Fișierele se descarcă doar de aici, după autentificare. Nu există linkuri publice.</p>
            </section>
          )}

          <section className={admin.card}>
            <h2 className={admin.h2}>Cererea</h2>
            {lead.message ? <p className={styles.message}>{lead.message}</p> : <p className={admin.muted}>Fără mesaj.</p>}
            <dl className={`${admin.dl} ${styles.spaced}`}>
              <div><dt>Serviciu</dt><dd>{serviceTitle(lead.service)}</dd></div>
              {lead.phone && <div><dt>Telefon</dt><dd>{lead.phone}</dd></div>}
              {lead.email && <div><dt>Email</dt><dd>{lead.email}</dd></div>}
              {!manual && <div><dt>Dispozitiv</dt><dd>{lead.device || "-"}</dd></div>}
            </dl>
          </section>
        </div>

        <div className={styles.column}>
          <section className={admin.card}>
            <h2 className={admin.h2}>Status</h2>
            <ActionForm action={saveStatus} submitLabel="Salvează" className={styles.stack}>
              <input type="hidden" name="id" value={lead.id} />
              <StatusFields status={lead.status} lostReason={lead.lostReason} />
              <Field label="Note interne" name="notes">
                <textarea id="notes" name="notes" rows={3} defaultValue={lead.notes} className={admin.input} />
              </Field>
            </ActionForm>
          </section>

          <section className={admin.card}>
            <h2 className={admin.h2}>Următorul pas</h2>
            <ActionForm action={saveFollowUp} submitLabel="Programează" className={styles.stack}>
              <input type="hidden" name="id" value={lead.id} />
              <FollowUpFields date={lead.nextActionAt} text={lead.nextAction} />
            </ActionForm>
          </section>

          <section className={admin.card}>
            <h2 className={admin.h2}>Detalii și valoare</h2>
            <ActionForm action={saveDetails} submitLabel="Salvează" className={styles.stack}>
              <input type="hidden" name="id" value={lead.id} />
              <div className={styles.detailGrid}>
                <LeadFields values={lead} team={team} />
                {lead.channel === "Recomandare" && (
                  <Field label="Recomandat de" name="referredBy">
                    <input id="referredBy" name="referredBy" defaultValue={lead.referredBy ?? ""} className={admin.input} />
                  </Field>
                )}
              </div>
            </ActionForm>
            <p className={`${admin.muted} ${styles.spaced}`}>Ultima modificare: {formatDate(lead.updatedAt)}</p>
          </section>
        </div>
      </div>

      {!manual && (
        <section className={`${admin.card} ${styles.journeyCard}`}>
          <h2 className={admin.h2}>Drumul până la cerere</h2>
          <div className={styles.journey}>
            <TouchDetails title="1. Prima vizită" touch={lead.ft} />
            <TouchDetails title="2. Ultima vizită" touch={lead.lt} />
            <section className={styles.step}>
              <h3 className={styles.stepTitle}>3. Cererea</h3>
              <dl className={admin.dl}>
                <div><dt>Pagina</dt><dd>{lead.page}</dd></div>
                <div><dt>Formular</dt><dd>{lead.placement}</dd></div>
                <div><dt>Data</dt><dd>{formatDate(lead.createdAt)}</dd></div>
              </dl>
            </section>
          </div>
        </section>
      )}

      <form action={deleteLead} className={styles.dangerZone}>
        <input type="hidden" name="id" value={lead.id} />
        <p className={admin.muted}>Spam sau test? Ștergerea nu se poate anula.</p>
        <ConfirmButton
          label={<><Trash2 aria-hidden size={14} /> Șterge cererea</>}
          title={`Ștergeți cererea #${lead.id}?`}
          text={`${lead.name}, tot istoricul și documentele încărcate se șterg definitiv.`}
          confirmLabel="Șterge"
        />
      </form>
    </>
  );
}
