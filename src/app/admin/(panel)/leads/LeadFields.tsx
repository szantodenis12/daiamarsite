import { services } from "@/lib/site";
import { Field } from "../../ui/Field";
import styles from "../../admin.module.css";

type Values = {
  name?: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  assignee?: string | null;
  monthlyValue?: number | null;
  oneOffValue?: number | null;
};

/** Contact and value fields shared by "Adaugă cerere" and the lead's "Detalii" card. */
export function LeadFields({ values = {}, team }: { values?: Values; team: string[] }) {
  return (
    <>
      <Field label="Nume" name="name">
        <input id="name" name="name" required defaultValue={values.name} className={styles.input} autoComplete="off" />
      </Field>
      <Field label="Firmă" name="company">
        <input id="company" name="company" defaultValue={values.company ?? ""} className={styles.input} autoComplete="off" />
      </Field>
      <Field label="Telefon" name="phone">
        <input id="phone" name="phone" type="tel" defaultValue={values.phone ?? ""} className={styles.input} autoComplete="off" />
      </Field>
      <Field label="Email" name="email">
        <input id="email" name="email" type="email" defaultValue={values.email ?? ""} className={styles.input} autoComplete="off" />
      </Field>
      <Field label="Serviciu" name="service">
        <select id="service" name="service" defaultValue={values.service ?? ""} className={styles.input}>
          <option value="">Nu știe încă</option>
          {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
        </select>
      </Field>
      <Field label="Asignat" name="assignee" hint={team.length ? undefined : "Adăugați colegii în Setări."}>
        <select id="assignee" name="assignee" defaultValue={values.assignee ?? ""} className={styles.input}>
          <option value="">Neasignat</option>
          {team.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </Field>
      <Field label="Abonament lunar estimat (lei)" name="monthlyValue">
        <input id="monthlyValue" name="monthlyValue" inputMode="numeric" defaultValue={values.monthlyValue ?? ""} className={styles.input} placeholder="ex. 800" />
      </Field>
      <Field label="Valoare unică (lei)" name="oneOffValue" hint="Înființare, audit, reprezentare la control.">
        <input id="oneOffValue" name="oneOffValue" inputMode="numeric" defaultValue={values.oneOffValue ?? ""} className={styles.input} placeholder="ex. 1.500" />
      </Field>
    </>
  );
}
