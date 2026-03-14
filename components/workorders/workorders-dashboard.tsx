"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  canManageWorkOrders,
  normalizeUserRole,
} from "@/lib/auth/roles";
import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";
import { workOrderCreateSchema } from "@/lib/validations/operations.schema";

type StatusFilter = "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type WorkOrderStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type WorkOrderType = "ALL" | "INSTALL" | "REPAIR" | "UPGRADE" | "SURVEY";
type WorkOrderCreateValues = z.infer<typeof workOrderCreateSchema>;

const filterOptions: StatusFilter[] = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function formatDate(value: Date | string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function WorkOrdersDashboard() {
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const role = normalizeUserRole(session?.user?.role);
  const canEditWorkOrders = canManageWorkOrders(role);

  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<WorkOrderType>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderCreateValues>({
    resolver: zodResolver(workOrderCreateSchema),
    defaultValues: {
      title: "",
      type: "REPAIR",
      ticketId: "",
      assigneeId: "",
      dueDate: "",
      notes: "",
    },
  });

  const listQuery = trpc.workorders.list.useQuery({
    status,
    type: typeFilter,
    assigneeId: assigneeFilter || undefined,
  });
  const optionsQuery = trpc.workorders.formOptions.useQuery();

  const createMutation = trpc.workorders.create.useMutation({
    onSuccess: () => {
      setIsCreateOpen(false);
      reset();
      toast.success("Work order created");
      void utils.workorders.list.invalidate();
    },
    onError: (error) => {
      setError("root", {
        message: error.message,
      });
    },
  });

  const updateMutation = trpc.workorders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Work order updated");
      void utils.workorders.list.invalidate();
    },
  });

  const onCreateSubmit = handleSubmit((values) => {
    createMutation.mutate({
      title: values.title,
      type: values.type,
      ticketId: values.ticketId || undefined,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
      notes: values.notes || undefined,
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as WorkOrderType)}
            className="ui-select"
          >
            <option value="ALL">All Types</option>
            <option value="INSTALL">Install</option>
            <option value="REPAIR">Repair</option>
            <option value="UPGRADE">Upgrade</option>
            <option value="SURVEY">Survey</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="ui-select"
          >
            <option value="">All Assignees</option>
            {session?.user?.id ? <option value={session.user.id}>Assigned to me</option> : null}
            {optionsQuery.data?.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {canEditWorkOrders ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen((open) => !open)}
            className="ui-button-primary"
          >
            {isCreateOpen ? "Close" : "New Work Order"}
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Read-only reference view
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={status === option ? "ui-pill ui-pill-active" : "ui-pill"}
          >
            {option.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {isCreateOpen ? (
        <form onSubmit={onCreateSubmit} className="ui-card space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Title</label>
              <input {...register("title")} className="ui-input" />
              {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Type</label>
              <select {...register("type")} className="ui-select">
                <option value="INSTALL">Install</option>
                <option value="REPAIR">Repair</option>
                <option value="UPGRADE">Upgrade</option>
                <option value="SURVEY">Survey</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Due Date</label>
              <input type="date" {...register("dueDate")} className="ui-input" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Linked Ticket</label>
              <select {...register("ticketId")} className="ui-select">
                <option value="">None</option>
                {optionsQuery.data?.tickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assignee</label>
              <select {...register("assigneeId")} className="ui-select">
                <option value="">Unassigned</option>
                {optionsQuery.data?.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Notes</label>
              <textarea {...register("notes")} className="ui-textarea h-28" />
            </div>
          </div>

          {errors.root?.message ? <p className="text-sm text-rose-600">{errors.root.message}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="ui-button-primary"
          >
            {isSubmitting || createMutation.isPending ? "Creating..." : "Create Work Order"}
          </button>
        </form>
      ) : null}

      <div className="ui-table-shell">
        <table className="ui-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Linked Ticket</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {listQuery.isLoading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  Loading work orders...
                </td>
              </tr>
            ) : listQuery.error ? (
              <tr>
                <td className="px-4 py-6 text-rose-600" colSpan={7}>
                  Could not load work orders.
                </td>
              </tr>
            ) : listQuery.data?.length ? (
              listQuery.data.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    className="cursor-pointer"
                    onClick={() => setExpandedId((current) => (current === row.id ? null : row.id))}
                  >
                    <td className="px-4 py-3 text-slate-600">#{row.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                    <td className="px-4 py-3 text-slate-700">{row.type}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.ticket ? (
                        <Link href={`/tickets/${row.ticket.id}`} className="font-semibold text-[var(--brand-primary)] hover:underline">
                          {row.ticket.title}
                        </Link>
                      ) : (
                        "None"
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.assignee?.name ?? "Unassigned"}</td>
                    <td className="px-4 py-3">
                      {canEditWorkOrders ? (
                        <select
                          value={row.status}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => {
                            const nextStatus = event.target.value as WorkOrderStatus;

                            if (
                              nextStatus === "CANCELLED" &&
                              !window.confirm("Are you sure? This action cannot be undone.")
                            ) {
                              return;
                            }

                            updateMutation.mutate({
                              id: row.id,
                              status: nextStatus,
                            });
                          }}
                          className="ui-select px-3 py-2 text-xs"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      ) : (
                        <StatusBadge value={row.status} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(row.dueDate)}</td>
                  </tr>
                  {expandedId === row.id ? (
                    <tr className="bg-slate-50/60">
                      <td className="px-4 py-3 text-xs text-slate-600" colSpan={7}>
                        <p className="font-semibold uppercase tracking-wide text-slate-500">Details</p>
                        <p className="mt-1 text-sm text-slate-700">{row.notes || "No additional notes."}</p>
                        <div className="mt-2 flex gap-3 text-xs text-slate-500">
                          <span>Created: {formatDate(row.createdAt)}</span>
                          <StatusBadge value={row.status} />
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  No work orders match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
