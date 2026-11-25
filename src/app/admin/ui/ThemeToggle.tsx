"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon } from "lucide-react";
import styles from "../(panel)/panel.module.css";
import admin from "../admin.module.css";

const KEY = "dm_admin_theme";
type Theme = "light" | "dark";

const shell = () => document.querySelector<HTMLElement>("[data-theme]");
const read = (): Theme => (shell()?.dataset.theme === "dark" ? "dark" : "light");

function apply(theme: Theme, animate: boolean) {
  const el = shell();
  if (!el) return;
  if (animate) {
    el.setAttribute("data-switching", "");
    window.setTimeout(() => el.removeAttribute("data-switching"), 300);
  }
  el.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event("dm-theme"));
}

const subscribe = (cb: () => void) => {
  window.addEventListener("dm-theme", cb);
  return () => window.removeEventListener("dm-theme", cb);
};

/** Keeps the theme right after client-side navigation (the inline script only runs on a full page load). */
export function ThemeSync() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = () => {
      try {
        const v = localStorage.getItem(KEY);
        return v === "dark" || v === "light" ? v : null;
      } catch {
        return null;
      }
    };
    if (!shell()?.dataset.theme) apply(stored() ?? (media.matches ? "dark" : "light"), false);
    const onSystem = () => { if (!stored()) apply(media.matches ? "dark" : "light", true); };
    media.addEventListener("change", onSystem);
    return () => {
      media.removeEventListener("change", onSystem);
      document.documentElement.style.colorScheme = "";
    };
  }, []);
  return null;
}

/** Row with a label and a switch. Both copies (sidebar, mobile sheet) stay in step through the DOM attribute. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const dark = theme === "dark";
  return (
    <div className={`${styles.themeRow} ${className ?? ""}`}>
      <Moon aria-hidden size={16} />
      <span>Mod întunecat</span>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Mod întunecat"
        className={admin.switch}
        onClick={() => {
          const next: Theme = dark ? "light" : "dark";
          try { localStorage.setItem(KEY, next); } catch {}
          document.cookie = `${KEY}=${next}; path=/admin; max-age=31536000; samesite=lax`;
          apply(next, true);
        }}
      />
    </div>
  );
}
