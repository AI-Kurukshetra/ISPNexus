"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";

type MetricsTab = "BANDWIDTH" | "LATENCY";

function formatDate(value: Date | string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DeviceDetail({ id }: { id: string }) {
  const [tab, setTab] = useState<MetricsTab>("BANDWIDTH");
  const deviceQuery = trpc.devices.byId.useQuery({ id });

  if (deviceQuery.isLoading) {
    return (
      <div className="ui-card-empty text-slate-500">
        Loading device detail...
      </div>
    );
  }

  if (deviceQuery.error) {
    return (
      <div className="ui-card-empty border-rose-200 bg-rose-50/80 text-rose-700">
        Could not load device details.
      </div>
    );
  }

  if (!deviceQuery.data) {
    return (
      <div className="ui-card-empty text-slate-500">
        Device not found.
      </div>
    );
  }

  const device = deviceQuery.data;
  const locationLabel =
    device.locationLat !== null && device.locationLng !== null
      ? `${device.locationLat.toFixed(4)}, ${device.locationLng.toFixed(4)}`
      : "N/A";

  return (
    <div className="space-y-5">
      <section className="ui-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--brand-primary)]">Device Profile</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              {device.vendor} {device.model}
            </h2>
            <p className="text-sm text-slate-500">Serial: {device.serialNumber}</p>
          </div>
          <StatusBadge value={device.status} />
        </div>
      </section>

      <section className="ui-card grid gap-4 text-sm text-slate-700 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
          <p className="mt-1 font-medium text-slate-900">{device.type}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Technology</p>
          <p className="mt-1 font-medium text-slate-900">{device.technology}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">IP Address</p>
          <p className="mt-1 font-medium text-slate-900">{device.ipAddress ?? "N/A"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Firmware Version</p>
          <p className="mt-1 font-medium text-slate-900">{device.firmwareVersion ?? "N/A"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Install Date</p>
          <p className="mt-1 font-medium text-slate-900">{formatDate(device.installDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Location (lat,lng)</p>
          <p className="mt-1 font-medium text-slate-900">{locationLabel}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Config Version</p>
          <p className="mt-1 font-medium text-slate-900">{device.configVersion ?? "N/A"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Last Config Backup</p>
          <p className="mt-1 font-medium text-slate-900">{formatDate(device.lastSeenAt)}</p>
        </div>
        {device.assignedSubscriber ? (
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Assigned Subscriber</p>
            <Link
              href={`/subscribers/${device.assignedSubscriber.id}`}
              className="mt-1 inline-block font-semibold text-[var(--brand-primary)] hover:underline"
            >
              {device.assignedSubscriber.fullName}
            </Link>
          </div>
        ) : null}
      </section>

      <section className="ui-card">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("BANDWIDTH")}
            className={tab === "BANDWIDTH" ? "ui-pill ui-pill-active" : "ui-pill"}
          >
            Bandwidth
          </button>
          <button
            type="button"
            onClick={() => setTab("LATENCY")}
            className={tab === "LATENCY" ? "ui-pill ui-pill-active" : "ui-pill"}
          >
            Latency
          </button>
        </div>

        {tab === "BANDWIDTH" ? (
          device.bandwidthSeries.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={device.bandwidthSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" minTickGap={32} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    dataKey="bandwidthDown"
                    stroke="var(--brand-primary)"
                    strokeWidth={2}
                    dot={false}
                    name="Download"
                  />
                  <Line
                    dataKey="bandwidthUp"
                    stroke="var(--brand-accent)"
                    strokeWidth={2}
                    dot={false}
                    name="Upload"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No bandwidth telemetry available.</p>
          )
        ) : device.latencySeries.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={device.latencySeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" minTickGap={32} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="var(--brand-primary)"
                  fill="var(--brand-primary)"
                  fillOpacity={0.2}
                  name="Latency"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No latency telemetry available.</p>
        )}
      </section>
    </div>
  );
}
