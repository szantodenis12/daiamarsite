import { images, type SiteImage } from "@/lib/images";
import { BadgeCheck, Briefcase, Calculator, ClipboardCheck, FileText, Gavel, Globe, Landmark, LifeBuoy, ShieldCheck, Users, type LucideIcon } from "lucide-react";

export const icons: Record<string, LucideIcon> = {
  contabilitate: Calculator,
  "salarizare-resurse-umane": Users,
  "consultanta-fiscala": Landmark,
  "reprezentare-controale-anaf": ShieldCheck,
  "audit-intern-extern": ClipboardCheck,
  "infiintari-lichidari-firme": Briefcase,
  "rambursari-tva-ue": Globe,
  "formulare-a1": FileText,
  "permise-de-munca": BadgeCheck,
  "firme-cu-probleme-financiare": LifeBuoy,
  "servicii-juridice": Gavel,
};

export const photos: Record<string, SiteImage> = {
  contabilitate: images.calculatorLaptop,
  "salarizare-resurse-umane": images.birouColegi,
  "consultanta-fiscala": images.calculatorNotite,
  "reprezentare-controale-anaf": images.monicaControl,
  "audit-intern-extern": images.birouDocumente,
  "infiintari-lichidari-firme": images.strangereMana,
  "rambursari-tva-ue": images.birouLaptop,
  "formulare-a1": images.birouDoiColegi,
  "permise-de-munca": images.intalnire,
  "firme-cu-probleme-financiare": images.contabilLaptop,
  "servicii-juridice": images.documenteMasa,
};
