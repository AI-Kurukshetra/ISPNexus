import { PageHeader } from "@/components/shared/page-header";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="ui-card-empty border-dashed border-slate-300 p-8 text-sm text-slate-600">
        This section is scaffolded and ready for feature implementation.
      </div>
    </div>
  );
}
