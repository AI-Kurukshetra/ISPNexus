import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";

type Subscriber = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: Date;
};

export function RecentSubscribersFeed({ subscribers }: { subscribers: Subscriber[] }) {
  return (
    <section className="ui-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="ui-eyebrow">Growth Desk</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Recent Subscriber Sign-ups</h3>
        </div>
        <span className="ui-pill">{subscribers.length} new records</span>
      </div>
      <div className="ui-data-list">
        {subscribers.length === 0 ? (
          <p className="text-sm text-slate-500">No recent subscriber activity yet.</p>
        ) : (
          subscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="flex items-start justify-between gap-4 rounded-[20px] border border-white/70 bg-white/72 px-4 py-3 shadow-[0_12px_24px_rgba(10,32,51,0.05)]"
            >
              <div className="min-w-0">
                <Link
                  href={`/subscribers/${subscriber.id}`}
                  className="text-sm font-semibold text-slate-950 transition hover:text-[var(--brand-primary)]"
                >
                  {subscriber.fullName}
                </Link>
                <p className="mt-1 truncate text-xs text-slate-500">{subscriber.email}</p>
              </div>
              <div className="text-right">
                <div className="mb-2 flex justify-end">
                  <StatusBadge value={subscriber.status} />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {formatDistanceToNow(new Date(subscriber.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
