"use client";

import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";

type StatusFilter = "ALL" | "ONLINE" | "DEGRADED" | "OFFLINE";
type TypeFilter = "ALL" | "OLT" | "ONT" | "ROUTER" | "SWITCH";
type ViewMode = "CARD" | "TABLE";

const statusFilters: StatusFilter[] = ["ALL", "ONLINE", "DEGRADED", "OFFLINE"];
const typeFilters: TypeFilter[] = ["ALL", "OLT", "ONT", "ROUTER", "SWITCH"];

function formatDate(value: Date | string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DeviceList() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("CARD");

  const devicesQuery = trpc.devices.list.useQuery({
    status,
    type,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const count = devicesQuery.data?.statusCounts[filter] ?? 0;
            const isActive = status === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatus(filter)}
                className={isActive ? "ui-pill ui-pill-active" : "ui-pill"}
              >
                {filter} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TypeFilter)}
            className="ui-select"
          >
            {typeFilters.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>

          <div className="flex rounded-[18px] border border-white/80 bg-white/78 p-1 shadow-[0_10px_24px_rgba(10,32,51,0.05)]">
            <button
              type="button"
              onClick={() => setViewMode("CARD")}
              className={`rounded-[14px] px-3 py-2 text-xs font-semibold transition ${
                viewMode === "CARD"
                  ? "bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-strong))] text-white shadow-[0_10px_20px_rgba(9,58,83,0.16)]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Card
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`rounded-[14px] px-3 py-2 text-xs font-semibold transition ${
                viewMode === "TABLE"
                  ? "bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-strong))] text-white shadow-[0_10px_20px_rgba(9,58,83,0.16)]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {devicesQuery.isLoading ? (
        <div className="ui-card-empty text-slate-500">
          Loading devices...
        </div>
      ) : devicesQuery.error ? (
        <div className="ui-card-empty border-rose-200 bg-rose-50/80 text-rose-700">
          Could not load devices.
        </div>
      ) : !devicesQuery.data?.rows.length ? (
        <div className="ui-card-empty border-dashed border-slate-300 text-slate-500">
          No devices match current filters.
        </div>
      ) : viewMode === "CARD" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {devicesQuery.data.rows.map((device) => (
            <article
              key={device.id}
              className="ui-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/devices/${device.id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-[var(--brand-primary)]"
                  >
                    {device.vendor} {device.model}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {device.type} • {device.technology}
                  </p>
                </div>
                <StatusBadge value={device.status} />
              </div>

              <dl className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between gap-3">
                  <dt>IP Address</dt>
                  <dd className="font-medium text-slate-900">{device.ipAddress ?? "N/A"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Firmware</dt>
                  <dd className="font-medium text-slate-900">{device.firmwareVersion ?? "N/A"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Last Seen</dt>
                  <dd className="font-medium text-slate-900">{formatDate(device.lastSeenAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="ui-table-shell">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Type</th>
                <th>Status</th>
                <th>IP</th>
                <th>Firmware</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devicesQuery.data.rows.map((device) => (
                <tr key={device.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/devices/${device.id}`}
                      className="font-semibold text-slate-950 transition hover:text-[var(--brand-primary)]"
                    >
                      {device.vendor} {device.model}
                    </Link>
                    <p className="text-xs text-slate-500">{device.serialNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{device.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={device.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{device.ipAddress ?? "N/A"}</td>
                  <td className="px-4 py-3 text-slate-700">{device.firmwareVersion ?? "N/A"}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(device.lastSeenAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
