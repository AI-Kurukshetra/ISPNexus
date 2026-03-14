"use client";

import { trpc } from "@/lib/trpc/client";

export function SettingsPanel() {
  const profileQuery = trpc.settings.profile.useQuery();

  if (profileQuery.isLoading) {
    return (
      <div className="ui-card-empty text-slate-500">
        Loading profile...
      </div>
    );
  }

  if (profileQuery.error || !profileQuery.data) {
    return (
      <div className="ui-card-empty border-rose-200 bg-rose-50/80 text-rose-700">
        Could not load settings profile.
      </div>
    );
  }

  const { user, apiKeyPreview } = profileQuery.data;

  return (
    <div className="space-y-4">
      <section className="ui-card">
        <p className="ui-eyebrow">User Profile</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">Operator identity and access</h3>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Name</p>
            <p className="mt-1 font-medium text-slate-900">{user.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Role</p>
            <p className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
              {user.role}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Email</p>
            <p className="mt-1 font-medium text-slate-900">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="ui-card">
        <p className="ui-eyebrow">API Keys</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">Preview and rotation hygiene</h3>
        <p className="mt-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
          {apiKeyPreview}
        </p>
      </section>
    </div>
  );
}
