"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

import { trpc } from "@/lib/trpc/client";

type Range = "7D" | "30D" | "90D" | "6M";

const rangeOptions: Range[] = ["7D", "30D", "90D", "6M"];
const pieColors = ["#22c55e", "#f59e0b", "#ef4444"];

function renderEmpty(text: string) {
  return <p className="text-sm text-slate-500">{text}</p>;
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<Range>("30D");
  const analyticsQuery = trpc.analytics.dashboard.useQuery({ range });

  const data = analyticsQuery.data;

  return (
    <div className="space-y-5">
      <section className="ui-card">
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={range === option ? "ui-pill ui-pill-active" : "ui-pill"}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {analyticsQuery.isLoading ? (
        <section className="ui-card-empty text-slate-500">
          Loading analytics...
        </section>
      ) : analyticsQuery.error || !data ? (
        <section className="ui-card-empty border-rose-200 bg-rose-50/80 text-rose-700">
          Could not load analytics data.
        </section>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="ui-card">
              <p className="ui-eyebrow">Growth</p>
              <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">Subscriber Growth</h3>
              {data.subscriberGrowth.length ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.subscriberGrowth}>
                      <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                      <XAxis dataKey="label" minTickGap={20} tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="var(--brand-primary)" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                renderEmpty("No growth data in selected range.")
              )}
            </article>

            <article className="ui-card">
              <p className="ui-eyebrow">Revenue</p>
              <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">Revenue Trend</h3>
              {data.revenueTrend.length ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueTrend}>
                      <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                      <XAxis dataKey="label" minTickGap={20} tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="var(--brand-accent)" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                renderEmpty("No revenue data in selected range.")
              )}
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="ui-card">
              <p className="ui-eyebrow">Ticketing</p>
              <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">Ticket Volume By Severity</h3>
              {data.ticketVolume.length ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.ticketVolume}>
                      <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                      <XAxis dataKey="label" minTickGap={20} tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="CRITICAL" stackId="severity" fill="#ef4444" />
                      <Bar dataKey="HIGH" stackId="severity" fill="#f97316" />
                      <Bar dataKey="MEDIUM" stackId="severity" fill="#f59e0b" />
                      <Bar dataKey="LOW" stackId="severity" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                renderEmpty("No ticket data in selected range.")
              )}
            </article>

            <article className="ui-card">
              <p className="ui-eyebrow">Health</p>
              <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">Device Health Distribution</h3>
              {data.deviceHealth.some((slice) => slice.value > 0) ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.deviceHealth} dataKey="value" nameKey="name" outerRadius={90} label>
                        {data.deviceHealth.map((slice, index) => (
                          <Cell key={slice.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                renderEmpty("No device health data available.")
              )}
            </article>
          </section>

          <section className="ui-card">
            <p className="ui-eyebrow">Usage</p>
            <h3 className="mb-4 mt-2 text-lg font-semibold text-slate-950">
              Top Subscribers By Bandwidth
            </h3>
            {data.topSubscribers.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topSubscribers} layout="vertical">
                    <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={160} tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="bandwidth" fill="var(--brand-primary)" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              renderEmpty("No subscriber bandwidth records available.")
            )}
          </section>
        </>
      )}
    </div>
  );
}
