"use client";

import styles from "../(panel)/panel.module.css";

type Props = { team: string[]; author: string; action: (form: FormData) => Promise<void> };

/** Picks the name written on notes and calls from this device. Submits on change. */
export function AuthorPicker({ team, author, action }: Props) {
  if (!team.length) return null;
  return (
    <form action={action} className={styles.author}>
      <label htmlFor="author">Lucrezi ca</label>
      <select id="author" name="author" defaultValue={team.includes(author) ? author : ""} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        <option value="">Echipa</option>
        {team.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
    </form>
  );
}
