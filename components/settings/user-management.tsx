"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailPlus, Trash2, UserPlus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getRoleLabel, normalizeUserRole } from "@/lib/auth/roles";
import { trpc } from "@/lib/trpc/client";
import { inviteUserSchema } from "@/lib/validations/auth.schema";

type InviteValues = z.infer<typeof inviteUserSchema>;

const ROLE_OPTIONS = [
    { value: "admin", label: "Admin" },
    { value: "noc", label: "NOC Engineer" },
    { value: "csr", label: "Customer Service Rep" },
] as const;

const ROLE_COLORS: Record<string, string> = {
    admin: "border-[#0d5c7b]/20 bg-[#0d5c7b]/8 text-[#0d5c7b]",
    noc: "border-amber-200 bg-amber-50 text-amber-700",
    csr: "border-purple-200 bg-purple-50 text-purple-700",
};

export function UserManagement() {
    const { data: session } = useSession();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

    const utils = trpc.useUtils();
    const listQuery = trpc.users.list.useQuery();

    const inviteMutation = trpc.users.invite.useMutation({
        onSuccess: () => {
            void utils.users.list.invalidate();
            setInviteOpen(false);
            reset();
        },
    });

    const removeMutation = trpc.users.remove.useMutation({
        onSuccess: () => {
            void utils.users.list.invalidate();
            setRemoveTarget(null);
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InviteValues>({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: { name: "", email: "", role: "noc" },
    });

    const isAdmin = normalizeUserRole(session?.user?.role) === "admin";
    if (!isAdmin) return null;

    const closeInvite = () => {
        setInviteOpen(false);
        reset();
        inviteMutation.reset();
    };

    return (
        <section className="ui-card">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="ui-eyebrow">Team</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">Team Members</h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Manage operators and their platform access.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setInviteOpen(true)}
                    className="ui-button-primary flex shrink-0 items-center gap-2 py-2 text-sm"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite User
                </button>
            </div>

            {/* User list */}
            <div className="mt-5">
                {listQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading team members…
                    </div>
                ) : !listQuery.data?.length ? (
                    <p className="text-sm text-slate-400">No team members yet. Invite someone to get started.</p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {listQuery.data.map((user) => (
                            <div key={user.id} className="flex items-center justify-between gap-3 py-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${ROLE_COLORS[user.role] ?? "border-slate-200 bg-slate-100 text-slate-600"}`}
                                    >
                                        {getRoleLabel(user.role)}
                                    </span>
                                    {user.id !== session?.user?.id && (
                                        <button
                                            type="button"
                                            aria-label={`Remove ${user.name}`}
                                            onClick={() => setRemoveTarget({ id: user.id, name: user.name })}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite modal */}
            {inviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(10,32,51,0.18)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d5c7b]/10">
                                    <MailPlus className="h-5 w-5 text-[#0d5c7b]" />
                                </div>
                                <h3 className="mt-3 text-lg font-semibold text-slate-900">Invite Team Member</h3>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    They&apos;ll receive an email with a link to set their password.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeInvite}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit((values) => inviteMutation.mutate(values))}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                    htmlFor="invite-name"
                                >
                                    Full Name
                                </label>
                                <input id="invite-name" {...register("name")} className="ui-input" />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                    htmlFor="invite-email"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="invite-email"
                                    type="email"
                                    {...register("email")}
                                    className="ui-input"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                    htmlFor="invite-role"
                                >
                                    Role
                                </label>
                                <select id="invite-role" {...register("role")} className="ui-input ui-select">
                                    {ROLE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
                                )}
                            </div>

                            {inviteMutation.error && (
                                <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                                    {inviteMutation.error.message}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={closeInvite} className="ui-button-secondary">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteMutation.isPending}
                                    className="ui-button-primary flex items-center gap-2"
                                >
                                    {inviteMutation.isPending && (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    )}
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Remove confirm dialog */}
            <ConfirmDialog
                open={removeTarget !== null}
                title={`Remove ${removeTarget?.name ?? "user"}?`}
                description="This will permanently delete their account and revoke all platform access. This cannot be undone."
                confirmLabel="Remove"
                tone="danger"
                isPending={removeMutation.isPending}
                onConfirm={() => removeTarget && removeMutation.mutate({ id: removeTarget.id })}
                onClose={() => setRemoveTarget(null)}
            />
        </section>
    );
}
