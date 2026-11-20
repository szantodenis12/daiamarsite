"use client";

import { startTransition, useOptimistic, useState } from "react";
import Link from "next/link";
import { CalendarClock, GripVertical } from "lucide-react";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus, type LostReason } from "@/lib/crm";
import { moveLead } from "../../actions/leads";
import { LostReasonDialog } from "../../ui/LostReasonDialog";
import styles from "./board.module.css";
import admin from "../../admin.module.css";

export type Card = {
  id: number;
  name: string;
  company: string | null;
  service: string;
  channel: string;
  age: string;
  status: LeadStatus;
  nextActionAt: string | null;
  late: boolean;
  monthlyValue: number | null;
  oneOffValue: number | null;
  assignee: string | null;
};

const lei = new Intl.NumberFormat("ro-RO");
const day = (value: string) => value.split("-").reverse().slice(0, 2).join(".");

export function Board({ cards }: { cards: Card[] }) {
  const [optimistic, applyMove] = useOptimistic(cards, (state, move: { id: number; status: LeadStatus }) =>
    state.map((c) => (c.id === move.id ? { ...c, status: move.status } : c)),
  );
  const [over, setOver] = useState<LeadStatus | null>(null);
  const [lost, setLost] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  const commit = (id: number, status: LeadStatus, reason?: LostReason) =>
    startTransition(async () => {
      applyMove({ id, status });
      setError(null);
      const result = await moveLead(id, status, reason);
      if (result.error) setError(result.error);
    });

  const move = (id: number, status: LeadStatus) => {
    const card = optimistic.find((c) => c.id === id);
    if (!card || card.status === status) return;
    if (status === "pierdut") setLost(card);
    else commit(id, status);
  };

  return (
    <>
      {error && <p className={admin.alert} role="alert">{error}</p>}
      <div className={styles.board}>
        {LEAD_STATUSES.map((status) => {
          const column = optimistic.filter((c) => c.status === status);
          const value = column.reduce((sum, c) => sum + (c.monthlyValue ?? 0), 0);
          return (
            <section
              key={status}
              className={styles.column}
              data-over={over === status || undefined}
              aria-label={STATUS_LABELS[status]}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                move(Number(e.dataTransfer.getData("text/plain")), status);
              }}
            >
              <header className={styles.columnHead}>
                <span className={admin.status} data-status={status}>{STATUS_LABELS[status]}</span>
                <span className={styles.count}>{column.length}</span>
                {value > 0 && <span className={styles.sum}>{lei.format(value)} lei/lună</span>}
              </header>
              <ul className={styles.cards}>
                {column.map((card) => (
                  <li
                    key={card.id}
                    className={styles.card}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(card.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                  >
                    <div className={styles.cardTop}>
                      <Link href={`/admin/leads/${card.id}/`} className={styles.name}>{card.name}</Link>
                      <GripVertical aria-hidden size={14} className={styles.grip} />
                    </div>
                    {card.company && <p className={styles.company}>{card.company}</p>}
                    <p className={styles.service}>{card.service}</p>
                    <div className={styles.meta}>
                      <span className={admin.chip}>{card.channel}</span>
                      <span>{card.age}</span>
                      {card.assignee && <span>{card.assignee}</span>}
                    </div>
                    {(card.nextActionAt || card.monthlyValue || card.oneOffValue) && (
                      <div className={styles.meta}>
                        {card.nextActionAt && (
                          <span className={card.late ? styles.late : undefined}><CalendarClock aria-hidden size={12} /> {day(card.nextActionAt)}</span>
                        )}
                        {card.monthlyValue ? <strong>{lei.format(card.monthlyValue)} lei/lună</strong> : null}
                        {card.oneOffValue ? <strong>{lei.format(card.oneOffValue)} lei unic</strong> : null}
                      </div>
                    )}
                    <select
                      className={styles.move}
                      value={card.status}
                      aria-label={`Mută ${card.name}`}
                      onChange={(e) => move(card.id, e.target.value as LeadStatus)}
                    >
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </li>
                ))}
                {!column.length && <li className={styles.emptyColumn}>Trageți o cerere aici</li>}
              </ul>
            </section>
          );
        })}
      </div>
      <LostReasonDialog
        leadName={lost?.name ?? null}
        onCancel={() => setLost(null)}
        onConfirm={(reason) => {
          if (lost) commit(lost.id, "pierdut", reason);
          setLost(null);
        }}
      />
    </>
  );
}
