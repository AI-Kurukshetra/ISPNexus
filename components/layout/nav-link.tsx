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
        "group relative flex items-center gap-3 rounded-[18px] border px-3 py-3 text-sm font-medium transition duration-200",
        collapsed && "justify-center px-2.5 lg:px-2.5",
        isActive
          ? "border-[rgba(13,92,123,0.18)] bg-[linear-gradient(135deg,rgba(13,92,123,0.14),rgba(255,255,255,0.92))] text-[var(--brand-primary)] shadow-[0_14px_28px_rgba(13,92,123,0.10)]"
          : "border-transparent bg-white/55 text-slate-600 hover:border-white/80 hover:bg-white/92 hover:text-slate-950",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-[14px] border border-white/70 bg-white/85 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition group-hover:text-[var(--brand-primary)]",
          isActive &&
            "border-transparent bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-strong))] text-white shadow-[0_12px_24px_rgba(9,58,83,0.2)]",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed ? (
        <span className="truncate">
          {item.label}
        </span>
      ) : null}
    </Link>
  );
}
