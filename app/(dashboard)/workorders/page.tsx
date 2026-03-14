import { PageHeader } from "@/components/shared/page-header";
import { WorkOrdersDashboard } from "@/components/workorders/workorders-dashboard";

export const metadata = {
  title: "Work Orders | ISPNexus",
};

export default function WorkOrdersPage() {
  return (
    <div>
      <PageHeader
        title="Work Orders"
        description="Create, assign, and track field operations with inline status updates."
      />
      <WorkOrdersDashboard />
    </div>
  );
}
