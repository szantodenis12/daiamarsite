"use client";

import styles from "./settings.module.css";
import admin from "../../admin.module.css";

type Props = { team: string[]; author: string; action: (form: FormData) => Promise<void> };

/** Same choice as in the sidebar, for phones where the sidebar is hidden. */
export function AuthorSelect({ team, author, action }: Props) {
  return (
    <form action={action} className={`${styles.author} ${styles.spaced}`}>
      <label className={admin.label} htmlFor="author-settings">Pe acest dispozitiv lucrez ca</label>
      <select id="author-settings" name="author" defaultValue={team.includes(author) ? author : ""} className={admin.input} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        <option value="">Echipa</option>
        {team.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
    </form>
  );
}
