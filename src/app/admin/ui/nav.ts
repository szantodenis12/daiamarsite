import { CalendarCheck, ChartColumn, FileText, Inbox, MailCheck, QrCode, Settings, Wallet, type LucideIcon } from "lucide-react";

export type NavLeaf = {
  href: string;
  label: string;
  /** Path prefixes that light this item up (defaults to href). */
  match?: string[];
  /** Prefixes that belong to a sibling and must not light this one up. */
  not?: string[];
  /** Title in the top bar. */
  title?: string;
};
export type NavItem = NavLeaf & { icon: LucideIcon; badge?: boolean; short?: string; children?: NavLeaf[] };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin/", label: "Acasă", icon: CalendarCheck, badge: true, match: [] },
      {
        href: "/admin/leads/",
        label: "Cereri",
        icon: Inbox,
        children: [
          { href: "/admin/leads/", label: "Toate cererile", title: "Cereri", not: ["/admin/leads/nou/"] },
          { href: "/admin/pipeline/", label: "Pe etape", title: "Cereri pe etape" },
          { href: "/admin/leads/nou/", label: "Adaugă cerere" },
        ],
      },
      {
        href: "/admin/oferte/",
        label: "Oferte",
        icon: FileText,
        children: [
          { href: "/admin/oferte/", label: "Toate ofertele", title: "Oferte", not: ["/admin/oferte/noua/"] },
          { href: "/admin/oferte/noua/", label: "Ofertă nouă" },
        ],
      },
      { href: "/admin/panou/", label: "Rapoarte", icon: ChartColumn },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/abonati/", label: "Abonați newsletter", short: "Abonați", icon: MailCheck },
      { href: "/admin/linkuri/", label: "Linkuri și coduri QR", short: "Linkuri", icon: QrCode },
      { href: "/admin/buget/", label: "Buget reclame", short: "Buget", icon: Wallet },
    ],
  },
  { label: "Setări", items: [{ href: "/admin/setari/", label: "Setări", icon: Settings }] },
];

export const isActive = (pathname: string, item: NavLeaf) => {
  if (item.not?.some((p) => pathname.startsWith(p))) return false;
  if (item.href === "/admin/" && !item.match) return pathname === item.href;
  if (item.match && !item.match.length) return pathname === item.href;
  return (item.match ?? [item.href]).some((p) => pathname.startsWith(p));
};

export const isGroupActive = (pathname: string, item: NavItem) => (item.children ? item.children.some((c) => isActive(pathname, c)) : isActive(pathname, item));

/** Title shown in the top bar, taken from the nav config. Detail pages fall back to a section word. */
export function pageTitle(pathname: string): string {
  const leaves: NavLeaf[] = NAV_GROUPS.flatMap((g) => g.items.flatMap((i) => i.children ?? [i]));
  const hit = leaves.filter((l) => l.href !== "/admin/").find((l) => isActive(pathname, l));
  if (pathname === "/admin/") return "Acasă";
  if (/^\/admin\/leads\/\d+/.test(pathname)) return "Cerere";
  if (/^\/admin\/oferte\/\d+/.test(pathname)) return "Ofertă";
  return hit ? (hit.title ?? hit.label) : "Admin";
}

/** Flat list used by the mobile bottom bar. */
export const MOBILE_MAIN = [
  { href: "/admin/", label: "Acasă", icon: CalendarCheck, badge: true, item: NAV_GROUPS[0].items[0] },
  { href: "/admin/leads/", label: "Cereri", icon: Inbox, item: NAV_GROUPS[0].items[1] },
  { href: "/admin/oferte/", label: "Oferte", icon: FileText, item: NAV_GROUPS[0].items[2] },
  { href: "/admin/panou/", label: "Rapoarte", icon: ChartColumn, item: NAV_GROUPS[0].items[3] },
];
