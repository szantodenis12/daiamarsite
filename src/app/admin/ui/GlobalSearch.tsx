"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import styles from "../(panel)/panel.module.css";

type Result = { id: number; name: string; detail: string; status: string };

export function GlobalSearch() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key !== "/" || target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      event.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) return setResults([]);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/admin/search/?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((data: { results: Result[] }) => {
          setResults(data.results);
          setActive(-1);
        })
        .catch(() => undefined);
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    input.current?.blur();
    router.push(href);
  };

  return (
    <form
      role="search"
      className={styles.search}
      onSubmit={(event) => {
        event.preventDefault();
        if (results[active]) go(`/admin/leads/${results[active].id}/`);
        else if (query.trim()) go(`/admin/leads/?q=${encodeURIComponent(query.trim())}`);
      }}
    >
      <Search aria-hidden size={16} />
      <input
        ref={input}
        type="search"
        value={query}
        placeholder="Caută o cerere, firmă, telefon…"
        aria-label="Caută cereri"
        aria-expanded={open && results.length > 0}
        aria-controls="rezultate-cautare"
        role="combobox"
        aria-autocomplete="list"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setActive((i) => Math.min(results.length - 1, i + 1));
          else if (e.key === "ArrowUp") setActive((i) => Math.max(-1, i - 1));
          else if (e.key === "Escape") input.current?.blur();
          else return;
          e.preventDefault();
        }}
      />
      <kbd className={styles.kbd}>/</kbd>
      {open && results.length > 0 && (
        <ul className={styles.results} id="rezultate-cautare" role="listbox">
          {results.map((r, i) => (
            <li key={r.id} role="option" aria-selected={i === active}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(`/admin/leads/${r.id}/`)}>
                <strong>{r.name}</strong>
                <span>{r.detail}</span>
                <em>{r.status}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
