import { PageHeader } from "@/components/shared/page-header";
import { TicketDetail } from "@/components/tickets/ticket-detail";

export const metadata = {
  title: "Ticket Detail | ISPNexus",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <PageHeader
        title="Ticket Detail"
        description="Inspect fault context, update lifecycle state, and add timeline comments."
      />
      <TicketDetail id={id} />
    </div>
  );
}
