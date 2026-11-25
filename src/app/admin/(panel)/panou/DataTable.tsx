"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import styles from "./panou.module.css";
import admin from "../../admin.module.css";

export type Cell = { t: string; /** value used for sorting, defaults to the text */ s?: number | string; /** 0..1, draws a small share bar */ bar?: number };
export type Row = { key: string; cells: Cell[]; total?: boolean };

type Props = {
  caption: string;
  columns: string[];
  rows: Row[];
  /** Rows visible before "Arată toate". */
  limit?: number;
  /** Column and direction the table starts sorted by (the data is already in this order). */
  initial?: { col: number; dir: "asc" | "desc" };
  empty: string;
};

const order = (a: Cell, b: Cell) => {
  const x = a.s ?? a.t;
  const y = b.s ?? b.t;
  return typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "ro");
};

export function DataTable({ caption, columns, rows, limit = 8, initial, empty }: Props) {
  const [sort, setSort] = useState<{ col: number; dir: "asc" | "desc" } | null>(initial ?? null);
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => {
    const body = rows.filter((r) => !r.total);
    if (sort && !(initial && sort.col === initial.col && sort.dir === initial.dir)) {
      body.sort((a, b) => order(a.cells[sort.col], b.cells[sort.col]) * (sort.dir === "asc" ? 1 : -1));
    }
    return [...body, ...rows.filter((r) => r.total)];
  }, [rows, sort, initial]);

  if (!rows.length) return <p className={admin.muted}>{empty}</p>;
  const body = sorted.filter((r) => !r.total);
  const totals = sorted.filter((r) => r.total);
  const visible = open ? body : body.slice(0, limit);

  const toggle = (col: number) => setSort((cur) => (cur && cur.col === col ? { col, dir: cur.dir === "desc" ? "asc" : "desc" } : { col, dir: col === 0 ? "asc" : "desc" }));

  return (
    <>
      <div className={admin.tableWrap}>
        <table className={`${admin.table} ${styles.dataTable}`}>
          <caption className={admin.srOnly}>{caption}</caption>
          <thead>
            <tr>
              {columns.map((c, i) => {
                const on = sort?.col === i;
                const Icon = on ? (sort?.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th key={c} scope="col" aria-sort={on ? (sort?.dir === "asc" ? "ascending" : "descending") : undefined}>
                    <button type="button" className={styles.sortBtn} onClick={() => toggle(i)}>
                      {c}
                      <Icon aria-hidden size={12} className={admin.sortIcon} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {[...visible, ...totals].map((r) => (
              <tr key={r.key} className={`${r.total ? admin.total : ""} ${styles.row}`}>
                {r.cells.map((c, i) => (
                  <td key={i}>
                    {c.bar !== undefined ? (
                      <span className={styles.cellBar}>
                        <span className={styles.cellBarText}>{c.t}</span>
                        <span className={styles.cellBarTrack} aria-hidden><i style={{ width: `${Math.max(2, c.bar * 100)}%` }} /></span>
                      </span>
                    ) : (
                      c.t
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {body.length > limit && (
        <button type="button" className={styles.more} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Arată mai puține" : `Arată toate (${body.length})`}
        </button>
      )}
    </>
  );
}
