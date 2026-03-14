"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  canManageSubscribers,
  normalizeUserRole,
} from "@/lib/auth/roles";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";

type DetailTab = "OVERVIEW" | "USAGE" | "TICKETS";
type SubscriberStatus = "ACTIVE" | "SUSPENDED" | "TERMINATED";

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "USAGE", label: "Usage" },
  { id: "TICKETS", label: "Tickets" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusAction(status: SubscriberStatus) {
  if (status === "ACTIVE") {
    return {
      nextStatus: "SUSPENDED" as const,
      label: "Suspend",
      tone: "default" as const,
      description: "Suspend this subscriber's service and pause the linked subscription.",
    };
  }

  if (status === "SUSPENDED") {
    return {
      nextStatus: "ACTIVE" as const,
      label: "Reactivate",
      tone: "default" as const,
      description: "Reactivate service for this subscriber and restore the linked subscription.",
    };
  }

  return null;
}

export function SubscriberDetail({ id }: { id: string }) {
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const role = normalizeUserRole(session?.user?.role);
  const canEditSubscriber = canManageSubscribers(role);

  const [activeTab, setActiveTab] = useState<DetailTab>("OVERVIEW");
  const [pendingStatus, setPendingStatus] = useState<SubscriberStatus | null>(null);
  const detailQuery = trpc.subscribers.byId.useQuery({ id });

  const updateStatusMutation = trpc.subscribers.updateStatus.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Status updated to ${variables.status}`);
      setPendingStatus(null);
      void Promise.all([
        utils.subscribers.byId.invalidate({ id }),
        utils.subscribers.list.invalidate(),
        utils.dashboard.kpis.invalidate(),
      ]);
    },
  });

  const overviewContent = useMemo(() => {
    if (!detailQuery.data) {
      return null;
    }

    return (
      <div className="ui-card grid gap-4 text-sm text-slate-700 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
          <p className="mt-1 font-medium text-slate-900">{detailQuery.data.address || "Not set"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Activation Date</p>
          <p className="mt-1 font-medium text-slate-900">{formatDate(detailQuery.data.activationDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Plan</p>
          <p className="mt-1 font-medium text-slate-900">
            {detailQuery.data.plan
              ? `${detailQuery.data.plan.name} (${detailQuery.data.plan.speedDown}/${detailQuery.data.plan.speedUp} Mbps)`
              : "No active subscription"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Monthly Value</p>
          <p className="mt-1 font-medium text-slate-900">
            {detailQuery.data.plan ? formatCurrency(detailQuery.data.plan.priceMonthly) : "$0"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Assigned Device</p>
          {detailQuery.data.device ? (
            <Link
              href={`/devices/${detailQuery.data.device.id}`}
              className="mt-1 inline-block font-semibold text-[var(--brand-primary)] hover:underline"
            >
              {detailQuery.data.device.vendor} {detailQuery.data.device.model}
            </Link>
          ) : (
            <p className="mt-1 text-slate-500">No device assigned</p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Subscription Status</p>
          <div className="mt-1">
            <StatusBadge value={detailQuery.data.plan?.status ?? "TERMINATED"} />
          </div>
        </div>
        {detailQuery.data.phone ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
            <p className="mt-1 font-medium text-slate-900">{detailQuery.data.phone}</p>
          </div>
        ) : null}
      </div>
    );
  }, [detailQuery.data]);

  const usageContent = useMemo(() => {
    if (!detailQuery.data) {
      return null;
    }

    if (detailQuery.data.usageSeries.length === 0) {
      return (
        <div className="ui-card-empty border-dashed border-slate-300 p-8 text-slate-500">
          No usage data available for this subscriber yet.
        </div>
      );
    }

    return (
      <div className="ui-card">
        <p className="mb-3 text-sm font-medium text-slate-700">Download vs Upload (recent telemetry)</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={detailQuery.data.usageSeries}>
              <XAxis dataKey="label" minTickGap={32} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="download"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                dot={false}
                name="Download"
              />
              <Line
                type="monotone"
                dataKey="upload"
                stroke="var(--brand-accent)"
                strokeWidth={2}
                dot={false}
                name="Upload"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }, [detailQuery.data]);

  const ticketsContent = useMemo(() => {
    if (!detailQuery.data) {
      return null;
    }

    return (
      <div className="ui-table-shell">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {detailQuery.data.tickets.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={4}>
                  No linked tickets.
                </td>
              </tr>
              ) : (
              detailQuery.data.tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link href={`/tickets/${ticket.id}`} className="font-semibold hover:text-[var(--brand-primary)]">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge value={ticket.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={ticket.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }, [detailQuery.data]);

  if (detailQuery.isLoading) {
    return (
      <div className="ui-card-empty text-slate-500">
        Loading subscriber profile...
      </div>
    );
  }

  if (detailQuery.error) {
    return (
      <div className="ui-card-empty border-rose-200 bg-rose-50/80 text-rose-700">
        Could not load subscriber details.
      </div>
    );
  }

  if (!detailQuery.data) {
    return (
      <div className="ui-card-empty text-slate-500">
        Subscriber not found.
      </div>
    );
  }

  const actionConfig = getStatusAction(detailQuery.data.status as SubscriberStatus);

  return (
    <div className="space-y-5">
      <div className="ui-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--brand-primary)]">Subscriber Profile</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{detailQuery.data.fullName}</h2>
            <p className="text-sm text-slate-500">{detailQuery.data.email}</p>
            <div className="mt-3">
              <StatusBadge value={detailQuery.data.status} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/tickets?customerId=${detailQuery.data.id}${detailQuery.data.device ? `&deviceId=${detailQuery.data.device.id}` : ""}&title=${encodeURIComponent(`Support request for ${detailQuery.data.fullName}`)}&description=${encodeURIComponent("Subscriber reported an issue. Add call notes and troubleshooting context here.")}`}
              className="ui-button-secondary"
            >
              Create Ticket
            </Link>

            {canEditSubscriber && actionConfig ? (
              <button
                type="button"
                onClick={() => setPendingStatus(actionConfig.nextStatus)}
                className="ui-button-primary"
              >
                {actionConfig.label}
              </button>
            ) : null}

            {canEditSubscriber && detailQuery.data.status !== "TERMINATED" ? (
              <button
                type="button"
                onClick={() => setPendingStatus("TERMINATED")}
                className="ui-button-primary !bg-rose-600 !shadow-[0_14px_28px_rgba(190,24,93,0.18)]"
              >
                Terminate
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? "ui-pill ui-pill-active" : "ui-pill"}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "OVERVIEW" ? overviewContent : null}
      {activeTab === "USAGE" ? usageContent : null}
      {activeTab === "TICKETS" ? ticketsContent : null}

      <ConfirmDialog
        open={pendingStatus !== null}
        title={
          pendingStatus === "TERMINATED"
            ? "Terminate subscriber?"
            : `Update status to ${pendingStatus ?? ""}?`
        }
        description={
          pendingStatus === "TERMINATED"
            ? "Are you sure? This action cannot be undone."
            : "This will update both the subscriber record and the linked subscription."
        }
        tone={pendingStatus === "TERMINATED" ? "danger" : "default"}
        confirmLabel={pendingStatus === "TERMINATED" ? "Terminate" : "Confirm"}
        isPending={updateStatusMutation.isPending}
        onClose={() => setPendingStatus(null)}
        onConfirm={() => {
          if (!pendingStatus) {
            return;
          }

          updateStatusMutation.mutate({
            id,
            status: pendingStatus,
          });
        }}
      />
    </div>
  );
}
