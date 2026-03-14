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

  return (
    <article className="relative overflow-hidden rounded-[24px] border border-[rgba(16,32,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(242,248,251,0.92))] p-5 shadow-[0_24px_52px_rgba(10,32,51,0.08)]">
      <div className="absolute inset-x-auto right-[-38px] top-[-42px] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(13,92,123,0.16),transparent_70%)]" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p
        className={`mt-2 text-sm ${
          isPositive ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {hint}
      </p>
    </article>
  );
}
