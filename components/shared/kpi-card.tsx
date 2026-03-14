import { TrendingDown, TrendingUp } from "lucide-react";

const ACCENT_BARS: Record<string, string> = {
  "Active Subscribers": "#0d5c7b",
  "Devices Online": "#10b981",
  "Open Tickets": "#f08a24",
  "Monthly Revenue": "#8b5cf6",
};

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  const isPositive = hint.trim().startsWith("+");
  const isNegative = Boolean(hint.trim().match(/^-\d/));
  const bar = ACCENT_BARS[label] ?? "#0d5c7b";

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_1px_4px_rgba(10,32,51,0.06),0_8px_20px_rgba(10,32,51,0.04)] transition-shadow hover:shadow-[0_4px_24px_rgba(10,32,51,0.10)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
        style={{ background: bar }}
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-[2rem] font-bold leading-none tracking-tight text-slate-900">
        {value}
      </p>
      <div
        className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${isPositive ? "text-emerald-600" : isNegative ? "text-rose-500" : "text-slate-400"
          }`}
      >
        {isPositive && <TrendingUp aria-hidden className="h-3.5 w-3.5 shrink-0" />}
        {isNegative && <TrendingDown aria-hidden className="h-3.5 w-3.5 shrink-0" />}
        <span>{hint}</span>
      </div>
    </article>
  );
}
