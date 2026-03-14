import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Analytics | ISPNexus",
};

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Growth, revenue, ticket volume, and network health intelligence."
      />
      <AnalyticsDashboard />
    </div>
  );
}
