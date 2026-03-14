"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getRoleLabel, normalizeUserRole } from "@/lib/auth/roles";
import { RecentSubscribersFeed } from "@/components/dashboard/recent-subscribers-feed";
import { RecentTicketsFeed } from "@/components/dashboard/recent-tickets-feed";
import { KpiCard } from "@/components/shared/kpi-card";
import { trpc } from "@/lib/trpc/client";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function roleFocusCopy(role: string) {
  if (role === "csr") {
    return "Subscriber lookup and active case updates are your fastest paths from here.";
  }

  if (role === "noc") {
    return "Focus on critical tickets, degraded devices, and the live monitoring view.";
  }

  return "You have full platform oversight across subscribers, tickets, and network health.";
}

export function DashboardClient() {
  const { data: session } = useSession();
  const role = normalizeUserRole(session?.user?.role);
  const roleLabel = getRoleLabel(role);
  const kpisQuery = trpc.dashboard.kpis.useQuery();

  if (kpisQuery.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[24px] border border-white/80 bg-white/70 shadow-[0_18px_36px_rgba(10,32,51,0.06)]"
          />
        ))}
      </div>
    );
  }

  if (kpisQuery.error || !kpisQuery.data) {
    return (
      <p className="ui-card-empty border-rose-200 bg-rose-50/80 text-rose-700">
        Could not load dashboard metrics. <Link href="/login" className="underline">Sign in again</Link>.
      </p>
    );
  }

  const data = kpisQuery.data;

  return (
    <div className="space-y-6">
      <section className="ui-panel">
        <p className="ui-eyebrow">{roleLabel} View</p>
        <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-slate-950 sm:text-[2rem]">
          Operational snapshot for {session?.user?.name ?? "your shift"}
        </h2>
        <p className="ui-copy mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]">
          {roleFocusCopy(role)}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Subscribers"
          value={String(data.activeSubscribers)}
          hint={`${data.activeSubscribersDelta >= 0 ? "+" : ""}${data.activeSubscribersDelta}% vs last month`}
        />
        <KpiCard
          label="Devices Online"
          value={`${data.onlineDevices}/${data.totalDevices}`}
          hint="Current device health"
        />
        <KpiCard
          label="Open Tickets"
          value={String(data.openTickets)}
          hint={`${data.criticalOpenTickets} critical`}
        />
        <KpiCard
          label="Monthly Revenue"
          value={formatCurrency(data.monthlyRevenue)}
          hint={`${data.revenueDelta >= 0 ? "+" : ""}${data.revenueDelta}% change`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="ui-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Trend</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Subscriber Growth</h3>
              <p className="ui-copy mt-1 text-sm">Growth momentum across recent reporting periods.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.subscriberGrowth}>
                <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--brand-primary)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="ui-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Capacity</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Bandwidth Utilization</h3>
              <p className="ui-copy mt-1 text-sm">Current usage levels across the most active links.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bandwidthUtilization}>
                <CartesianGrid stroke="rgba(16, 32, 51, 0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis tick={{ fill: "#6a7a8d", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="utilization" fill="var(--brand-accent)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RecentTicketsFeed tickets={data.recentTickets} />
        <RecentSubscribersFeed subscribers={data.recentSubscribers} />
      </section>
    </div>
  );
}
