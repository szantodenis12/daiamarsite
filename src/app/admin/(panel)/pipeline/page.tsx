import type { Metadata } from "next";
import Link from "next/link";
import { bucharestDay, OPEN_STATUSES } from "@/lib/crm";
import { db } from "@/lib/db";
import { getTeam } from "@/lib/settings";
import { formatAge, formatLei, serviceTitle } from "../../format";
import { pipelineValue } from "../../reports";
import { Board, type Card } from "./Board";
import admin from "../../admin.module.css";
import { requireSession } from "../../session";

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

const CLOSED_DAYS = 60;

type Props = { searchParams: Promise<{ assignee?: string }> };

export default async function PipelinePage({ searchParams }: Props) {
  await requireSession();
  const { assignee } = await searchParams;
  const [all, team] = await Promise.all([db().leadsSince(new Date(0)), getTeam()]);
  const closedSince = Date.now() - CLOSED_DAYS * 86400_000;
  const today = bucharestDay();
  const leads = all.filter(
    (l) =>
      (OPEN_STATUSES.includes(l.status) || new Date(l.updatedAt).getTime() >= closedSince) &&
      (!assignee || (assignee === "-" ? !l.assignee : l.assignee === assignee)),
  );
  const cards: Card[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
    service: serviceTitle(l.service),
    channel: l.channel,
    age: formatAge(l.createdAt),
    status: l.status,
    nextActionAt: l.nextActionAt,
    late: Boolean(l.nextActionAt && l.nextActionAt < today),
    monthlyValue: l.monthlyValue,
    oneOffValue: l.oneOffValue,
    assignee: l.assignee,
  }));
  const open = pipelineValue(leads);
  const filter = (value?: string) => (value ? `/admin/pipeline/?assignee=${encodeURIComponent(value)}` : "/admin/pipeline/");

  return (
    <>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>{open.count} deschise · {formatLei(open.monthly)}/lună în lucru</p>
          <h1 className={admin.h1}>Pipeline</h1>
        </div>
        {team.length > 0 && (
          <nav className={admin.segmented} aria-label="Asignat">
            <Link href={filter()} aria-current={!assignee ? "true" : undefined}>Toți</Link>
            {team.map((name) => <Link key={name} href={filter(name)} aria-current={assignee === name ? "true" : undefined}>{name}</Link>)}
            <Link href={filter("-")} aria-current={assignee === "-" ? "true" : undefined}>Neasignat</Link>
          </nav>
        )}
      </div>
      <Board key={assignee ?? ""} cards={cards} />
      <p className={admin.footnote}>Trageți cardurile între coloane sau alegeți statusul din card. Coloanele Client și Pierdut arată ultimele {CLOSED_DAYS} de zile.</p>
    </>
  );
}
