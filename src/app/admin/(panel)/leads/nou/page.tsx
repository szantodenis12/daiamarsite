import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTeam } from "@/lib/settings";
import { createLead } from "../../../actions/leads";
import { ActionForm } from "../../../ui/ActionForm";
import { Field } from "../../../ui/Field";
import { LeadFields } from "../LeadFields";
import { SourcePicker } from "./SourcePicker";
import styles from "./new.module.css";
import admin from "../../../admin.module.css";
import { requireSession } from "../../../session";

export const metadata: Metadata = { title: "Adaugă cerere" };

export default async function NewLeadPage() {
  await requireSession();
  const team = await getTeam();
  return (
    <>
      <Link href="/admin/leads/" className={admin.back}><ArrowLeft aria-hidden size={16} /> Toate cererile</Link>
      <h1 className={admin.srOnly}>Adaugă o cerere</h1>
      <div className={`${admin.panel} ${styles.card}`}>
        <p className={admin.muted}>Pentru cererile care nu vin prin site: telefon, recomandare, vizită la birou. Apar în rapoarte la sursa aleasă.</p>
        <ActionForm action={createLead} submitLabel="Salvează cererea" className={styles.form}>
          <div className={admin.formGrid}>
            <SourcePicker />
            <LeadFields team={team} />
            <Field label="Status" name="status">
              <select id="status" name="status" defaultValue="contactat" className={admin.input}>
                <option value="contactat">Am vorbit deja (contactat)</option>
                <option value="nou">Încă nu am vorbit (nou)</option>
              </select>
            </Field>
            <Field label="Următorul pas, data" name="nextActionAt">
              <input id="nextActionAt" name="nextActionAt" type="date" className={admin.input} />
            </Field>
            <Field label="Următorul pas" name="nextAction" className={admin.full}>
              <input id="nextAction" name="nextAction" className={admin.input} placeholder="ex. Trimit oferta pentru contabilitate" />
            </Field>
            <Field label="Ce a cerut" name="message" className={admin.full}>
              <textarea id="message" name="message" rows={3} className={admin.input} />
            </Field>
          </div>
        </ActionForm>
      </div>
    </>
  );
}
