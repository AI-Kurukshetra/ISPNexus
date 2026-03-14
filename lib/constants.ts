import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Boxes,
  LayoutDashboard,
  Network,
  Settings,
  Ticket,
  Users,
  UserRound,
  Wrench,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subscribers", href: "/subscribers", icon: UserRound },
  { label: "Devices", href: "/devices", icon: Network },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "Monitoring", href: "/monitoring", icon: Activity },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Work Orders", href: "/workorders", icon: Wrench },
  { label: "Inventory", href: "/inventory", icon: Boxes },
  { label: "Team", href: "/team", icon: Users },
];

export const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};
