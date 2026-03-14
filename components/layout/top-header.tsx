import { LogOut } from "lucide-react";

import { getRoleLabel } from "@/lib/auth/roles";
import { signOut } from "@/auth";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TopHeader({
  title,
  subtitle,
  userName,
  userRole,
}: {
  title: string;
  subtitle: string;
  userName: string;
  userRole?: string;
}) {
  const roleLabel = getRoleLabel(userRole);
  const initials = getInitials(userName);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <div className="ui-content flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-800">{title}</h1>
          <p className="truncate text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0d5c7b] to-[#093a53] text-[11px] font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold leading-none text-slate-800">{userName}</p>
              <p className="mt-0.5 text-[11px] leading-none text-slate-400">{roleLabel}</p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
