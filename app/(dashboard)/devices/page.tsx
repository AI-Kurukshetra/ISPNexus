import { DeviceList } from "@/components/devices/device-list";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Devices | ISPNexus",
};

export default function DevicesPage() {
  return (
    <div>
      <PageHeader
        title="Devices"
        description="Filter and inspect OLT, ONT, router, and switch health."
      />
      <DeviceList />
    </div>
  );
}
