"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  canManageTickets,
  canManageWorkOrders,
  normalizeUserRole,
} from "@/lib/auth/roles";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";
import {
  ticketCommentSchema,
  workOrderCreateSchema,
} from "@/lib/validations/operations.schema";

const statusOptions: Array<"OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"> = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

type CommentValues = z.infer<typeof ticketCommentSchema>;
type WorkOrderCreateValues = z.infer<typeof workOrderCreateSchema>;

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

export function TicketDetail({ id }: { id: string }) {
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const role = normalizeUserRole(session?.user?.role);
  const canUpdateTicket = canManageTickets(role);
  const canCreateWorkOrder = canManageWorkOrders(role);

  const detailQuery = trpc.tickets.byId.useQuery({ id });
  const optionsQuery = trpc.tickets.formOptions.useQuery();
  const workOrderOptionsQuery = trpc.workorders.formOptions.useQuery(undefined, {
    enabled: canCreateWorkOrder,
  });

  const [draftStatus, setDraftStatus] = useState<
    "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | null
  >(null);
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | null>(null);
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  const commentForm = useForm<CommentValues>({
    resolver: zodResolver(ticketCommentSchema),
    defaultValues: {
      body: "",
    },
  });

  const workOrderForm = useForm<WorkOrderCreateValues>({
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

  const updateMutation = trpc.tickets.update.useMutation({
    onSuccess: () => {
      toast.success("Ticket updated");
      void Promise.all([
        utils.tickets.byId.invalidate({ id }),
        utils.tickets.list.invalidate(),
        utils.dashboard.kpis.invalidate(),
      ]);
    },
  });

  const createWorkOrderMutation = trpc.workorders.create.useMutation({
    onSuccess: () => {
      toast.success("Work order created");
      setIsCreateWorkOrderOpen(false);
      workOrderForm.reset({
        title: "",
        type: "REPAIR",
        ticketId: "",
        assigneeId: "",
        dueDate: "",
        notes: "",
      });
      void Promise.all([utils.tickets.byId.invalidate({ id }), utils.workorders.list.invalidate()]);
    },
    onError: (error) => {
      workOrderForm.setError("root", {
        message: error.message,
      });
    },
  });

  const commentMutation = trpc.tickets.addComment.useMutation({
    onSuccess: () => {
      commentForm.reset();
      toast.success("Comment added");
      void utils.tickets.byId.invalidate({ id });
    },
    onError: (error) => {
      commentForm.setError("root", {
        message: error.message,
      });
    },
  });

  const activityItems = useMemo(() => {
    if (!detailQuery.data) {
      return [];
    }

    return [
      {
        id: "created",
        title: "System",
        body: `Ticket created ${formatDistanceToNow(new Date(detailQuery.data.createdAt), { addSuffix: true })}.`,
        createdAt: detailQuery.data.createdAt,
      },
      ...detailQuery.data.comments.map((comment) => ({
        id: comment.id,
        title: comment.author.name,
        body: comment.body,
        createdAt: comment.createdAt,
      })),
    ];
  }, [detailQuery.data]);

  if (detailQuery.isLoading) {
    return (
      <div className="ui-card-empty text-slate-500">
        Loading ticket details...
      </div>
    );
  }

  if (detailQuery.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Could not load ticket details.
      </div>
    );
  }

  if (!detailQuery.data) {
    return (
      <div className="ui-card-empty text-slate-500">
        Ticket not found.
      </div>
    );
  }

  const ticket = detailQuery.data;
  const selectedStatus = (draftStatus ?? ticket.status) as
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";
  const selectedAssigneeId = draftAssigneeId ?? ticket.assignee?.id ?? "";
  const hasTicketChanges =
    selectedStatus !== ticket.status || selectedAssigneeId !== (ticket.assignee?.id ?? "");

  const saveChanges = () => {
    if (selectedStatus === "CLOSED" && ticket.status !== "CLOSED") {
      setPendingConfirm(true);
      return;
    }

    updateMutation.mutate({
      id: ticket.id,
      status: selectedStatus,
      assigneeId: selectedAssigneeId || null,
    });
    setDraftStatus(null);
    setDraftAssigneeId(null);
  };

  const submitComment = commentForm.handleSubmit((values) => {
    commentMutation.mutate({
      ticketId: ticket.id,
      body: values.body,
    });
  });

  const submitWorkOrder = workOrderForm.handleSubmit((values) => {
    createWorkOrderMutation.mutate({
      title: values.title,
      type: values.type,
      ticketId: ticket.id,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
      notes: values.notes || undefined,
    });
  });

  return (
    <div className="space-y-5">
      <section className="ui-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--brand-primary)]">
              Ticket #{ticket.id.slice(0, 8)}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{ticket.title}</h2>
            <div className="mt-3 flex items-center gap-2">
              <SeverityBadge value={ticket.severity} />
              <StatusBadge value={ticket.status} />
            </div>
          </div>
          {!canUpdateTicket ? (
            <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              CSR tracking view
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <article className="space-y-4 ui-card">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
            <p className="mt-1 text-sm text-slate-700">{ticket.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Device</p>
              {ticket.device ? (
                <Link
                  href={`/devices/${ticket.device.id}`}
                  className="mt-1 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
                >
                  {ticket.device.vendor} {ticket.device.model}
                </Link>
              ) : (
                <p className="mt-1 text-sm text-slate-600">No device linked</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Subscriber</p>
              {ticket.customer ? (
                <Link
                  href={`/subscribers/${ticket.customer.id}`}
                  className="mt-1 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
                >
                  {ticket.customer.name}
                </Link>
              ) : (
                <p className="mt-1 text-sm text-slate-600">No subscriber linked</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
              <p className="mt-1 text-sm text-slate-700">{formatDate(ticket.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Resolved</p>
              <p className="mt-1 text-sm text-slate-700">{formatDate(ticket.resolvedAt)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Linked work orders</p>
            {ticket.workOrders.length ? (
              <div className="mt-2 space-y-2">
                {ticket.workOrders.map((workOrder) => (
                  <div
                    key={workOrder.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{workOrder.title}</p>
                      <p className="text-xs text-slate-500">
                        {workOrder.type} • {workOrder.assignee?.name ?? "Unassigned"}
                      </p>
                    </div>
                    <StatusBadge value={workOrder.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-600">No work orders linked yet.</p>
            )}
          </div>
        </article>

        <aside className="space-y-4 ui-card">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Status</label>
            <select
              disabled={!canUpdateTicket}
              value={selectedStatus}
              onChange={(event) =>
                setDraftStatus(event.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED")
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Assignee</label>
            <select
              disabled={!canUpdateTicket}
              value={selectedAssigneeId}
              onChange={(event) => setDraftAssigneeId(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">Unassigned</option>
              {optionsQuery.data?.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {canUpdateTicket ? (
            <button
              type="button"
              onClick={saveChanges}
              disabled={!hasTicketChanges || updateMutation.isPending}
              className="ui-button-primary w-full"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          ) : null}

          {canCreateWorkOrder ? (
            <>
              <button
                type="button"
                onClick={() => setIsCreateWorkOrderOpen((open) => !open)}
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {isCreateWorkOrderOpen ? "Close Work Order Form" : "Create Work Order"}
              </button>

              {isCreateWorkOrderOpen ? (
                <form onSubmit={submitWorkOrder} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                      Title
                    </label>
                    <input
                      {...workOrderForm.register("title")}
                      placeholder={`Dispatch for ${ticket.title}`}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    {workOrderForm.formState.errors.title ? (
                      <p className="mt-1 text-sm text-rose-600">
                        {workOrderForm.formState.errors.title.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                      Type
                    </label>
                    <select
                      {...workOrderForm.register("type")}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="INSTALL">INSTALL</option>
                      <option value="REPAIR">REPAIR</option>
                      <option value="UPGRADE">UPGRADE</option>
                      <option value="SURVEY">SURVEY</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                      Assignee
                    </label>
                    <select
                      {...workOrderForm.register("assigneeId")}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {workOrderOptionsQuery.data?.users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                      Due Date
                    </label>
                    <input
                      type="date"
                      {...workOrderForm.register("dueDate")}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                      Notes
                    </label>
                    <textarea
                      {...workOrderForm.register("notes")}
                      className="h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {workOrderForm.formState.errors.root?.message ? (
                    <p className="text-sm text-rose-600">{workOrderForm.formState.errors.root.message}</p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={workOrderForm.formState.isSubmitting || createWorkOrderMutation.isPending}
                    className="ui-button-primary w-full"
                  >
                    {workOrderForm.formState.isSubmitting || createWorkOrderMutation.isPending
                      ? "Creating..."
                      : "Create Work Order"}
                  </button>
                </form>
              ) : null}
            </>
          ) : null}
        </aside>
      </section>

      <section className="ui-card">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Activity Log</h3>
        <div className="mt-3 space-y-3">
          {activityItems.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-100 px-3 py-2 text-sm">
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-slate-700">{item.body}</p>
              <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ui-card">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Comments</h3>
        <form onSubmit={submitComment} className="mt-3">
          <textarea
            {...commentForm.register("body")}
            className="h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Add an update for this ticket"
          />
          {commentForm.formState.errors.body ? (
            <p className="mt-1 text-sm text-rose-600">{commentForm.formState.errors.body.message}</p>
          ) : null}
          {commentForm.formState.errors.root?.message ? (
            <p className="mt-1 text-sm text-rose-600">{commentForm.formState.errors.root.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={commentForm.formState.isSubmitting || commentMutation.isPending}
            className="ui-button-primary mt-3"
          >
            {commentForm.formState.isSubmitting || commentMutation.isPending ? "Posting..." : "Add Comment"}
          </button>
        </form>
      </section>

      <ConfirmDialog
        open={pendingConfirm}
        title="Close ticket?"
        description="Are you sure? This action cannot be undone."
        tone="danger"
        confirmLabel="Close Ticket"
        isPending={updateMutation.isPending}
        onClose={() => setPendingConfirm(false)}
        onConfirm={() => {
          updateMutation.mutate({
            id: ticket.id,
            status: selectedStatus,
            assigneeId: selectedAssigneeId || null,
          });
          setDraftStatus(null);
          setDraftAssigneeId(null);
          setPendingConfirm(false);
        }}
      />
    </div>
  );
}
