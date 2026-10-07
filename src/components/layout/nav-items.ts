import {
  ArrowLeftRight,
  LayoutDashboard,
  PiggyBank,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions/", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets/", label: "Budgets", icon: PiggyBank },
  { href: "/settings/", label: "Settings", icon: Settings },
];

/** Pathnames may or may not carry a trailing slash depending on the host. */
export function isActivePath(pathname: string, href: string) {
  const normalize = (p: string) => p.replace(/\/+$/, "") || "/";
  return normalize(pathname) === normalize(href);
}
