import { DeviceDetail } from "@/components/devices/device-detail";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Device Detail | ISPNexus",
};

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <PageHeader
        title="Device Detail"
        description="Model profile, assignment, and telemetry for the selected device."
      />
      <DeviceDetail id={id} />
    </div>
  );
}
