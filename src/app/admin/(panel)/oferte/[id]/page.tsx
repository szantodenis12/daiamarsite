import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, MessageCircle, Trash2, XCircle } from "lucide-react";
import { whatsappNumber } from "@/lib/crm";
import { db } from "@/lib/db";
import { getTemplates, offerUrl } from "@/lib/offer-store";
import { formatLeiExact, offerTotals, shownStatus, validUntil } from "@/lib/offers";
import { getTeam } from "@/lib/settings";
import { company } from "@/lib/site";
import { deleteOffer, markOfferRefused, markOfferSent } from "../../../actions/offers";
import { formatDate, formatShortDate } from "../../../format";
import { ConfirmButton } from "../../../ui/ConfirmButton";
import { CopyButton } from "../../linkuri/QrTools";
import { OfferBuilder } from "../OfferBuilder";
import { OfferStatus } from "../OfferStatus";
import { SendPanel } from "./SendPanel";
import styles from "../offers.module.css";
import admin from "../../../admin.module.css";
import { requireSession } from "../../../session";

export const metadata: Metadata = { title: "Ofertă" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OfferPage({ params }: Props) {
  await requireSession();
  const offerId = Number((await params).id);
  const offer = Number.isInteger(offerId) ? await db().getOffer(offerId) : null;
  if (!offer) notFound();
  const [lead, templates, team] = await Promise.all([offer.leadId ? db().getLead(offer.leadId) : null, getTemplates(), getTeam()]);

  const { doc } = offer;
  const status = shownStatus(offer);
  const totals = offerTotals(doc);
  const url = offerUrl(offer);
  const localUrl = `/oferta/${offer.token}/`;
  const pdf = `/api/admin/offers/${offer.id}/pdf/`;
  const until = formatShortDate(validUntil({ ...offer, sentAt: offer.sentAt ?? new Date().toISOString() }).toISOString());
  const signature = doc.preparedBy || company.name;
  const subject = `Oferta ${offer.number} de la ${company.name}`;
  const body = [
    "Bună ziua,",
    "",
    `Vă trimit atașat oferta ${offer.number}. O puteți vedea și accepta online aici:`,
    url,
    "",
    `Oferta este valabilă până la ${until}. Pentru întrebări, ne puteți suna la ${company.phones[0].label}.`,
    "",
    "Cu stimă,",
    signature,
    company.name,
  ].join("\n");
  const wa = lead?.phone ? whatsappNumber(lead.phone) : null;
  const waText = encodeURIComponent(`Bună ziua, vă trimit oferta ${company.name} ${offer.number}: ${url}`);

  return (
    <>
      <Link href={lead ? `/admin/leads/${lead.id}/` : "/admin/oferte/"} className={admin.back}>
        <ArrowLeft aria-hidden size={16} /> {lead ? lead.name : "Toate ofertele"}
      </Link>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>{offer.number} · {formatDate(offer.createdAt)}{offer.demo ? " · demo" : ""}</p>
          <h1 className={admin.h1}>{doc.clientCompany || doc.clientName}</h1>
          <p className={admin.muted}>
            <OfferStatus status={status} /> {formatLeiExact(totals.netMonthly)}/lună · {formatLeiExact(totals.netOneOff)} unic, fără TVA
          </p>
        </div>
        <div className={styles.buttons}>
          <a href={`${pdf}?download`} className={admin.secondary}><Download aria-hidden size={16} /> Descarcă PDF</a>
          <a href={localUrl} target="_blank" rel="noreferrer" className={admin.secondary}><ExternalLink aria-hidden size={16} /> Deschide online</a>
        </div>
      </div>

      <div className={styles.detail}>
        <div className={styles.stack}>
          <iframe src={pdf} title={`Previzualizare ${offer.number}`} className={styles.preview} />
        </div>

        <div className={styles.stack}>
          <section className={admin.card}>
            <h2 className={admin.h2}>Trimite</h2>
            <SendPanel offerId={offer.id} to={doc.clientEmail} subject={subject} body={body} pdfHref={`${pdf}?download`} />
          </section>

          <section className={admin.card}>
            <h2 className={admin.h2}>Link online</h2>
            <div className={styles.stack}>
              <code className={styles.linkBox}>{url}</code>
              <div className={styles.buttons}>
                <CopyButton text={url} label="Copiază linkul" />
                <a href={wa ? `https://wa.me/${wa}?text=${waText}` : `https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer" className={`${admin.secondary} ${admin.small}`}>
                  <MessageCircle aria-hidden size={14} /> Trimite pe WhatsApp
                </a>
              </div>
              {offer.status === "ciorna" && (
                <form action={markOfferSent} className={styles.stack}>
                  <input type="hidden" name="id" value={offer.id} />
                  <input type="hidden" name="how" value="manual (WhatsApp sau email propriu)" />
                  <p className={admin.muted}>Ați trimis-o pe WhatsApp sau din emailul dumneavoastră? Marcați-o ca trimisă, ca linkul să devină public și valabilitatea să înceapă.</p>
                  <div><button type="submit" className={`${admin.secondary} ${admin.small}`}>Marchează ca trimisă</button></div>
                </form>
              )}
            </div>
          </section>

          <section className={admin.card}>
            <h2 className={admin.h2}>Urmărire</h2>
            <dl className={styles.facts}>
              <div><dt>Trimisă</dt><dd>{offer.sentAt ? formatDate(offer.sentAt) : "încă nu"}</dd></div>
              <div><dt>Valabilă până la</dt><dd>{offer.sentAt ? formatShortDate(validUntil(offer).toISOString()) : `${doc.validDays} zile de la trimitere`}</dd></div>
              <div><dt>Prima deschidere</dt><dd>{offer.firstViewedAt ? formatDate(offer.firstViewedAt) : "-"}</dd></div>
              <div><dt>Deschideri</dt><dd>{offer.viewCount}</dd></div>
              {offer.acceptedAt && <div><dt>Acceptată</dt><dd>{formatDate(offer.acceptedAt)}{offer.acceptedName ? `, de ${offer.acceptedName}` : ""}</dd></div>}
              {offer.acceptedComment && <div><dt>Comentariu</dt><dd>{offer.acceptedComment}</dd></div>}
              {lead && <div><dt>Cererea</dt><dd><Link href={`/admin/leads/${lead.id}/`}>#{lead.id} {lead.name}</Link></dd></div>}
            </dl>
            <div className={`${styles.buttons} ${admin.spacedTop}`}>
              {offer.status !== "acceptata" && offer.status !== "refuzata" && offer.status !== "ciorna" && (
                <form action={markOfferRefused}>
                  <input type="hidden" name="id" value={offer.id} />
                  <ConfirmButton className={`${admin.secondary} ${admin.small}`} label={<><XCircle aria-hidden size={14} /> Refuzată</>} title="Marcați oferta ca refuzată?" text="Linkul online nu mai permite acceptarea. Puteți crea oricând o ofertă nouă." confirmLabel="Marchează refuzată" />
                </form>
              )}
              <form action={deleteOffer}>
                <input type="hidden" name="id" value={offer.id} />
                <ConfirmButton className={`${admin.danger} ${admin.small}`} label={<><Trash2 aria-hidden size={14} /> Șterge</>} title={`Ștergeți oferta ${offer.number}?`} text="Linkul online nu mai funcționează. Istoricul cererii rămâne." confirmLabel="Șterge" />
              </form>
            </div>
          </section>
        </div>
      </div>

      {status !== "acceptata" && (
        <section className={styles.editor}>
          <h2 className={admin.h2}>Modifică oferta</h2>
          <OfferBuilder offerId={offer.id} leadId={offer.leadId} initial={doc} templates={templates} team={team} />
        </section>
      )}
    </>
  );
}
