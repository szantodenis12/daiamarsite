import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Download, Mail, Phone } from "lucide-react";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { isDemo } from "@/lib/demo";
import { db } from "@/lib/db";
import { recordView } from "@/lib/offer-store";
import { formatLeiExact, offerTotals, shownStatus, validUntil, type OfferItem } from "@/lib/offers";
import { company } from "@/lib/site";
import Logo from "@/components/Logo";
import { AcceptForm } from "./AcceptForm";
import styles from "./offer.module.css";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = { title: "Ofertă", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Link previews (WhatsApp, email scanners) fetch the page too; they must not count as the client opening it.
const BOT = /bot|crawl|spider|preview|whatsapp|facebookexternalhit|slack|telegram|discord|skype|outlook|google/i;

const date = (value: Date | string) => new Intl.DateTimeFormat("ro-RO", { timeZone: "Europe/Bucharest", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));

function Items({ title, items }: { title: string; items: OfferItem[] }) {
  if (!items.length) return null;
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <ul className={styles.items}>
        {items.map((item, i) => (
          <li key={i}>
            <div>
              <strong>{item.title}</strong>
              {item.description && <p>{item.description}</p>}
            </div>
            <span className={styles.qty}>{item.quantity} × {item.price === null ? "de completat" : formatLeiExact(item.price)} / {item.unit}</span>
            <span className={styles.value}>{item.price === null ? "-" : formatLeiExact(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Props = { params: Promise<{ token: string }> };

export default async function OnlineOffer({ params }: Props) {
  const { token } = await params;
  const offer = await db().offerByToken(token);
  const admin = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!offer || (offer.status === "ciorna" && !admin)) notFound();

  const agent = (await headers()).get("user-agent") ?? "";
  if (!admin && !isDemo() && !BOT.test(agent)) await recordView(offer);

  const { doc } = offer;
  const totals = offerTotals(doc);
  const status = shownStatus(offer);
  const vat = doc.vatMode === "plus" ? ` + TVA ${doc.vatRate}%` : doc.vatMode === "inclus" ? " cu TVA inclus" : "";

  return (
    <div className={styles.page}>
      <main className={styles.sheet}>
        <header className={styles.head}>
          <Logo width={196} alt={company.name} priority />
          <div className={styles.meta}>
            <span>Ofertă</span>
            <strong>{offer.number}</strong>
            <span>{date(offer.sentAt ?? offer.createdAt)}</span>
          </div>
        </header>

        {admin && offer.status === "ciorna" && <p className={styles.banner}>Previzualizare: oferta este încă ciornă și nu se vede public.</p>}
        {status === "acceptata" && <p className={styles.bannerOk}>Oferta a fost acceptată{offer.acceptedAt ? ` pe ${date(offer.acceptedAt)}` : ""}. Mulțumim!</p>}
        {status === "expirata" && <p className={styles.banner}>Oferta a expirat pe {date(validUntil(offer))}. Sunați-ne pentru o ofertă actualizată.</p>}
        {status === "refuzata" && <p className={styles.banner}>Această ofertă nu mai este activă.</p>}

        <h1 className={styles.title}>Ofertă pentru {doc.clientCompany || doc.clientName}</h1>
        {doc.intro && <p className={styles.intro}>{doc.intro}</p>}

        <Items title="Servicii lunare" items={doc.items.filter((i) => i.recurring)} />
        <Items title="Servicii o singură dată" items={doc.items.filter((i) => !i.recurring)} />

        <section className={styles.totals}>
          {totals.monthly > 0 && (
            <div>
              <span>Total lunar{vat}</span>
              <strong>{formatLeiExact(doc.vatMode === "plus" ? totals.netMonthly : totals.totalMonthly)} / lună</strong>
              {doc.discount > 0 && <small>după discount de {doc.discount}%</small>}
            </div>
          )}
          {totals.oneOff > 0 && (
            <div>
              <span>O singură dată{vat}</span>
              <strong>{formatLeiExact(doc.vatMode === "plus" ? totals.netOneOff : totals.totalOneOff)}</strong>
              {doc.discount > 0 && <small>după discount de {doc.discount}%</small>}
            </div>
          )}
        </section>

        <p className={styles.validity}>Valabilă până la {date(validUntil(offer))}.</p>
        {doc.paymentTerms && <p className={styles.note}><strong>Condiții de plată.</strong> {doc.paymentTerms}</p>}
        {doc.notes && <p className={styles.note}>{doc.notes}</p>}
        {doc.preparedBy && <p className={styles.note}>Întocmită de {doc.preparedBy}.</p>}

        <div className={styles.actions}>
          <a href={`/oferta/${token}/pdf/`} className={styles.secondary}><Download aria-hidden size={18} /> Descarcă PDF</a>
        </div>

        {(status === "trimisa" || status === "vazuta") && (
          <section className={styles.acceptBox}>
            <h2>Sunteți de acord cu oferta?</h2>
            <p>Apăsați „Accept oferta” și vă contactăm pentru contract și documente.</p>
            <AcceptForm token={token} />
          </section>
        )}

        <footer className={styles.footer}>
          <span>{company.name} · {company.address}</span>
          {company.phones.map((p) => <TrackedLink key={p.href} kind="phone" href={p.href} placement="oferta"><Phone aria-hidden size={14} /> {p.label}</TrackedLink>)}
          <TrackedLink kind="email" href={`mailto:${company.email}`} placement="oferta"><Mail aria-hidden size={14} /> {company.email}</TrackedLink>
        </footer>
      </main>
    </div>
  );
}
