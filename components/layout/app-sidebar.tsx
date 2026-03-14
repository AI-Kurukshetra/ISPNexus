"use client";

import { Building2, ChevronLeft, ChevronRight, LogOut, Settings, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import {
  canCollapseSidebar,
  getRoleLabel,
  normalizeUserRole,
} from "@/lib/auth/roles";
import { primaryNavItems, settingsNavItem } from "@/lib/constants";
import { useUiStore } from "@/store/ui.store";

import { NavLink } from "./nav-link";

function getInitials(name?: string | null) {
  const parts = (name ?? "ISP Operator")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function AppSidebar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);

  const role = normalizeUserRole(session?.user?.role);
  const canCollapse = canCollapseSidebar(role);
  const userName = session?.user?.name ?? "ISP Operator";
  const userRoleLabel = getRoleLabel(role);
  const initials = useMemo(() => getInitials(userName), [userName]);

  return (
    <aside
      className={`border-b border-white/60 bg-white/65 backdrop-blur-xl transition-all lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r ${isSidebarCollapsed ? "lg:w-24" : "lg:w-80"
        }`}
    >
      <div className="flex h-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-4 lg:py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-[20px] bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-strong))] p-3 text-white shadow-[0_16px_32px_rgba(9,58,83,0.22)]">
              <Building2 className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed ? (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950">ISPNexus</p>
                <p className="truncate text-xs uppercase tracking-[0.22em] text-slate-500">
                  Operator Console
                </p>
              </div>
            ) : null}
          </div>

          {canCollapse ? (
            <button
              type="button"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="ui-button-secondary hidden h-11 w-11 rounded-[16px] px-0 lg:inline-flex"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible">
          {primaryNavItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={isSidebarCollapsed} />
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-1 lg:pt-6">
          <NavLink item={settingsNavItem} collapsed={isSidebarCollapsed} />

          <div className="relative">
            <button
              type="button"
              title={userName}
              onClick={() => setIsMenuOpen((open) => !open)}
              className={`flex w-full items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 px-3 py-3 text-left shadow-[0_20px_38px_rgba(10,32,51,0.08)] transition hover:bg-white ${isSidebarCollapsed ? "justify-center px-2.5" : ""
                }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-strong))] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(9,58,83,0.2)]">
                {initials}
              </div>
              {!isSidebarCollapsed ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">{userName}</p>
                  <p className="truncate text-xs text-slate-500">{userRoleLabel}</p>
                </div>
              ) : null}
            </button>

            {isMenuOpen ? (
              <div className="absolute bottom-16 left-0 z-20 w-full rounded-[22px] border border-white/85 bg-white/95 p-2 shadow-[0_24px_48px_rgba(10,32,51,0.16)] backdrop-blur">
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-[16px] px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-[16px] px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-[16px] px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
