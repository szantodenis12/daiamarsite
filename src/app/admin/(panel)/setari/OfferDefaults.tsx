import { Trash2 } from "lucide-react";
import type { OfferSettings, OfferTemplate } from "@/lib/offers";
import { deleteTemplate, saveOfferDefaults } from "../../actions/offers";
import { ActionForm } from "../../ui/ActionForm";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { Field } from "../../ui/Field";
import styles from "./settings.module.css";
import admin from "../../admin.module.css";

const TEXT_FIELDS: { name: keyof OfferSettings; label: string; placeholder: string; rows?: number; hint?: string }[] = [
  { name: "intro", label: "Text de început (implicit)", placeholder: "de completat: primul paragraf al fiecărei oferte", rows: 3 },
  { name: "paymentTerms", label: "Condiții de plată (implicit)", placeholder: "de completat: termen de plată, mod de plată", rows: 2 },
  { name: "terms", label: "Condiții generale", placeholder: "de completat: ce include și ce nu include oferta", rows: 3, hint: "Apar pe fiecare PDF, sub totaluri." },
  { name: "legalName", label: "Denumirea firmei", placeholder: "de completat: denumirea din registrul comerțului" },
  { name: "cui", label: "CUI", placeholder: "de completat" },
  { name: "regCom", label: "Nr. Reg. Com.", placeholder: "de completat" },
  { name: "bank", label: "Banca", placeholder: "de completat" },
  { name: "iban", label: "IBAN", placeholder: "de completat" },
  { name: "replyTo", label: "Răspunsurile la email ajung la", placeholder: "ex. contact@daiamar.ro", hint: "Reply-to pentru ofertele trimise din panou." },
  { name: "vatRate", label: "Cota TVA implicită (%)", placeholder: "21" },
];

export function OfferDefaults({ settings, templates }: { settings: OfferSettings; templates: OfferTemplate[] }) {
  return (
    <>
      <section className={`${admin.card} ${admin.span2}`}>
        <h2 className={admin.h2}>Oferte: texte și date firmă</h2>
        <ActionForm action={saveOfferDefaults} submitLabel="Salvează" className={styles.stack}>
          <div className={admin.formGrid}>
            {TEXT_FIELDS.map((f) => (
              <Field key={f.name} label={f.label} name={f.name} hint={f.hint} className={f.rows ? admin.full : undefined}>
                {f.rows ? (
                  <textarea id={f.name} name={f.name} rows={f.rows} defaultValue={String(settings[f.name])} placeholder={f.placeholder} className={admin.input} />
                ) : (
                  <input id={f.name} name={f.name} defaultValue={String(settings[f.name])} placeholder={f.placeholder} className={admin.input} />
                )}
              </Field>
            ))}
          </div>
        </ActionForm>
      </section>

      <section className={`${admin.card} ${admin.span2}`}>
        <h2 className={admin.h2}>Șabloane de ofertă</h2>
        <ul className={styles.templates}>
          {templates.map((t) => (
            <li key={t.key}>
              <div>
                <strong>{t.name}</strong>
                <span className={admin.muted}>{t.items.map((i) => i.title).join(" · ")}</span>
              </div>
              <form action={deleteTemplate}>
                <input type="hidden" name="key" value={t.key} />
                <ConfirmButton className={`${admin.ghost} ${admin.small}`} label={<><Trash2 aria-hidden size={14} /> Șterge</>} title={`Ștergeți șablonul „${t.name}”?`} text="Ofertele făcute deja din el rămân neschimbate." confirmLabel="Șterge" />
              </form>
            </li>
          ))}
        </ul>
        <p className={admin.footnote}>Șablon nou: în editorul de ofertă, „Salvează ca șablon”. Șabloanele pornesc fără prețuri; prețurile se completează pe fiecare ofertă.</p>
      </section>
    </>
  );
}
