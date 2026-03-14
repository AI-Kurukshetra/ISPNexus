"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function NavLink({
  item,
  collapsed = false,
}: {
  item: NavItem;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150",
        collapsed && "justify-center",
        isActive
          ? "bg-[#0d5c7b]/10 text-[#0d5c7b]"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          isActive
            ? "bg-[#0d5c7b] text-white shadow-[0_4px_12px_rgba(13,92,123,0.25)]"
            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed ? (
        <span className="truncate">{item.label}</span>
      ) : null}
    </Link>
  );
}
