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
      className={`border-b border-slate-100 bg-white transition-all lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-slate-100 ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}
    >
      <div className="flex h-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-4 lg:py-6">
        <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "flex-col" : "justify-between"}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#0d5c7b] to-[#093a53] text-white shadow-[0_4px_12px_rgba(9,58,83,0.25)]">
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
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 lg:inline-flex"
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
              className={`flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-100 ${isSidebarCollapsed ? "justify-center px-2.5" : ""}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0d5c7b] to-[#093a53] text-xs font-bold text-white">
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
              <div className="absolute bottom-14 left-0 z-20 w-full rounded-xl border border-slate-100 bg-white p-1.5 shadow-[0_8px_32px_rgba(10,32,51,0.12)]">
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
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
