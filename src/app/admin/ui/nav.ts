import { CalendarCheck, ChartColumn, FileText, Inbox, MailCheck, QrCode, Settings, SquareKanban, Wallet, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; short?: string; icon: LucideIcon; badge?: boolean };

export const NAV: NavItem[] = [
  { href: "/admin/", label: "Azi", icon: CalendarCheck, badge: true },
  { href: "/admin/leads/", label: "Cereri", icon: Inbox },
  { href: "/admin/pipeline/", label: "Pipeline", icon: SquareKanban },
  { href: "/admin/panou/", label: "Panou", icon: ChartColumn },
  { href: "/admin/oferte/", label: "Oferte", icon: FileText },
  { href: "/admin/abonati/", label: "Abonați newsletter", short: "Abonați", icon: MailCheck },
  { href: "/admin/linkuri/", label: "Linkuri de campanie", short: "Linkuri", icon: QrCode },
  { href: "/admin/buget/", label: "Buget reclame", short: "Buget", icon: Wallet },
  { href: "/admin/setari/", label: "Setări", icon: Settings },
];

export const isActive = (pathname: string, href: string) => (href === "/admin/" ? pathname === href : pathname.startsWith(href));
