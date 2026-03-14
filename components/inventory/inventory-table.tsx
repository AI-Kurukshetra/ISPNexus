"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";

type StatusFilter = "ALL" | "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";
type TypeFilter = "ALL" | "ONT" | "CABLE" | "TRANSCEIVER" | "ROUTER" | "TOOL";

export function InventoryTable() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");

  const listQuery = trpc.inventory.list.useQuery({ status, type });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as TypeFilter)}
          className="ui-select"
        >
          <option value="ALL">All Types</option>
          <option value="ONT">ONT</option>
          <option value="CABLE">Cable</option>
          <option value="TRANSCEIVER">Transceiver</option>
          <option value="ROUTER">Router</option>
          <option value="TOOL">Tool</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="ui-select"
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="IN_USE">In Use</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      <div className="ui-table-shell">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Serial</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {listQuery.isLoading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  Loading inventory...
                </td>
              </tr>
            ) : listQuery.error ? (
              <tr>
                <td className="px-4 py-6 text-rose-600" colSpan={6}>
                  Could not load inventory.
                </td>
              </tr>
            ) : listQuery.data?.length ? (
              listQuery.data.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.type}</td>
                  <td className="px-4 py-3 text-slate-700">{row.serialNumber ?? "N/A"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={row.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.assignedDevice ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.location ?? "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  No inventory records for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
