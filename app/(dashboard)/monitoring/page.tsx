import { MonitoringDashboard } from "@/components/monitoring/monitoring-dashboard";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Monitoring | ISPNexus",
};

export default function MonitoringPage() {
  return (
    <div>
      <PageHeader
        title="Monitoring"
        description="Live telemetry, health snapshots, and recent alert events per device."
      />
      <MonitoringDashboard />
    </div>
  );
}
