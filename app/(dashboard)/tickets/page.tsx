import { PageHeader } from "@/components/shared/page-header";
import { TicketList } from "@/components/tickets/ticket-list";

export const metadata = {
  title: "Tickets | ISPNexus",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    customerId?: string;
    deviceId?: string;
    title?: string;
    description?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <PageHeader
        title="Fault Tickets"
        description="Track incidents, create new tickets, and manage active faults."
      />
      <TicketList
        initialCreateValues={{
          customerId: params.customerId,
          deviceId: params.deviceId,
          title: params.title,
          description: params.description,
        }}
      />
    </div>
  );
}
