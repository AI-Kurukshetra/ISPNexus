import { cn } from "@/lib/utils";

const statusClassMap: Record<string, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ONLINE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  SUSPENDED: "border-amber-200 bg-amber-50 text-amber-700",
  DEGRADED: "border-amber-200 bg-amber-50 text-amber-700",
  TERMINATED: "border-slate-200 bg-slate-100 text-slate-700",
  OFFLINE: "border-rose-200 bg-rose-50 text-rose-700",
  OPEN: "border-rose-200 bg-rose-50 text-rose-700",
  IN_PROGRESS: "border-sky-200 bg-sky-50 text-sky-700",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLOSED: "border-slate-200 bg-slate-100 text-slate-700",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        statusClassMap[value] ?? "border-slate-200 bg-slate-100 text-slate-700",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {value.replaceAll("_", " ")}
    </span>
  );
}
