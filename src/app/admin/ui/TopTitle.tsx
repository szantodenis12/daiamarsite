"use client";

import { usePathname } from "next/navigation";
import { pageTitle } from "./nav";
import styles from "../(panel)/panel.module.css";

/** Section title in the top bar, derived from the nav config. */
export function TopTitle() {
  return <p className={styles.topTitle}>{pageTitle(usePathname())}</p>;
}
