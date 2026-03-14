"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl border border-slate-100 bg-white" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-white" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl border border-slate-100 bg-white" />
          <div className="h-80 animate-pulse rounded-2xl border border-slate-100 bg-white" />
        </div>
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
      <div className="rounded-2xl border border-[rgba(13,92,123,0.10)] bg-[linear-gradient(135deg,rgba(13,92,123,0.06),#ffffff_50%)] px-6 py-5">
        <p className="ui-eyebrow">{roleLabel} View</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Operator"}
        </h2>
        <p className="mt-1 max-w-xl text-sm text-slate-500">{roleFocusCopy(role)}</p>
      </div>

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
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Trend</p>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900">Subscriber Growth</h3>
              <p className="mt-0.5 text-xs text-slate-400">Growth across recent reporting periods.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.subscriberGrowth}>
                <defs>
                  <linearGradient id="subscriberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d5c7b" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0d5c7b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(16, 32, 51, 0.05)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(16,32,51,0.08)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(10,32,51,0.10)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="total" stroke="#0d5c7b" strokeWidth={2.5} fill="url(#subscriberGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="ui-card">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="ui-eyebrow">Capacity</p>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900">Bandwidth Utilization</h3>
              <p className="mt-0.5 text-xs text-slate-400">Current usage across the most active links.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bandwidthUtilization}>
                <CartesianGrid stroke="rgba(16, 32, 51, 0.05)" strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(16,32,51,0.08)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(10,32,51,0.10)", fontSize: "12px" }} />
                <Bar dataKey="utilization" fill="#f08a24" radius={[6, 6, 0, 0]} />
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
