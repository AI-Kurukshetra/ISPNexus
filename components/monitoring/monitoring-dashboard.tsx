"use client";

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

import { SeverityBadge } from "@/components/shared/severity-badge";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

function formatNumber(value: number, suffix: string) {
  return `${value.toFixed(1)} ${suffix}`;
}

function formatMetric(value: number | null | undefined, suffix: string) {
  if (value === null || value === undefined) {
    return "—";
  }

  return formatNumber(value, suffix);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MonitoringDashboard() {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  const devicesQuery = trpc.monitoring.devices.useQuery();
  const selectedDeviceId = deviceId ?? devicesQuery.data?.[0]?.id;

  const metricsQuery = trpc.monitoring.metrics.useQuery(
    { deviceId: selectedDeviceId },
    {
      enabled: Boolean(selectedDeviceId),
      refetchInterval: 30_000,
    },
  );

  const summary = metricsQuery.data?.summary;

  return (
    <div className="space-y-5">
      <section className="ui-card">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDeviceId ?? ""}
            onChange={(event) => setDeviceId(event.target.value || undefined)}
            className="ui-select"
          >
            {(devicesQuery.data ?? []).map((device) => (
              <option key={device.id} value={device.id}>
                {device.vendor} {device.model} ({device.type})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => metricsQuery.refetch()}
            className="ui-button-secondary"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="ui-card">
          <p className="ui-eyebrow">Current Download</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatMetric(summary?.currentDownload, "Mbps")}
          </p>
        </article>
        <article className="ui-card">
          <p className="ui-eyebrow">Current Upload</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatMetric(summary?.currentUpload, "Mbps")}
          </p>
        </article>
        <article className="ui-card">
          <p className="ui-eyebrow">Avg Latency</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatMetric(summary?.avgLatency, "ms")}
          </p>
        </article>
        <article className="ui-card">
          <p className="ui-eyebrow">Packet Loss</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatMetric(summary?.packetLoss, "%")}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="ui-card">
          <p className="ui-eyebrow">Bandwidth</p>
          <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">Download vs Upload</h3>
          {metricsQuery.data?.bandwidthSeries.length ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsQuery.data.bandwidthSeries}>
                  <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" minTickGap={32} tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="download"
                    stroke="var(--brand-primary)"
                    strokeWidth={3}
                    dot={false}
                    name="Download"
                  />
                  <Line
                    type="monotone"
                    dataKey="upload"
                    stroke="var(--brand-accent)"
                    strokeWidth={3}
                    dot={false}
                    name="Upload"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No bandwidth telemetry available.</p>
          )}
        </article>

        <article className="ui-card">
          <p className="ui-eyebrow">Latency</p>
          <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">Response Time Trend</h3>
          {metricsQuery.data?.latencySeries.length ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricsQuery.data.latencySeries}>
                  <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" minTickGap={32} tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="var(--brand-primary)"
                    fill="var(--brand-primary)"
                    fillOpacity={0.18}
                    name="Latency"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No latency telemetry available.</p>
          )}
        </article>
      </section>

      <section className="ui-card">
        <p className="ui-eyebrow">Alert Events</p>
        <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">Threshold breaches and acknowledgements</h3>
        {metricsQuery.data?.alerts.length ? (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Threshold</th>
                  <th>Severity</th>
                  <th>Acknowledged</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {metricsQuery.data.alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-3 py-2 text-slate-700">{alert.metric}</td>
                    <td className="px-3 py-2 text-slate-700">{alert.value}</td>
                    <td className="px-3 py-2 text-slate-700">{alert.threshold}</td>
                    <td className="px-3 py-2">
                      <SeverityBadge value={alert.severity} />
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {alert.acknowledged ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{formatDate(alert.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No recent alerts for this device.</p>
        )}
      </section>
    </div>
  );
}
