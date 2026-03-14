export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 border-b border-slate-100 pb-5">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      <p className="mt-1.5 text-sm text-slate-500">{description}</p>
    </div>
  );
}
