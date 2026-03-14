import { PageHeader } from "@/components/shared/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";

export const metadata = {
  title: "Settings | ISPNexus",
};

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Operator profile and key configuration metadata."
      />
      <SettingsPanel />
    </div>
  );
}
