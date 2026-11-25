import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChartColumn, FileText, Filter, Inbox, Megaphone, PieChart, Percent, ThumbsDown, Trophy, Users, Wallet, type LucideIcon } from "lucide-react";
import { bucharestMonth } from "@/lib/crm";
import { db } from "@/lib/db";
import { formatDuration, formatLei, formatMonth, formatNumber, formatPercent, serviceTitle } from "../../format";
import { funnelTable, lostReasons, monthsFrom, offerStats, pipelineValue, roiTable, sumValue, wonByChannel, wonSince } from "../../reports";
import { channelOf, channelTable, countable, countBy, leadsOverTime, parsePeriod, periodStart, PERIODS, touchOf, type Count, type Period, type TouchMode } from "../../stats";
import { CountUp } from "../../ui/CountUp";
import { FunnelTable, RoiTable } from "../tables";
import { requireSession } from "../../session";
import { DataTable, type Row } from "./DataTable";
import { Help } from "./Help";
import { MiniBars } from "./MiniBars";
import { SourceDonut } from "./SourceDonut";
import { TabNav } from "./TabNav";
import { TimeBars } from "./TimeBars";
import styles from "./panou.module.css";
import admin from "../../admin.module.css";

export const metadata: Metadata = { title: "Rapoarte" };
export const dynamic = "force-dynamic";

const TABS = [
  { id: "prezentare", label: "Prezentare" },
  { id: "surse", label: "Surse și campanii" },
  { id: "reclame", label: "Reclame" },
  { id: "oferte", label: "Oferte și abonați" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const VIEWS = [
  { id: "sursa", label: "Pe sursă", short: "Pe sursă" },
  { id: "serviciu", label: "Pe serviciu", short: "Pe serviciu" },
  { id: "campanie", label: "Pe campanie", short: "Pe campanie" },
  { id: "formular", label: "Pe formular", short: "Pe formular" },
  { id: "pagina", label: "Pe pagina de pe care au scris", short: "Pe pagină" },
] as const;
type View = (typeof VIEWS)[number]["id"];

type Props = { searchParams: Promise<{ p?: string; t?: string; tab?: string; view?: string }> };

const n = formatNumber;
const lei = (v: number | null) => (v === null ? "-" : formatLei(v));
const periodText = (p: Period) => (p === "all" ? "total" : `ultimele ${PERIODS[p]}`);

function shareRows(rows: Count[], key: string): Row[] {
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const max = Math.max(1, ...rows.map((r) => r.value));
  return rows.map((r) => ({ key: `${key}-${r.label}`, cells: [{ t: r.label }, { t: n(r.value), s: r.value }, { t: formatPercent(r.value / total), s: r.value / total, bar: r.value / max }] }));
}

export default async function Rapoarte({ searchParams }: Props) {
  await requireSession();
  const params = await searchParams;
  const period = parsePeriod(params.p);
  const mode: TouchMode = params.t === "ft" ? "ft" : "lt";
  const tab: Tab = TABS.find((t) => t.id === params.tab)?.id ?? "prezentare";
  const view: View = VIEWS.find((v) => v.id === params.view)?.id ?? "sursa";
  const since = periodStart(period);

  const [allLeads, events, spend, offerList, allSubscribers] = await Promise.all([db().leadsSince(new Date(0)), db().eventsSince(since), db().spend(), db().offers(), db().subscribers()]);
  const all = countable(allLeads);
  const subscribers = countable(allSubscribers);
  const leads = all.filter((l) => new Date(l.createdAt) >= since);

  const visits = events.filter((e) => e.kind === "visit").length;
  const calls = events.filter((e) => e.kind === "phone" || e.kind === "whatsapp").length;
  const channels = channelTable(leads, events, mode);
  const open = pipelineValue(all);
  const won = wonSince(all, since);
  const wonValue = sumValue(won);
  const hasDemo = all.some((l) => l.demo) || events.some((e) => e.demo);
  const rate = visits ? leads.length / visits : null;

  const href = (next: { p?: Period; t?: TouchMode; tab?: Tab; view?: View }) => {
    const q = new URLSearchParams({ p: next.p ?? period, t: next.t ?? mode });
    const target = next.tab ?? tab;
    if (target !== "prezentare") q.set("tab", target);
    const v = next.view ?? view;
    if (target === "surse" && v !== "sursa") q.set("view", v);
    return `/admin/panou/?${q}`;
  };

  let stagger = 0;
  let step = 1;
  const lift = () => ({ style: { "--i": step++ } as React.CSSProperties });
  const rise = () => ({ style: { "--i": stagger++ } as React.CSSProperties });

  return (
    <>
      <h1 className={admin.srOnly}>Rapoarte: de unde vin clienții</h1>

      <div className={styles.toolbar}>
        <div className={admin.segmented} role="group" aria-label="Perioada">
          {(Object.keys(PERIODS) as Period[]).map((p) => (
            <Link key={p} href={href({ p })} scroll={false} aria-current={p === period ? "true" : undefined}>{PERIODS[p]}</Link>
          ))}
        </div>
        <div className={styles.attribution}>
          <span id="attr-label">Socotim sursa după</span>
          <div className={admin.segmented} role="group" aria-labelledby="attr-label">
            <Link href={href({ t: "ft" })} scroll={false} aria-current={mode === "ft" ? "true" : undefined}>Prima vizită</Link>
            <Link href={href({ t: "lt" })} scroll={false} aria-current={mode === "lt" ? "true" : undefined}>Ultima vizită</Link>
          </div>
          <Help id="attr-help" label="Ce înseamnă „Socotim sursa după”">
            <b>Prima vizită:</b> sursa prin care persoana a ajuns prima dată pe site (ultimele 90 de zile).<br />
            <b>Ultima vizită:</b> sursa vizitei în care a trimis cererea sau a sunat.
          </Help>
        </div>
      </div>

      <section className={styles.kpis} aria-label="Cifre principale">
        <div className={admin.rise} {...rise()}>
          <Kpi icon={Inbox} tone="blue" label="Cereri" note={`${n(calls)} clicuri pe telefon și WhatsApp`}><CountUp value={leads.length} /></Kpi>
        </div>
        <div className={admin.rise} {...rise()}>
          <Kpi icon={Percent} tone="green" label="Vizitatori care au trimis o cerere" note={`din ${n(visits)} vizite`}>
            {rate === null ? "-" : <><CountUp value={Math.round(rate * 100)} /><small>%</small></>}
          </Kpi>
        </div>
        <div className={admin.rise} {...rise()}>
          <Kpi icon={Wallet} tone="violet" label="Valoare în lucru" note={`${n(open.count)} cereri deschise${open.oneOff ? ` · ${formatLei(open.oneOff)} unic` : ""}`}>
            <CountUp value={Math.round(open.monthly)} /> <small>lei/lună</small>
          </Kpi>
        </div>
        <div className={admin.rise} {...rise()}>
          <Kpi icon={Trophy} tone="amber" label="Contracte câștigate" note={`${n(wonValue.count)} clienți noi${wonValue.oneOff ? ` · ${formatLei(wonValue.oneOff)} unic` : ""}`}>
            <CountUp value={Math.round(wonValue.monthly)} /> <small>lei/lună</small>
          </Kpi>
        </div>
      </section>

      <TabNav tabs={TABS.map((t) => ({ id: t.id, label: t.label, href: href({ tab: t.id }) }))} active={tab} panelId="panou-panel" />

      <div key={tab} id="panou-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className={styles.tabPanel}>
        {tab === "prezentare" && (() => {
          const sources: Count[] = channels.filter((c) => c.leads > 0).map((c) => ({ label: c.channel, value: c.leads }));
          const funnel = funnelTable(leads, events, (row) => channelOf(row, mode));
          const total = funnel[funnel.length - 1];
          const steps = [
            { label: "Vizite", value: total.visits, rate: null as number | null },
            { label: "Cereri", value: total.leads, rate: total.visits ? total.leads / total.visits : null },
            { label: "Contactați", value: total.contacted, rate: total.leads ? total.contacted / total.leads : null },
            { label: "Clienți", value: total.clients, rate: total.contacted ? total.clients / total.contacted : null },
          ];
          return (
            <div className={styles.grid}>
              <section {...lift()} className={`${admin.rise} ${admin.panel} ${styles.gDonut}`} aria-labelledby="t-surse">
                <div className={admin.panelHead}>
                  <h2 className={admin.panelTitle} id="t-surse"><PieChart aria-hidden size={16} /> De unde vin cererile</h2>
                </div>
                <SourceDonut rows={sources} empty="Nicio cerere în perioada aleasă." />
              </section>

              <section {...lift()} className={`${admin.rise} ${admin.panel} ${styles.gTime}`} aria-labelledby="t-timp">
                <div className={admin.panelHead}>
                  <h2 className={admin.panelTitle} id="t-timp"><ChartColumn aria-hidden size={16} /> Cereri în timp</h2>
                  <span className={admin.muted}>{n(leads.length)} cereri, {periodText(period)}</span>
                </div>
                <TimeBars buckets={leadsOverTime(leads, period)} total={leads.length} />
              </section>

              <section {...lift()} className={`${admin.rise} ${admin.panel} ${styles.gLost}`} aria-labelledby="t-pierdem">
                <div className={admin.panelHead}>
                  <h2 className={admin.panelTitle} id="t-pierdem"><ThumbsDown aria-hidden size={16} /> De ce pierdem cereri</h2>
                </div>
                <MiniBars rows={lostReasons(leads)} limit={5} empty="Nicio cerere pierdută în perioada aleasă." />
              </section>

              <section {...lift()} className={`${admin.rise} ${admin.panel} ${styles.gFunnel}`} aria-labelledby="t-palnie">
                <div className={admin.panelHead}>
                  <h2 className={admin.panelTitle} id="t-palnie"><Filter aria-hidden size={16} /> De la vizită la client</h2>
                  <Help id="funnel-help" label="Cum se citește">
                    Procentele arată trecerea de la pasul anterior. Timpul până la primul telefon/mesaj se măsoară de la cerere până la prima notă, apel sau schimbare de status. Cererile adăugate manual nu intră în medie.
                  </Help>
                </div>
                <ol className={styles.funnel}>
                  {steps.map((s, i) => (
                    <li key={s.label}>
                      {i > 0 && (
                        <span className={styles.funnelArrow} aria-hidden>
                          <ArrowRight size={14} />
                          <b>{s.rate === null ? "-" : formatPercent(s.rate)}</b>
                        </span>
                      )}
                      <span className={styles.funnelStep}>
                        <small>{s.label}</small>
                        <strong>{n(s.value)}</strong>
                        {i > 0 && s.rate !== null && <span className={admin.srOnly}>{formatPercent(s.rate)} din pasul anterior</span>}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className={styles.funnelNote}>
                  Timp mediu până la primul telefon/mesaj: <b>{total.firstContactMs === null ? "-" : formatDuration(total.firstContactMs)}</b>
                </p>
                <details className={styles.details}>
                  <summary>Pe fiecare sursă</summary>
                  <FunnelTable rows={funnel} />
                </details>
              </section>
            </div>
          );
        })()}

        {tab === "surse" && (() => {
          const wonBy = new Map(wonByChannel(won).map((r) => [r.label, r.value]));
          const sourceRows: Row[] = channels.map((c) => ({
            key: c.channel,
            cells: [
              { t: c.channel },
              { t: n(c.visits), s: c.visits },
              { t: n(c.leads), s: c.leads },
              { t: c.visits ? formatPercent(c.leads / c.visits) : "-", s: c.visits ? c.leads / c.visits : -1 },
              { t: n(c.phone), s: c.phone },
              { t: n(c.whatsapp), s: c.whatsapp },
              { t: n(c.email), s: c.email },
              { t: n(c.maps), s: c.maps },
              { t: wonBy.get(c.channel) ? formatLei(wonBy.get(c.channel) as number) : "-", s: wonBy.get(c.channel) ?? 0 },
            ],
          }));
          const share = (caption: string, first: string, rows: Count[], empty: string, key: string) => (
            <DataTable caption={caption} columns={[first, "Cereri", "Pondere"]} rows={shareRows(rows, key)} initial={{ col: 1, dir: "desc" }} empty={empty} />
          );
          const nodes: Record<View, React.ReactNode> = {
            sursa: <DataTable caption="Cereri, vizite și clicuri pe sursă" columns={["Sursă", "Vizite", "Cereri", "Vizite → cerere", "Telefon", "WhatsApp", "Email", "Hartă", "Contracte (lei/lună)"]} rows={sourceRows} initial={{ col: 2, dir: "desc" }} empty="Nicio activitate în perioada aleasă." />,
            serviciu: share("Cereri pe serviciu", "Serviciu", countBy(leads, (l) => serviceTitle(l.service)), "Nicio cerere în perioada aleasă.", "srv"),
            campanie: share("Cereri pe campanie", "Campanie", countBy(leads, (l) => touchOf(l, mode)?.utm_campaign), "Nicio cerere cu campanie în perioada aleasă.", "cmp"),
            formular: share("Cereri pe formular", "Formular", countBy(leads, (l) => l.placement), "Nicio cerere în perioada aleasă.", "frm"),
            pagina: share("Cereri pe pagina de pe care au scris", "Pagină", countBy(leads.filter((l) => l.page !== "-"), (l) => l.page), "Nicio cerere de pe site în perioada aleasă.", "pag"),
          };
          return (
            <section {...lift()} className={`${admin.rise} ${admin.panel}`} aria-labelledby="t-views">
              <div className={admin.panelHead}>
                <h2 className={admin.panelTitle} id="t-views"><Users aria-hidden size={16} /> {VIEWS.find((v) => v.id === view)?.label}</h2>
                <div className={admin.segmented} role="group" aria-label="Împărțirea cererilor">
                  {VIEWS.map((v) => (
                    <Link key={v.id} href={href({ view: v.id })} scroll={false} aria-current={v.id === view ? "true" : undefined}>{v.short}</Link>
                  ))}
                </div>
              </div>
              {nodes[view]}
              <p className={styles.note}>
                Sursele se calculează din parametrii din linkuri (UTM), gclid/fbclid și site-ul de proveniență. Vizitele se numără o dată pe sesiune.
                {view === "sursa" && " Contracte = abonamentul lunar al clienților câștigați în perioadă."}
              </p>
            </section>
          );
        })()}

        {tab === "reclame" && (() => {
          const firstMonth = period === "all" ? [...spend.map((s) => s.month), ...all.map((l) => bucharestMonth(new Date(l.createdAt)))].sort()[0] : bucharestMonth(since);
          const months = monthsFrom(firstMonth ?? bucharestMonth());
          const roi = roiTable(all, spend, months);
          const rows = roi.filter((r) => r.label !== "Total reclame");
          const peak = Math.max(1, ...rows.flatMap((r) => [r.spend, r.wonMonthly * 12]));
          return (
            <div className={styles.stack}>
              <section {...lift()} className={`${admin.rise} ${admin.panel}`} aria-labelledby="t-roi">
                <div className={admin.panelHead}>
                  <h2 className={admin.panelTitle} id="t-roi"><Megaphone aria-hidden size={16} /> Buget și câștig pe sursă</h2>
                  <div className={admin.panelTools}>
                    <span className={admin.muted}>{formatMonth(months[0])}{months.length > 1 ? ` – ${formatMonth(months[months.length - 1])}` : ""}</span>
                    <Help id="roi-help" label="Cum se calculează">
                      Luni întregi, ca bugetul. Cererile se numără după sursa ultimei vizite. Câștigul estimat = abonamentul lunar al clienților câștigați × 12, împărțit la ce ați cheltuit. Este o estimare, nu un profit.
                    </Help>
                    <Link href="/admin/buget/" className={`${admin.secondary} ${admin.small}`}>Buget reclame</Link>
                  </div>
                </div>
                <RoiTable rows={roi} />
              </section>

              <section {...lift()} className={`${admin.rise} ${admin.panel}`} aria-labelledby="t-cmp">
                <div className={admin.panelHead}>
                  <h2 className={admin.panelTitle} id="t-cmp"><ChartColumn aria-hidden size={16} /> Cheltuit față de câștig pe 12 luni</h2>
                  <ul className={styles.keys} aria-hidden>
                    <li><i style={{ background: "var(--bar-soft)" }} /> Cheltuit</li>
                    <li><i style={{ background: "var(--bar-strong)" }} /> Câștig estimat pe 12 luni</li>
                  </ul>
                </div>
                {rows.length ? (
                  <>
                    <ul className={styles.cmp}>
                      {rows.map((r, i) => (
                        <li key={r.label}>
                          <span className={styles.cmpLabel}>{r.label}</span>
                          <span className={styles.cmpBars} aria-hidden>
                            <span className={styles.cmpBar} data-kind="soft" style={{ width: `${Math.max(1, (r.spend / peak) * 100)}%`, "--i": i } as React.CSSProperties} />
                            <span className={styles.cmpBar} data-kind="strong" style={{ width: `${Math.max(1, ((r.wonMonthly * 12) / peak) * 100)}%`, "--i": i } as React.CSSProperties} />
                          </span>
                          <span className={styles.cmpValues}>{formatLei(r.spend)} <small>→</small> {formatLei(r.wonMonthly * 12)}</span>
                        </li>
                      ))}
                    </ul>
                    <table className={admin.srOnly}>
                      <caption>Cheltuit față de câștig estimat pe 12 luni</caption>
                      <thead><tr><th>Sursă</th><th>Cheltuit</th><th>Câștig estimat pe 12 luni</th></tr></thead>
                      <tbody>{rows.map((r) => <tr key={r.label}><td>{r.label}</td><td>{lei(r.spend)}</td><td>{lei(r.wonMonthly * 12)}</td></tr>)}</tbody>
                    </table>
                  </>
                ) : (
                  <p className={admin.muted}>Nicio sursă cu buget sau cereri în perioada aleasă.</p>
                )}
              </section>
            </div>
          );
        })()}

        {tab === "oferte" && (() => {
          const offers = offerStats(offerList, all, since);
          const subs = countBy(subscribers.filter((s) => s.status === "confirmed" && new Date(s.createdAt) >= since), (s) => s.channel);
          const subTotal = subs.reduce((sum, r) => sum + r.value, 0);
          return (
            <div className={styles.stack}>
              <div className={styles.miniKpis}>
                <div className={admin.rise} {...lift()}>
                  <Kpi icon={FileText} tone="blue" label="Oferte trimise" note={periodText(period)}><CountUp value={offers.sent} /></Kpi>
                </div>
                <div className={admin.rise} {...lift()}>
                  <Kpi icon={Trophy} tone="green" label="Oferte acceptate" note={`${offers.sent ? formatPercent(offers.accepted / offers.sent) : "-"} din cele trimise`}><CountUp value={offers.accepted} /></Kpi>
                </div>
                <div className={admin.rise} {...lift()}>
                  <Kpi icon={Wallet} tone="violet" label="Valoare acceptată" note={`${formatLei(offers.value.oneOff)} unic, fără TVA`}>
                    <CountUp value={Math.round(offers.value.monthly)} /> <small>lei/lună</small>
                  </Kpi>
                </div>
              </div>
              <div className={styles.twoCol}>
                <section {...lift()} className={`${admin.rise} ${admin.panel}`} aria-labelledby="t-of">
                  <div className={admin.panelHead}>
                    <h2 className={admin.panelTitle} id="t-of"><FileText aria-hidden size={16} /> Oferte pe sursă</h2>
                    <Link href="/admin/oferte/" className={`${admin.secondary} ${admin.small}`}>Toate ofertele</Link>
                  </div>
                  <DataTable
                    caption="Oferte pe sursă"
                    columns={["Sursă", "Trimise", "Acceptate", "Rată de acceptare"]}
                    rows={offers.byChannel.map((r) => ({ key: r.channel, cells: [{ t: r.channel }, { t: n(r.sent), s: r.sent }, { t: n(r.accepted), s: r.accepted }, { t: formatPercent(r.accepted / r.sent), s: r.accepted / r.sent }] }))}
                    initial={{ col: 1, dir: "desc" }}
                    empty="Nicio ofertă trimisă în perioada aleasă."
                  />
                </section>
                <section {...lift()} className={`${admin.rise} ${admin.panel}`} aria-labelledby="t-ab">
                  <div className={admin.panelHead}>
                    <h2 className={admin.panelTitle} id="t-ab"><Inbox aria-hidden size={16} /> Abonați newsletter pe sursă</h2>
                    <div className={admin.panelTools}>
                      <span className={admin.muted}>{n(subTotal)} confirmați</span>
                      <Link href="/admin/abonati/" className={`${admin.secondary} ${admin.small}`}>Toți abonații</Link>
                    </div>
                  </div>
                  <MiniBars rows={subs} limit={8} empty="Niciun abonat confirmat în perioada aleasă." />
                </section>
              </div>
            </div>
          );
        })()}
      </div>

      {hasDemo && (
        <p className={styles.note}>
          Raportul conține și date de test. Le puteți șterge din <Link href="/admin/setari/">Setări</Link>.
        </p>
      )}
    </>
  );
}

function Kpi({ icon: Icon, tone, label, note, children }: { icon: LucideIcon; tone: string; label: string; note: string; children: React.ReactNode }) {
  return (
    <div className={admin.stat}>
      <span className={admin.statIcon} data-tone={tone}><Icon aria-hidden size={18} /></span>
      <div className={admin.statBody}>
        <p className={admin.statLabel}>{label}</p>
        <p className={admin.statValue}>{children}</p>
        <p className={admin.statDelta}>{note}</p>
      </div>
    </div>
  );
}
