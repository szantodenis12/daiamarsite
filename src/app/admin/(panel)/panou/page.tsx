import type { Metadata } from "next";
import Link from "next/link";
import { bucharestMonth } from "@/lib/crm";
import { db } from "@/lib/db";
import { deleteDemoData } from "../../actions/session";
import { formatLei, formatMonth, formatNumber, formatPercent, serviceTitle } from "../../format";
import { funnelTable, lostReasons, monthsFrom, offerStats, pipelineValue, roiTable, sumValue, wonByChannel, wonSince } from "../../reports";
import { channelOf, channelTable, countable, countBy, leadsOverTime, parsePeriod, periodStart, PERIODS, touchOf, type Period, type TouchMode } from "../../stats";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { Bars, TimeChart } from "../charts";
import { FunnelTable, RoiTable } from "../tables";
import styles from "../../admin.module.css";
import { requireSession } from "../../session";

export const metadata: Metadata = { title: "Panou" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ p?: string; t?: string }> };

export default async function Dashboard({ searchParams }: Props) {
  await requireSession();
  const params = await searchParams;
  const period = parsePeriod(params.p);
  const mode: TouchMode = params.t === "ft" ? "ft" : "lt";
  const since = periodStart(period);
  const [allLeads, events, spend, offerList, allSubscribers] = await Promise.all([db().leadsSince(new Date(0)), db().eventsSince(since), db().spend(), db().offers(), db().subscribers()]);
  const all = countable(allLeads);
  const subscribers = countable(allSubscribers);
  const leads = all.filter((l) => new Date(l.createdAt) >= since);

  const visits = events.filter((e) => e.kind === "visit").length;
  const calls = events.filter((e) => e.kind === "phone" || e.kind === "whatsapp").length;
  const channels = channelTable(leads, events, mode);
  const leadChannels = channels.filter((c) => c.leads > 0);
  const open = pipelineValue(all);
  const won = wonSince(all, since);
  const wonValue = sumValue(won);
  const offers = offerStats(offerList, all, since);
  const hasDemo = all.some((l) => l.demo) || events.some((e) => e.demo);

  const firstMonth = period === "all" ? [...spend.map((s) => s.month), ...all.map((l) => bucharestMonth(new Date(l.createdAt)))].sort()[0] : bucharestMonth(since);
  const months = monthsFrom(firstMonth ?? bucharestMonth());
  const roi = roiTable(all, spend, months);
  const href = (p: Period, t: TouchMode) => `/admin/panou/?p=${p}&t=${t}`;

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <p className={styles.kicker}>Panou</p>
          <h1 className={styles.h1}>De unde vin cererile</h1>
        </div>
        <div className={styles.actions}>
          <div className={styles.segmented} aria-label="Perioada">
            {(Object.keys(PERIODS) as Period[]).map((p) => (
              <Link key={p} href={href(p, mode)} aria-current={p === period ? "true" : undefined}>{PERIODS[p]}</Link>
            ))}
          </div>
          <div className={styles.segmented} aria-label="Atribuire">
            <Link href={href(period, "ft")} aria-current={mode === "ft" ? "true" : undefined}>Prima vizită</Link>
            <Link href={href(period, "lt")} aria-current={mode === "lt" ? "true" : undefined}>Ultima vizită</Link>
          </div>
        </div>
      </div>

      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Cereri</span>
          <strong>{formatNumber(leads.length)}</strong>
          <small>{formatNumber(calls)} clicuri pe telefon și WhatsApp</small>
        </div>
        <div className={styles.kpi}>
          <span>Rată de conversie</span>
          <strong>{visits ? formatPercent(leads.length / visits) : "-"}</strong>
          <small>{formatNumber(visits)} vizite</small>
        </div>
        <div className={styles.kpi}>
          <span>Valoare în lucru</span>
          <strong>{formatLei(open.monthly)}<small>/lună</small></strong>
          <small>{formatNumber(open.count)} cereri deschise{open.oneOff ? ` · ${formatLei(open.oneOff)} unic` : ""}</small>
        </div>
        <div className={styles.kpi}>
          <span>Câștigat în perioadă</span>
          <strong>{formatLei(wonValue.monthly)}<small>/lună</small></strong>
          <small>{formatNumber(wonValue.count)} clienți noi{wonValue.oneOff ? ` · ${formatLei(wonValue.oneOff)} unic` : ""}</small>
        </div>
      </section>

      <div className={styles.cards}>
        <section className={`${styles.card} ${styles.span2}`}>
          <h2 className={styles.h2}>Cereri pe canal</h2>
          <Bars
            rows={leadChannels.map((c) => ({ label: c.channel, value: c.leads }))}
            note={(row) => {
              const c = leadChannels.find((r) => r.channel === row.label);
              return c?.visits ? `· ${formatPercent(c.leads / c.visits)} din ${formatNumber(c.visits)} vizite` : "";
            }}
            empty="Nicio cerere în perioada aleasă."
          />
        </section>

        <section className={`${styles.card} ${styles.span2}`}>
          <h2 className={styles.h2}>Cereri în timp</h2>
          <TimeChart buckets={leadsOverTime(leads, period)} />
        </section>

        <section className={`${styles.card} ${styles.span2}`}>
          <div className={styles.cardHead}>
            <h2 className={styles.h2}>Buget și randament pe canal</h2>
            <span className={styles.muted}>
              {formatMonth(months[0])}{months.length > 1 ? ` – ${formatMonth(months[months.length - 1])}` : ""} · <Link href="/admin/buget/" className={styles.ghost}>Buget reclame</Link>
            </span>
          </div>
          <RoiTable rows={roi} />
          <p className={styles.footnote}>
            Luni întregi, ca bugetul. Cererile se numără după canalul ultimei vizite. Randamentul estimat = abonamentul lunar al clienților câștigați × 12, împărțit la buget. Este o estimare, nu un profit.
          </p>
        </section>

        <section className={`${styles.card} ${styles.span2}`}>
          <h2 className={styles.h2}>De la vizită la client</h2>
          <FunnelTable rows={funnelTable(leads, events, (row) => channelOf(row, mode))} />
          <p className={styles.footnote}>
            Procentele arată trecerea de la pasul anterior. Primul contact = timpul de la cerere până la prima notă, apel sau schimbare de status. Cererile adăugate manual nu intră în medie.
          </p>
        </section>

        <section className={`${styles.card} ${styles.span2}`}>
          <div className={styles.cardHead}>
            <h2 className={styles.h2}>Oferte</h2>
            <Link href="/admin/oferte/" className={styles.ghost}>Toate ofertele</Link>
          </div>
          <div className={styles.kpis}>
            <div className={styles.kpi}><span>Trimise</span><strong>{formatNumber(offers.sent)}</strong></div>
            <div className={styles.kpi}><span>Acceptate</span><strong>{formatNumber(offers.accepted)}</strong><small>{offers.sent ? formatPercent(offers.accepted / offers.sent) : "-"} din cele trimise</small></div>
            <div className={styles.kpi}><span>Valoare acceptată</span><strong>{formatLei(offers.value.monthly)}<small>/lună</small></strong><small>{formatLei(offers.value.oneOff)} unic, fără TVA</small></div>
          </div>
          {offers.byChannel.length > 0 && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Canal</th><th>Trimise</th><th>Acceptate</th><th>Rată de acceptare</th></tr></thead>
                <tbody>
                  {offers.byChannel.map((r) => (
                    <tr key={r.channel}><td>{r.channel}</td><td>{r.sent}</td><td>{r.accepted}</td><td>{formatPercent(r.accepted / r.sent)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>Câștigat pe canal <small>lei / lună</small></h2>
          <Bars rows={wonByChannel(won)} empty="Niciun client câștigat în perioada aleasă." />
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>De ce pierdem cereri</h2>
          <Bars rows={lostReasons(leads)} empty="Nicio cerere pierdută în perioada aleasă." />
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>Pe serviciu</h2>
          <Bars rows={countBy(leads, (l) => serviceTitle(l.service))} empty="Nicio cerere." />
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>Pe campanie (utm_campaign)</h2>
          <Bars rows={countBy(leads, (l) => touchOf(l, mode)?.utm_campaign)} empty="Nicio cerere cu campanie în perioada aleasă." />
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>Pe formular</h2>
          <Bars rows={countBy(leads, (l) => l.placement)} empty="Nicio cerere." />
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.h2}>Abonați newsletter pe canal</h2>
            <Link href="/admin/abonati/" className={styles.ghost}>Toți abonații</Link>
          </div>
          <Bars rows={countBy(subscribers.filter((s) => s.status === "confirmed" && new Date(s.createdAt) >= since), (s) => s.channel)} empty="Niciun abonat confirmat în perioada aleasă." />
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>Pe pagina de conversie</h2>
          <Bars rows={countBy(leads.filter((l) => l.page !== "-"), (l) => l.page)} empty="Nicio cerere de pe site." />
        </section>

        <section className={`${styles.card} ${styles.span2}`}>
          <h2 className={styles.h2}>Clicuri pe telefon, WhatsApp, email și hartă, pe canal</h2>
          {channels.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Canal</th><th>Vizite</th><th>Cereri</th><th>Telefon</th><th>WhatsApp</th><th>Email</th><th>Hartă</th></tr>
                </thead>
                <tbody>
                  {channels.map((c) => (
                    <tr key={c.channel}>
                      <td>{c.channel}</td>
                      <td>{formatNumber(c.visits)}</td>
                      <td>{formatNumber(c.leads)}</td>
                      <td>{formatNumber(c.phone)}</td>
                      <td>{formatNumber(c.whatsapp)}</td>
                      <td>{formatNumber(c.email)}</td>
                      <td>{formatNumber(c.maps)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.muted}>Nicio activitate în perioada aleasă.</p>
          )}
        </section>
      </div>

      <p className={styles.footnote}>
        {mode === "ft" ? "Prima vizită: canalul prin care persoana a ajuns prima dată pe site (ultimele 90 de zile)." : "Ultima vizită: canalul vizitei în care a trimis cererea sau a sunat."}
        {" "}Canalele se calculează din parametrii UTM, gclid/fbclid și site-ul de proveniență. Vizitele se numără o dată pe sesiune.
      </p>

      {hasDemo && (
        <form action={deleteDemoData} className={styles.demo}>
          <p>Panoul conține date demo, generate cu <code>npm run seed</code>.</p>
          <ConfirmButton
            label="Șterge datele demo"
            title="Ștergeți datele demo?"
            text="Se șterg toate cererile, vizitele, bugetele și linkurile marcate demo. Cererile reale rămân."
            confirmLabel="Șterge"
          />
        </form>
      )}
    </>
  );
}
