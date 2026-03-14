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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function RecentSubscribersFeed({ subscribers }: { subscribers: Subscriber[] }) {
  return (
    <article className="ui-card">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="ui-eyebrow">Growth Desk</p>
          <h3 className="mt-2 text-base font-semibold text-slate-900">Recent Subscribers</h3>
        </div>
        <Link href="/subscribers" className="mt-1 text-xs font-medium text-[#0d5c7b] hover:underline">
          View all →
        </Link>
      </div>
      <div className="space-y-2">
        {subscribers.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            No recent sign-ups
          </p>
        ) : (
          subscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0d5c7b] to-[#093a53] text-[11px] font-bold text-white">
                {getInitials(subscriber.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/subscribers/${subscriber.id}`}
                  className="block truncate text-sm font-semibold text-slate-800 transition hover:text-[#0d5c7b]"
                >
                  {subscriber.fullName}
                </Link>
                <p className="truncate text-xs text-slate-400">{subscriber.email}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge value={subscriber.status} />
                <p className="text-[11px] text-slate-400">
                  {formatDistanceToNow(new Date(subscriber.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
