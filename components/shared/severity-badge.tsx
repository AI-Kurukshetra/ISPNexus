import { cn } from "@/lib/utils";

const severityClassMap: Record<string, string> = {
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-sky-200 bg-sky-50 text-sky-700",
};

export function SeverityBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        severityClassMap[value] ?? "border-slate-200 bg-slate-100 text-slate-700",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {value}
    </span>
  );
}
