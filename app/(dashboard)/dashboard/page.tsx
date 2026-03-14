import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Dashboard | ISPNexus",
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Overview Dashboard"
        description="Operational KPIs, ticket activity, and current network health."
      />
      <DashboardClient />
    </div>
  );
}
