"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { canManageTickets, normalizeUserRole } from "@/lib/auth/roles";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";
import { ticketCreateSchema } from "@/lib/validations/operations.schema";

type SeverityFilter = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type StatusFilter = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketCreateValues = z.infer<typeof ticketCreateSchema>;

type TicketListProps = {
  initialCreateValues?: {
    customerId?: string;
    deviceId?: string;
    title?: string;
    description?: string;
  };
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TicketList({ initialCreateValues }: TicketListProps) {
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const role = normalizeUserRole(session?.user?.role);
  const canUpdateTickets = canManageTickets(role);

  const [severity, setSeverity] = useState<SeverityFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(
    Boolean(
      initialCreateValues?.customerId ||
        initialCreateValues?.deviceId ||
        initialCreateValues?.title ||
        initialCreateValues?.description,
    ),
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TicketCreateValues>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: {
      title: initialCreateValues?.title ?? "",
      description: initialCreateValues?.description ?? "",
      severity: "MEDIUM",
      deviceId: initialCreateValues?.deviceId ?? "",
      customerId: initialCreateValues?.customerId ?? "",
      assigneeId: "",
    },
  });

  const ticketsQuery = trpc.tickets.list.useQuery({ severity, status });
  const optionsQuery = trpc.tickets.formOptions.useQuery();
  const selectedCustomerId = useWatch({
    control,
    name: "customerId",
  });

  const selectedCustomer = useMemo(
    () => optionsQuery.data?.customers.find((customer) => customer.id === selectedCustomerId),
    [selectedCustomerId, optionsQuery.data?.customers],
  );

  const createMutation = trpc.tickets.create.useMutation({
    onSuccess: () => {
      reset({
        title: "",
        description: "",
        severity: "MEDIUM",
        deviceId: "",
        customerId: "",
        assigneeId: "",
      });
      setIsCreateOpen(false);
      toast.success("Ticket created");
      void Promise.all([utils.tickets.list.invalidate(), utils.dashboard.kpis.invalidate()]);
    },
    onError: (error) => {
      setError("root", {
        message: error.message,
      });
    },
  });

  const onCreateSubmit = handleSubmit((values) => {
    createMutation.mutate({
      title: values.title,
      description: values.description,
      severity: values.severity,
      deviceId: values.deviceId || undefined,
      customerId: values.customerId || undefined,
      assigneeId: values.assigneeId || undefined,
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSeverity(value)}
              className={severity === value ? "ui-pill ui-pill-active" : "ui-pill"}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="ui-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            type="button"
            onClick={() => setIsCreateOpen((value) => !value)}
            className="ui-button-primary"
          >
            {isCreateOpen ? "Close" : "Create Ticket"}
          </button>
        </div>
      </div>

      {isCreateOpen ? (
        <form onSubmit={onCreateSubmit} className="ui-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[rgba(13,92,123,0.12)] bg-[linear-gradient(135deg,rgba(13,92,123,0.08),rgba(255,255,255,0.9))] px-4 py-3">
            <div>
              <p className="ui-eyebrow">New Support Ticket</p>
              <p className="mt-2 text-sm text-slate-600">
                {selectedCustomer
                  ? `Preparing escalation for ${selectedCustomer.name}.`
                  : "Create a new subscriber or network support case."}
              </p>
            </div>
            {!canUpdateTickets ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                CSR create-only mode
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Title
              </label>
              <input {...register("title")} className="ui-input" />
              {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Description
              </label>
              <textarea {...register("description")} className="ui-textarea h-28" />
              {errors.description ? (
                <p className="mt-1 text-sm text-rose-600">{errors.description.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Severity
              </label>
              <select {...register("severity")} className="ui-select">
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Device
              </label>
              <select {...register("deviceId")} className="ui-select">
                <option value="">Unlinked</option>
                {optionsQuery.data?.devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.vendor} {device.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Subscriber
              </label>
              <select {...register("customerId")} className="ui-select">
                <option value="">Unlinked</option>
                {optionsQuery.data?.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Assignee
              </label>
              <select {...register("assigneeId")} className="ui-select">
                <option value="">Unassigned</option>
                {optionsQuery.data?.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.root?.message ? <p className="text-sm text-rose-600">{errors.root.message}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="ui-button-primary"
          >
            {isSubmitting || createMutation.isPending ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      ) : null}

      <div className="ui-table-shell">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Device</th>
              <th>Assigned</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {ticketsQuery.isLoading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  Loading tickets...
                </td>
              </tr>
            ) : ticketsQuery.error ? (
              <tr>
                <td className="px-4 py-6 text-rose-600" colSpan={6}>
                  Could not load tickets.
                </td>
              </tr>
            ) : ticketsQuery.data?.length ? (
              ticketsQuery.data.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-semibold text-slate-950 transition hover:text-[var(--brand-primary)]"
                    >
                      {ticket.title}
                    </Link>
                    <p className="text-xs text-slate-500">#{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge value={ticket.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={ticket.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ticket.device ? `${ticket.device.vendor} ${ticket.device.model}` : "No device linked"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{ticket.assignee?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  No tickets for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
