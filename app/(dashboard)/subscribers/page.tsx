import { PageHeader } from "@/components/shared/page-header";
import { SubscriberTable } from "@/components/subscribers/subscriber-table";

export const metadata = {
  title: "Subscribers | ISPNexus",
};

export default function SubscribersPage() {
  return (
    <div>
      <PageHeader
        title="Subscribers"
        description="Search, filter, and inspect customer subscriptions."
      />
      <SubscriberTable />
    </div>
  );
}
