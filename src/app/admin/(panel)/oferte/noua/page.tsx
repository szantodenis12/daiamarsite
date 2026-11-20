import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getOfferSettings, getTemplates } from "@/lib/offer-store";
import type { OfferDoc } from "@/lib/offers";
import { getTeam } from "@/lib/settings";
import { services } from "@/lib/site";
import { currentAuthor, requireSession } from "../../../session";
import { OfferBuilder } from "../OfferBuilder";
import admin from "../../../admin.module.css";

export const metadata: Metadata = { title: "Ofertă nouă" };
export const dynamic = "force-dynamic";

const MONTHLY_SERVICES = ["contabilitate", "salarizare-resurse-umane"];

type Props = { searchParams: Promise<{ lead?: string }> };

export default async function NewOfferPage({ searchParams }: Props) {
  await requireSession();
  const leadId = Number((await searchParams).lead);
  const [lead, settings, templates, team, author] = await Promise.all([
    Number.isInteger(leadId) && leadId > 0 ? db().getLead(leadId) : null,
    getOfferSettings(),
    getTemplates(),
    getTeam(),
    currentAuthor(),
  ]);
  const service = services.find((s) => s.slug === lead?.service);
  const recurring = Boolean(service && MONTHLY_SERVICES.includes(service.slug));

  const initial: OfferDoc = {
    clientName: lead?.name ?? "",
    clientCompany: lead?.company ?? "",
    clientEmail: lead?.email ?? "",
    intro: settings.intro,
    items: service ? [{ service: service.slug, title: service.title, description: "", quantity: 1, unit: recurring ? "lună" : "serviciu", price: null, recurring }] : [],
    discount: 0,
    vatMode: "plus",
    vatRate: settings.vatRate,
    validDays: 30,
    paymentTerms: settings.paymentTerms,
    notes: "",
    preparedBy: team.includes(author) ? author : "",
  };

  return (
    <>
      <Link href={lead ? `/admin/leads/${lead.id}/` : "/admin/oferte/"} className={admin.back}>
        <ArrowLeft aria-hidden size={16} /> {lead ? lead.name : "Toate ofertele"}
      </Link>
      <div className={admin.pageHead}>
        <div>
          <p className={admin.kicker}>{lead ? `Pentru cererea #${lead.id}` : "Fără cerere legată"}</p>
          <h1 className={admin.h1}>Ofertă nouă</h1>
        </div>
      </div>
      <OfferBuilder offerId={null} leadId={lead?.id ?? null} initial={initial} templates={templates} team={team} />
    </>
  );
}
