"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { canManageSubscribers, normalizeUserRole } from "@/lib/auth/roles";
import { StatusBadge } from "@/components/shared/status-badge";
import { trpc } from "@/lib/trpc/client";
import { subscriberCreateSchema } from "@/lib/validations/operations.schema";

type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "TERMINATED";
type SortOption = "ACTIVATION_DESC" | "NAME_ASC" | "PLAN_ASC";
type SubscriberCreateValues = z.infer<typeof subscriberCreateSchema>;

const statusFilters: StatusFilter[] = ["ALL", "ACTIVE", "SUSPENDED", "TERMINATED"];

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

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

export function SubscriberTable() {
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const role = normalizeUserRole(session?.user?.role);
  const canCreateSubscribers = canManageSubscribers(role);

  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("ACTIVATION_DESC");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SubscriberCreateValues>({
    resolver: zodResolver(subscriberCreateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const subscribersQuery = trpc.subscribers.list.useQuery({
    search: debouncedSearch,
    status,
  });

  const createMutation = trpc.subscribers.create.useMutation({
    onSuccess: () => {
      setIsCreateOpen(false);
      reset();
      toast.success("Subscriber created successfully");
      void Promise.all([utils.subscribers.list.invalidate(), utils.dashboard.kpis.invalidate()]);
    },
    onError: (error) => {
      setError("root", {
        message: error.message,
      });
    },
  });

  const sortedRows = useMemo(() => {
    const rows = [...(subscribersQuery.data?.rows ?? [])];

    rows.sort((left, right) => {
      if (sortBy === "NAME_ASC") {
        return left.fullName.localeCompare(right.fullName);
      }

      if (sortBy === "PLAN_ASC") {
        return left.planName.localeCompare(right.planName);
      }

      return new Date(right.activationDate).getTime() - new Date(left.activationDate).getTime();
    });

    return rows;
  }, [sortBy, subscribersQuery.data?.rows]);

  const onCreateSubmit = handleSubmit((values) => {
    createMutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      street: values.street || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      zip: values.zip || undefined,
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by name or email"
            className="ui-input max-w-sm"
          />

          {searchValue ? (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="ui-button-secondary"
            >
              Clear search
            </button>
          ) : null}

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="ui-select"
          >
            <option value="ACTIVATION_DESC">Newest first</option>
            <option value="NAME_ASC">Name</option>
            <option value="PLAN_ASC">Plan</option>
          </select>
        </div>

        {canCreateSubscribers ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="ui-button-primary"
          >
            New Subscriber
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const count = subscribersQuery.data?.statusCounts[filter] ?? 0;
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

      {isCreateOpen ? (
        <form onSubmit={onCreateSubmit} className="ui-card space-y-4">
          <div className="rounded-[20px] border border-[rgba(13,92,123,0.12)] bg-[linear-gradient(135deg,rgba(13,92,123,0.08),rgba(255,255,255,0.9))] px-4 py-3">
            <p className="ui-eyebrow">New Subscriber</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Create a new customer record and hand it off cleanly to provisioning.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                First Name
              </label>
              <input {...register("firstName")} className="ui-input" />
              {errors.firstName ? (
                <p className="mt-1 text-sm text-rose-600">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Last Name
              </label>
              <input {...register("lastName")} className="ui-input" />
              {errors.lastName ? (
                <p className="mt-1 text-sm text-rose-600">{errors.lastName.message}</p>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Email
              </label>
              <input type="email" {...register("email")} className="ui-input" />
              {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Phone
              </label>
              <input {...register("phone")} className="ui-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Street
              </label>
              <input {...register("street")} className="ui-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                City
              </label>
              <input {...register("city")} className="ui-input" />
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr,140px]">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  State
                </label>
                <input {...register("state")} className="ui-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  ZIP
                </label>
                <input {...register("zip")} className="ui-input" />
              </div>
            </div>
          </div>

          {errors.root?.message ? <p className="text-sm text-rose-600">{errors.root.message}</p> : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="ui-button-primary"
            >
              {isSubmitting || createMutation.isPending ? "Creating..." : "Create Subscriber"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                reset();
              }}
              className="ui-button-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="ui-table-shell">
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Activation Date</th>
                <th>Monthly Value</th>
              </tr>
            </thead>
            <tbody>
              {subscribersQuery.isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={5}>
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribersQuery.error ? (
                <tr>
                  <td className="px-4 py-6 text-red-600" colSpan={5}>
                    Could not load subscribers.
                  </td>
                </tr>
              ) : sortedRows.length ? (
                sortedRows.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/subscribers/${subscriber.id}`}
                        className="font-semibold text-slate-950 transition hover:text-[var(--brand-primary)]"
                      >
                        {subscriber.fullName}
                      </Link>
                      <p className="text-xs text-slate-500">{subscriber.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{subscriber.planName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={subscriber.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(subscriber.activationDate)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(subscriber.monthlyValue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                    <p className="font-medium text-slate-700">
                      {searchValue
                        ? "No subscribers match your search."
                        : "No subscribers found for this filter."}
                    </p>
                    {searchValue ? (
                      <button
                        type="button"
                        onClick={() => setSearchValue("")}
                        className="mt-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        Reset search
                      </button>
                    ) : null}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
