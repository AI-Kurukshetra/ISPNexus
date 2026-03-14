import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";

type Ticket = {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: Date;
};

export function RecentTicketsFeed({ tickets }: { tickets: Ticket[] }) {
  return (
    <article className="ui-card">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="ui-eyebrow">Fault Desk</p>
          <h3 className="mt-2 text-base font-semibold text-slate-900">Recent Fault Tickets</h3>
        </div>
        <Link href="/tickets" className="mt-1 text-xs font-medium text-[#0d5c7b] hover:underline">
          View all →
        </Link>
      </div>
      <div className="space-y-2">
        {tickets.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            No open tickets
          </p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="block truncate text-sm font-semibold text-slate-800 transition hover:text-[#0d5c7b]"
                >
                  {ticket.title}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <SeverityBadge value={ticket.severity} />
                  <StatusBadge value={ticket.status} />
                </div>
              </div>
              <p className="shrink-0 text-xs text-slate-400">
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
