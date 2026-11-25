"use client";

import { Children, useState } from "react";
import styles from "./panou.module.css";

type Props = {
  children: React.ReactNode;
  /** How many items are visible before the disclosure. */
  limit: number;
  className?: string;
  /** Text of the button while collapsed, e.g. "Arată toate"; the item count is appended. */
  label?: string;
  /** Number shown in the button when it differs from the number of children. */
  count?: number;
};

/** A capped list with an inline "show all (n)" disclosure. Items are server-rendered children. */
export function Expand({ children, limit, className, label = "Arată toate", count }: Props) {
  const [open, setOpen] = useState(false);
  const items = Children.toArray(children);
  const shown = open ? items : items.slice(0, limit);
  return (
    <>
      <ul className={className}>{shown}</ul>
      {items.length > limit && (
        <button type="button" className={styles.more} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Arată mai puține" : `${label} (${count ?? items.length})`}
        </button>
      )}
    </>
  );
}
