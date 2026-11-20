import type { Metadata } from "next";
import { company } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import LanguagePage, { type LanguageContent } from "../_shared/LanguagePage";

const title = "Accounting services in Oradea, Romania";
const description =
  "Daiamar: CECCAR member accounting firm in Oradea, Romania. Over 20 years of experience within ANAF, representation during tax inspections, audit, payroll.";

export const metadata: Metadata = pageMeta({ title, description, path: "/en/", languages: { ro: "/", en: "/en/", it: "/it/", "x-default": "/" } });

// A1 forms and work permits stay under "Other services".
const content: LanguageContent = {
  lang: "en",
  title: "Accounting services in Oradea",
  intro: (
    <>
      Daiamar is a CECCAR member accounting firm in Oradea, Romania, at {company.street}. Over 20 years of experience within ANAF,
      the tax inspection division. Representation during ANAF inspections, internal and external audit, accounting, tax consulting,
      human resources and legal services. We work in Romanian, English and Italian.
    </>
  ),
  servicesHeading: "What does Daiamar do?",
  services: [
    { title: "Accounting services", text: "Bookkeeping for companies and sole traders (PFA, ÎI), adapted to the activity." },
    { title: "Consulting services", text: "Cost analysis, tax optimisation, payment rescheduling files, representation during ANAF inspections." },
    { title: "Internal and external audit", text: "Audit for companies; the scope is agreed with each client." },
    { title: "Human resources", text: "Payroll, personnel administration, the general register of employees." },
    { title: "Legal services", text: "Company formation, company changes, litigation through partner lawyers." },
  ],
  otherKicker: "Other services",
  other: ["VAT reimbursement from EU member countries", "Obtaining A1 forms", "Obtaining work permits for EU and non-EU citizens"],
  workHeading: "How do we work?",
  values: "Respect and loyalty towards our clients, quality and performance, continuous improvement of the Daiamar members.",
  approach:
    "With a thorough knowledge of the legislation and continuous monitoring of legal, accounting and tax changes, the Daiamar experts offer their clients integrated accounting, tax and economic solutions, closely correlated with the clients' needs and with European and global economic trends.",
  closing: "Monica Diana Pop spent over 20 years in the tax audit division of ANAF.",
  description,
  path: "/en/",
  contactHeading: "In need of help? Contact us!",
  contactText: "Call us, or send a request through the contact form and we will reply in English.",
  requestLabel: "Send a request",
  labels: { email: "E-mail", address: "Address", languages: "Languages" },
  languages: "Romanian, English, Italian",
};

export default function EnPage() {
  return <LanguagePage content={content} />;
}
