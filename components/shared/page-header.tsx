export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <section className="ui-panel mb-6">
      <p className="ui-eyebrow">Operations Workspace</p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-slate-950 sm:text-[2.25rem]">{title}</h2>
          <p className="ui-copy mt-3 text-sm leading-6 sm:text-[15px]">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="ui-pill ui-pill-active">Live operations</span>
          <span className="ui-pill">Role-aware workflows</span>
          <span className="ui-pill">Field ready</span>
        </div>
      </div>
    </section>
  );
}
