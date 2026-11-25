import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ChartColumn, CheckCheck, FileText, Hourglass, Inbox, ListChecks, PieChart, SquareKanban, TriangleAlert, UserCheck, Users, Wallet, type LucideIcon } from "lucide-react";
import { bucharestDay, bucharestMonth, STATUS_DISPLAY } from "@/lib/crm";
import { db, type Lead } from "@/lib/db";
import { clearFollowUp } from "../actions/leads";
import { formatAge, formatLei, formatNumber, formatShortDate, serviceTitle } from "../format";
import { leadsPerMonth, monthKpis, shiftMonth, topSlices, type Slice } from "../home";
import { attentionCount, pipelineValue, todayLists } from "../reports";
import { countable, countBy, periodStart } from "../stats";
import { CountUp } from "../ui/CountUp";
import { QuickActions } from "../ui/QuickActions";
import { requireSession } from "../session";
import { MonthlyChart } from "./MonthlyChart";
import styles from "./home.module.css";
import admin from "../admin.module.css";

export const metadata: Metadata = { title: "Acasă" };
export const dynamic = "force-dynamic";

const sliceColor = (i: number) => `var(--donut-${(i % 5) + 1})`;

const minus = (n: number) => `−${Math.abs(n)}`;
function delta(current: number, previous: number) {
  const diff = current - previous;
  if (!diff) return { text: "la fel ca luna trecută", tone: undefined };
  return { text: `${diff > 0 ? `+${diff}` : minus(diff)} față de luna trecută`, tone: diff > 0 ? ("up" as const) : ("down" as const) };
}

function Stat({ icon: Icon, tone, label, children, note, noteTone }: { icon: LucideIcon; tone: string; label: string; children: React.ReactNode; note: string; noteTone?: "up" | "down" }) {
  return (
    <div className={admin.stat}>
      <span className={admin.statIcon} data-tone={tone}><Icon aria-hidden size={18} /></span>
      <div className={admin.statBody}>
        <p className={admin.statLabel}>{label}</p>
        <p className={admin.statValue}>{children}</p>
        <p className={admin.statDelta} data-tone={noteTone}>{note}</p>
      </div>
    </div>
  );
}

function Donut({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (!total) return <p className={admin.muted}>Nicio cerere în ultimele 30 de zile.</p>;
  const R = 70;
  const STROKE = 22;
  const C = 2 * Math.PI * R;
  const GAP = 6;
  let cumulative = 0;
  return (
    <div>
      <div className={styles.donutBox}>
        <svg viewBox="0 0 180 180" role="img" aria-label={`Cereri pe surse: ${slices.map((s) => `${s.label} ${s.value}`).join(", ")}`}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--donut-track)" strokeWidth={STROKE} />
          {slices.map((s, i) => {
            const length = (s.value / total) * C;
            const dash = Math.max(0.1, length - GAP - STROKE);
            const offset = -(cumulative + (GAP + STROKE) / 2);
            cumulative += length;
            return (
              <circle
                key={s.label}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={sliceColor(i)}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={offset}
                transform="rotate(-90 90 90)"
                className={styles.arc}
                style={{ "--i": i, "--c": C, "--dash": dash } as React.CSSProperties}
              />
            );
          })}
        </svg>
        <div className={styles.donutCentre}>
          <span>Total cereri</span>
          <strong>{formatNumber(total)}</strong>
        </div>
      </div>
      <ul className={styles.donutLegend}>
        {slices.map((s, i) => (
          <li key={s.label}>
            <i style={{ background: sliceColor(i) }} />
            <span className={styles.legendName}>{s.label}</span>
            <span className={styles.legendValue}>{formatNumber(s.value)}</span>
            <b>{Math.round((s.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Item = { lead: Lead; tone: "red" | "violet" | "amber" | "blue"; badge: string; icon: LucideIcon; meta: string; done?: boolean };

function daysLate(day: string, today: string) {
  const diff = Math.round((Date.parse(today) - Date.parse(day)) / 86400_000);
  return diff === 1 ? "de ieri" : `de ${diff} zile`;
}
const receivedAgo = (age: string) => (age === "azi" || age === "ieri" ? age : `acum ${age}`);

export default async function HomePage() {
  await requireSession();
  const [allLeads, offers] = await Promise.all([db().leadsSince(new Date(0)), db().offers()]);
  const leads = countable(allLeads);
  const day = bucharestDay();
  const month = bucharestMonth();
  const lists = todayLists(allLeads);
  const attention = attentionCount(lists);

  const now = monthKpis(leads, offers, month);
  const before = monthKpis(leads, offers, shiftMonth(month, -1));
  const open = pipelineValue(leads);
  const points = leadsPerMonth(leads, 12);

  const since = periodStart("30");
  const recentLeads = leads.filter((l) => new Date(l.createdAt) >= since);
  const slices = topSlices(countBy(recentLeads, (l) => l.channel), 4);

  const items: Item[] = [
    ...lists.overdue.map((lead): Item => ({ lead, tone: "red", badge: "Întârziat", icon: TriangleAlert, done: true, meta: `${lead.nextAction || "Follow-up"} · ${daysLate(lead.nextActionAt as string, day)}` })),
    ...lists.today.map((lead): Item => ({ lead, tone: "violet", badge: "Azi", icon: CalendarClock, done: true, meta: `${lead.nextAction || "Follow-up"} · programat azi` })),
    ...lists.stale.map((lead): Item => ({ lead, tone: "amber", badge: "Fără răspuns", icon: Hourglass, meta: `Primită ${receivedAgo(formatAge(lead.createdAt))}, încă necontactată` })),
    ...lists.fresh.map((lead): Item => ({ lead, tone: "blue", badge: "Nou", icon: Inbox, meta: [serviceTitle(lead.service), `primită ${receivedAgo(formatAge(lead.createdAt))}`].join(" · ") })),
  ];
  const recent = leads.slice(0, 7);

  const kLeads = delta(now.leads, before.leads);
  const kClients = delta(now.clients, before.clients);

  return (
    <>
      <h1 className={admin.srOnly}>Acasă</h1>

      <div className={styles.kpis}>
        <Stat icon={Inbox} tone="blue" label="Cereri noi luna aceasta" note={kLeads.text} noteTone={kLeads.tone}><CountUp value={now.leads} /></Stat>
        <Stat icon={UserCheck} tone="green" label="Clienți noi luna aceasta" note={kClients.text} noteTone={kClients.tone}><CountUp value={now.clients} /></Stat>
        <Stat icon={Wallet} tone="violet" label="Valoare în lucru" note={`${formatNumber(open.count)} cereri deschise`}>
          <CountUp value={Math.round(open.monthly)} /> <small>lei/lună</small>
        </Stat>
        <Stat icon={FileText} tone="amber" label="Oferte trimise luna aceasta" note={`${formatNumber(now.offersAccepted)} acceptate`}><CountUp value={now.offersSent} /></Stat>
      </div>

      <div className={styles.rowCharts}>
        <section className={admin.panel} aria-labelledby="t-luna">
          <div className={admin.panelHead}>
            <h2 className={admin.panelTitle} id="t-luna"><ChartColumn aria-hidden size={16} /> Cereri pe lună</h2>
          </div>
          <MonthlyChart points={points} />
        </section>

        <section className={admin.panel} aria-labelledby="t-surse">
          <div className={admin.panelHead}>
            <h2 className={admin.panelTitle} id="t-surse"><PieChart aria-hidden size={16} /> De unde vin cererile</h2>
            <Link href="/admin/panou/" className={`${admin.secondary} ${admin.small}`}>Vezi tot</Link>
          </div>
          <Donut slices={slices} />
          <p className={`${admin.muted} ${styles.donutNote}`}>Ultimele 30 de zile</p>
        </section>
      </div>

      <div className={styles.rowLists}>
        <section className={admin.panel} id="de-facut" aria-labelledby="t-facut">
          <div className={admin.panelHead}>
            <h2 className={admin.panelTitle} id="t-facut">
              <ListChecks aria-hidden size={16} /> De făcut azi
              {attention > 0 && <span className={admin.pill} data-tone="red">{attention}</span>}
            </h2>
            <Link href="/admin/leads/" className={`${admin.secondary} ${admin.small}`}>Vezi tot</Link>
          </div>
          {items.length ? (
            <ul className={`${admin.activityList} ${styles.todoList}`}>
              {items.map(({ lead, tone, badge, icon: Icon, meta, done }) => (
                <li key={`${badge}-${lead.id}`} className={admin.activityRow}>
                  <span className={admin.activityIcon} data-tone={tone}><Icon aria-hidden size={16} /></span>
                  <div className={admin.activityMain}>
                    <Link href={`/admin/leads/${lead.id}/`} className={admin.activityTitle}>{lead.name}{lead.company ? ` · ${lead.company}` : ""}</Link>
                    <span className={admin.activityMeta}>{meta}</span>
                  </div>
                  <span className={admin.pill} data-tone={tone}>{badge}</span>
                  <div className={styles.rowActions}>
                    <QuickActions leadId={lead.id} phone={lead.phone} email={lead.email} service={serviceTitle(lead.service)} compact />
                    {done && (
                      <form action={clearFollowUp}>
                        <input type="hidden" name="id" value={lead.id} />
                        <button type="submit" className={`${admin.secondary} ${admin.small}`}><CheckCheck aria-hidden size={14} /> Gata</button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={admin.empty}>
              <CheckCheck aria-hidden size={28} strokeWidth={1.5} />
              <strong>Nimic de făcut azi</strong>
              <p>Niciun pas programat și nicio cerere nouă necontactată.</p>
            </div>
          )}
          <p className={styles.panelNote}>Aici apar pașii programați până azi și cererile noi la care nu a răspuns nimeni.</p>
        </section>

        <section className={admin.panel} aria-labelledby="t-recente">
          <div className={admin.panelHead}>
            <h2 className={admin.panelTitle} id="t-recente"><Users aria-hidden size={16} /> Cereri recente</h2>
            <div className={admin.panelTools}>
              <Link href="/admin/pipeline/" className={`${admin.secondary} ${admin.small}`}><SquareKanban aria-hidden size={14} /> Pe etape</Link>
              <Link href="/admin/leads/" className={`${admin.secondary} ${admin.small}`}>Vezi tot</Link>
            </div>
          </div>
          {recent.length ? (
            <div className={admin.tableWrap}>
              <table className={`${admin.table} ${admin.tableLeft} ${styles.recent}`}>
                <thead>
                  <tr><th>Nume / firmă</th><th>Serviciu și sursă</th><th>Valoare</th><th>Status</th><th>Data</th></tr>
                </thead>
                <tbody>
                  {recent.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div className={styles.who}>
                          <span className={styles.initial} aria-hidden>{l.name.trim().slice(0, 1).toUpperCase()}</span>
                          <div>
                            <Link href={`/admin/leads/${l.id}/`} className={`${admin.rowLink} ${styles.whoName}`}>{l.name}</Link>
                            {l.company && <small className={styles.whoCompany}>{l.company}</small>}
                          </div>
                        </div>
                      </td>
                      <td className={styles.cellWrap}>{serviceTitle(l.service)}<small className={styles.cellSub}>Sursă: {l.channel}</small></td>
                      <td>{l.monthlyValue ? `${formatLei(l.monthlyValue)}/lună` : l.oneOffValue ? formatLei(l.oneOffValue) : "–"}</td>
                      <td><span className={admin.status} data-status={l.status}>{STATUS_DISPLAY[l.status]}</span></td>
                      <td>{formatShortDate(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={admin.empty}>
              <Inbox aria-hidden size={28} strokeWidth={1.5} />
              <strong>Nicio cerere încă</strong>
              <Link href="/admin/leads/nou/" className={admin.secondary}>Adaugă prima cerere</Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
