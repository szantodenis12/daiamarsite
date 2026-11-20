"use client";

import { useMemo, useState } from "react";
import { qrMatrix, qrPath } from "@/lib/qr";
import { campaignUrl, LINK_PAGES, LINK_PRESETS, type LinkFields } from "../../links";
import { Field } from "../../ui/Field";
import { CopyButton, QrDownloads } from "./QrTools";
import styles from "./links.module.css";
import admin from "../../admin.module.css";

const UTM_FIELDS: { key: Exclude<keyof LinkFields, "page">; label: string; hint: string }[] = [
  { key: "source", label: "Sursă (utm_source)", hint: "De unde vine: onrc, google, facebook" },
  { key: "medium", label: "Mediu (utm_medium)", hint: "Tipul: print, cpc, paid_social, email" },
  { key: "campaign", label: "Campanie (utm_campaign)", hint: "Numele campaniei: firme-noi" },
  { key: "content", label: "Variantă (utm_content)", hint: "Opțional: flyer-a5, roland" },
];

const slug = (value: string) => value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "");

/** Fields of the "new link" form, with a live URL and QR preview. Lives inside an ActionForm. */
export function LinkBuilder() {
  const [label, setLabel] = useState(LINK_PRESETS[0].label);
  const [fields, setFields] = useState<LinkFields>({ ...LINK_PRESETS[0].fields, content: "" });
  const ready = Boolean(fields.source && fields.medium && fields.campaign);
  const url = campaignUrl(fields);
  const qr = useMemo(() => (ready ? qrPath(qrMatrix(url)) : null), [ready, url]);

  return (
    <div className={styles.builder}>
      <div className={styles.fields}>
        <div className={styles.presets} role="group" aria-label="Șabloane">
          {LINK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`${admin.secondary} ${admin.small}`}
              onClick={() => {
                setLabel(preset.label);
                setFields({ ...preset.fields, content: "" });
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className={admin.formGrid}>
          <Field label="Nume (doar pentru listă)" name="label" className={admin.full}>
            <input id="label" name="label" value={label} onChange={(e) => setLabel(e.target.value)} className={admin.input} />
          </Field>
          <Field label="Pagina" name="page" className={admin.full}>
            <select id="page" name="page" value={fields.page} onChange={(e) => setFields({ ...fields, page: e.target.value })} className={admin.input}>
              {LINK_PAGES.map((p) => <option key={p.path} value={p.path}>{p.label} ({p.path})</option>)}
            </select>
          </Field>
          {UTM_FIELDS.map(({ key, label: fieldLabel, hint }) => (
            <Field key={key} label={fieldLabel} name={key} hint={hint}>
              <input id={key} name={key} value={fields[key]} onChange={(e) => setFields({ ...fields, [key]: slug(e.target.value) })} className={admin.input} autoComplete="off" />
            </Field>
          ))}
        </div>
      </div>

      <aside className={styles.preview} aria-label="Previzualizare">
        {qr ? (
          <svg viewBox={`0 0 ${qr.size} ${qr.size}`} className={styles.qr} role="img" aria-label={`Cod QR pentru ${url}`} shapeRendering="crispEdges">
            <rect width={qr.size} height={qr.size} fill="#fff" />
            <path d={qr.d} fill="#0f2742" />
          </svg>
        ) : (
          <div className={styles.qrEmpty}>Completați sursa, mediul și campania</div>
        )}
        <code className={styles.url}>{url}</code>
        {ready && (
          <div className={styles.previewActions}>
            <CopyButton text={url} label="Copiază linkul" />
            <QrDownloads url={url} name={label || fields.campaign} />
          </div>
        )}
      </aside>
    </div>
  );
}
