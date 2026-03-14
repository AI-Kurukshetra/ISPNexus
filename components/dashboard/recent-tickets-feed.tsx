import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type Ticket = {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: Date;
};

export function RecentTicketsFeed({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="ui-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="ui-eyebrow">Fault Desk</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Recent Fault Tickets</h3>
        </div>
        <span className="ui-pill ui-pill-active">{tickets.length} active items</span>
      </div>
      <div className="ui-data-list">
        {tickets.length === 0 ? (
          <p className="text-sm text-slate-500">No ticket activity yet.</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-start justify-between gap-4 rounded-[20px] border border-white/70 bg-white/72 px-4 py-3 shadow-[0_12px_24px_rgba(10,32,51,0.05)]"
            >
              <div className="min-w-0">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="text-sm font-semibold text-slate-950 transition hover:text-[var(--brand-primary)]"
                >
                  {ticket.title}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {ticket.severity} • {ticket.status}
                </p>
              </div>
              <p className="shrink-0 text-xs font-medium text-slate-500">
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
