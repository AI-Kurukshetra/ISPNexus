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
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="ui-content flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <p className="ui-eyebrow">Command Center</p>
          <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-slate-950 sm:text-[2rem]">
                {title}
              </h1>
              <p className="ui-copy mt-1 max-w-2xl text-sm sm:text-[15px]">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)] shadow-[0_12px_24px_rgba(10,32,51,0.08)]">
            {roleLabel}
          </div>

          <div className="flex items-center gap-3 rounded-[22px] border border-white/80 bg-white/78 px-3 py-2 shadow-[0_18px_38px_rgba(10,32,51,0.08)] backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-strong))] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(9,58,83,0.22)]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{userName}</p>
              <p className="truncate text-xs text-slate-500">{roleLabel}</p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="ui-button-secondary min-w-[108px]">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
