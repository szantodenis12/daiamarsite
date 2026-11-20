"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { formatLeiExact, OFFER_UNITS, offerTotals, VAT_MODES, type OfferDoc, type OfferItem, type OfferTemplate, type OfferUnit, type VatMode } from "@/lib/offers";
import { services } from "@/lib/site";
import { saveOffer, saveTemplate } from "../../actions/offers";
import styles from "./offers.module.css";
import admin from "../../admin.module.css";

type Props = { offerId: number | null; leadId: number | null; initial: OfferDoc; templates: OfferTemplate[]; team: string[] };

const blankItem = (): OfferItem => ({ service: null, title: "", description: "", quantity: 1, unit: "lună", price: null, recurring: true });
const serviceTitle = (slug: string | null) => services.find((s) => s.slug === slug)?.title ?? "";
// Romanian format: "1.250,50". Dots are thousands separators only when the whole number before the comma is grouped in
// threes ("1.250", "12.345.678"); otherwise a single dot is a decimal point, so "0.125" stays 0,125.
const numberOrNull = (value: string) => {
  const [whole, fraction, extra] = value.replace(/\s/g, "").split(",");
  if (extra !== undefined || whole === "") return null;
  const digits = /^[1-9]\d{0,2}(\.\d{3})+$/.test(whole) ? whole.replace(/\./g, "") : whole;
  const number = Number(fraction === undefined ? digits : `${digits}.${fraction}`);
  return Number.isNaN(number) ? null : number;
};

export function OfferBuilder({ offerId, leadId, initial, templates, team }: Props) {
  const router = useRouter();
  const [doc, setDoc] = useState<OfferDoc>(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [templateName, setTemplateName] = useState("");
  const totals = offerTotals(doc);
  // Number fields are uncontrolled (so "1," can be typed), which needs a stable key per row.
  const nextKey = useRef(initial.items.length);
  const [keys, setKeys] = useState(() => initial.items.map((_, i) => i));
  const replaceItems = (items: OfferItem[]) => {
    setKeys(items.map(() => nextKey.current++));
    set("items", items);
  };

  const set = <K extends keyof OfferDoc>(key: K, value: OfferDoc[K]) => setDoc((d) => ({ ...d, [key]: value }));
  const setItem = (index: number, patch: Partial<OfferItem>) => set("items", doc.items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const result = await saveOffer({ id: offerId, leadId, doc });
      if (result.error) return setMessage({ tone: "error", text: result.error });
      if (!offerId && result.id) router.push(`/admin/oferte/${result.id}/`);
      else {
        setMessage({ tone: "ok", text: "Salvat" });
        router.refresh();
      }
    });

  const saveAsTemplate = () =>
    startTransition(async () => {
      const result = await saveTemplate(templateName, doc.items);
      setMessage(result.error ? { tone: "error", text: result.error } : { tone: "ok", text: `Șablonul „${templateName}” a fost salvat.` });
      if (!result.error) setTemplateName("");
    });

  return (
    <div className={styles.builder}>
      <div className={styles.builderMain}>
        {templates.length > 0 && (
          <div className={styles.templates}>
            <span className={admin.label}>Pornește de la un șablon</span>
            <div className={styles.templateButtons}>
              {templates.map((t) => (
                <button key={t.key} type="button" className={`${admin.secondary} ${admin.small}`} onClick={() => replaceItems(t.items.map((i) => ({ ...i })))}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <fieldset className={styles.group}>
          <legend>Client</legend>
          <div className={admin.formGrid}>
            <label className={admin.field}>
              <span className={admin.label}>Nume</span>
              <input className={admin.input} value={doc.clientName} onChange={(e) => set("clientName", e.target.value)} />
            </label>
            <label className={admin.field}>
              <span className={admin.label}>Firmă</span>
              <input className={admin.input} value={doc.clientCompany} onChange={(e) => set("clientCompany", e.target.value)} />
            </label>
            <label className={`${admin.field} ${admin.full}`}>
              <span className={admin.label}>Email</span>
              <input className={admin.input} type="email" value={doc.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} />
            </label>
            <label className={`${admin.field} ${admin.full}`}>
              <span className={admin.label}>Text de început</span>
              <textarea className={admin.input} rows={3} value={doc.intro} onChange={(e) => set("intro", e.target.value)} placeholder="Textul implicit se setează în Setări → Oferte." />
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Servicii</legend>
          <ol className={styles.items}>
            {doc.items.map((item, i) => (
              <li key={keys[i]} className={styles.item}>
                <div className={styles.itemGrid}>
                  <label className={`${admin.field} ${styles.wide}`}>
                    <span className={admin.label}>Serviciu</span>
                    <select
                      className={admin.input}
                      value={item.service ?? ""}
                      onChange={(e) => {
                        const service = e.target.value || null;
                        const keepTitle = item.title && item.title !== serviceTitle(item.service);
                        setItem(i, { service, title: keepTitle ? item.title : serviceTitle(service) });
                      }}
                    >
                      <option value="">Alt serviciu (text liber)</option>
                      {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
                    </select>
                  </label>
                  <label className={`${admin.field} ${styles.wide}`}>
                    <span className={admin.label}>Denumire pe ofertă</span>
                    <input className={admin.input} value={item.title} onChange={(e) => setItem(i, { title: e.target.value })} />
                  </label>
                  <label className={`${admin.field} ${styles.full}`}>
                    <span className={admin.label}>Descriere</span>
                    <textarea className={admin.input} rows={2} value={item.description} onChange={(e) => setItem(i, { description: e.target.value })} />
                  </label>
                  <label className={admin.field}>
                    <span className={admin.label}>Cantitate</span>
                    <input className={admin.input} inputMode="decimal" defaultValue={item.quantity} onChange={(e) => setItem(i, { quantity: numberOrNull(e.target.value) ?? 0 })} />
                  </label>
                  <label className={admin.field}>
                    <span className={admin.label}>Unitate</span>
                    <select className={admin.input} value={item.unit} onChange={(e) => setItem(i, { unit: e.target.value as OfferUnit })}>
                      {OFFER_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </label>
                  <label className={admin.field}>
                    <span className={admin.label}>Preț unitar (lei)</span>
                    <input className={admin.input} inputMode="decimal" defaultValue={item.price ?? ""} placeholder="de completat" onChange={(e) => setItem(i, { price: numberOrNull(e.target.value) })} />
                  </label>
                  <div className={admin.field}>
                    <span className={admin.label}>Facturare</span>
                    <div className={styles.toggle} role="group" aria-label="Facturare">
                      <button type="button" aria-pressed={item.recurring} onClick={() => setItem(i, { recurring: true, unit: item.unit === "serviciu" ? "lună" : item.unit })}>Lunar</button>
                      <button type="button" aria-pressed={!item.recurring} onClick={() => setItem(i, { recurring: false, unit: item.unit === "lună" ? "serviciu" : item.unit })}>O dată</button>
                    </div>
                  </div>
                </div>
                <div className={styles.itemFoot}>
                  <span className={admin.muted}>{item.price === null ? "Preț necompletat" : formatLeiExact(item.price * item.quantity)}{item.recurring ? " / lună" : ""}</span>
                  <button type="button" className={`${admin.ghost} ${admin.small}`} onClick={() => {
                      setKeys(keys.filter((_, j) => j !== i));
                      set("items", doc.items.filter((_, j) => j !== i));
                    }} aria-label={`Șterge rândul ${i + 1}`}>
                    <Trash2 aria-hidden size={14} /> Șterge
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className={admin.secondary} onClick={() => {
            setKeys([...keys, nextKey.current++]);
            set("items", [...doc.items, blankItem()]);
          }}><Plus aria-hidden size={16} /> Adaugă rând</button>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Condiții</legend>
          <div className={admin.formGrid}>
            <label className={admin.field}>
              <span className={admin.label}>Discount (%)</span>
              <input className={admin.input} inputMode="decimal" defaultValue={doc.discount || ""} placeholder="0" onChange={(e) => set("discount", numberOrNull(e.target.value) ?? 0)} />
            </label>
            <label className={admin.field}>
              <span className={admin.label}>Valabilitate (zile)</span>
              <input className={admin.input} inputMode="numeric" defaultValue={doc.validDays} onChange={(e) => set("validDays", numberOrNull(e.target.value) ?? 30)} />
            </label>
            <label className={admin.field}>
              <span className={admin.label}>TVA</span>
              <select className={admin.input} value={doc.vatMode} onChange={(e) => set("vatMode", e.target.value as VatMode)}>
                {(Object.keys(VAT_MODES) as VatMode[]).map((m) => <option key={m} value={m}>{VAT_MODES[m]}</option>)}
              </select>
            </label>
            <label className={admin.field}>
              <span className={admin.label}>Cota TVA (%)</span>
              <input className={admin.input} inputMode="decimal" defaultValue={doc.vatRate} disabled={doc.vatMode === "fara"} onChange={(e) => set("vatRate", numberOrNull(e.target.value) ?? 0)} />
            </label>
            <label className={`${admin.field} ${admin.full}`}>
              <span className={admin.label}>Condiții de plată</span>
              <textarea className={admin.input} rows={2} value={doc.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} placeholder="de completat (ex. termenul de plată al facturii)" />
            </label>
            <label className={`${admin.field} ${admin.full}`}>
              <span className={admin.label}>Observații</span>
              <textarea className={admin.input} rows={2} value={doc.notes} onChange={(e) => set("notes", e.target.value)} />
            </label>
            <label className={admin.field}>
              <span className={admin.label}>Întocmită de</span>
              <select className={admin.input} value={doc.preparedBy} onChange={(e) => set("preparedBy", e.target.value)}>
                <option value="">Daiamar</option>
                {team.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
          </div>
        </fieldset>
      </div>

      <aside className={styles.summary} aria-label="Total">
        <h2 className={admin.h2}>Total</h2>
        <dl>
          <div><dt>Lunar, fără TVA</dt><dd>{formatLeiExact(totals.netMonthly)}</dd></div>
          <div><dt>O singură dată, fără TVA</dt><dd>{formatLeiExact(totals.netOneOff)}</dd></div>
          {doc.vatMode !== "fara" && <div><dt>TVA ({doc.vatRate}%)</dt><dd>{formatLeiExact(totals.vatMonthly + totals.vatOneOff)}</dd></div>}
          <div className={styles.grand}><dt>Lunar, de plată</dt><dd>{formatLeiExact(totals.totalMonthly)}</dd></div>
          <div className={styles.grand}><dt>O dată, de plată</dt><dd>{formatLeiExact(totals.totalOneOff)}</dd></div>
        </dl>
        {totals.missingPrices > 0 && <p className={admin.notice} data-tone="warn">{totals.missingPrices} {totals.missingPrices === 1 ? "rând fără preț" : "rânduri fără preț"}.</p>}
        <button type="button" className={admin.primary} onClick={save} disabled={pending}>
          {pending ? <LoaderCircle aria-hidden size={16} className={admin.spin} /> : <Check aria-hidden size={16} />} {offerId ? "Salvează oferta" : "Creează oferta"}
        </button>
        {message && <p className={message.tone === "ok" ? admin.saved : admin.fieldError} role="status">{message.text}</p>}
        <div className={styles.saveTemplate}>
          <input className={admin.input} value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Nume șablon nou" aria-label="Nume șablon nou" />
          <button type="button" className={`${admin.secondary} ${admin.small}`} onClick={saveAsTemplate} disabled={pending || !templateName.trim()}>Salvează ca șablon</button>
        </div>
      </aside>
    </div>
  );
}
