import { PageHeader } from "@/components/shared/page-header";
import { SubscriberDetail } from "@/components/subscribers/subscriber-detail";

export const metadata = {
  title: "Subscriber Detail | ISPNexus",
};

export default async function SubscriberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <PageHeader
        title="Subscriber Detail"
        description="Overview, usage telemetry, and linked ticket history."
      />
      <SubscriberDetail id={id} />
    </div>
  );
}
