import { InventoryTable } from "@/components/inventory/inventory-table";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Inventory | ISPNexus",
};

export default function InventoryPage() {
  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track stock status and assignments for network assets."
      />
      <InventoryTable />
    </div>
  );
}
