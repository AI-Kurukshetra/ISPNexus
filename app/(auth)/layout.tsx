import { Activity, Building2, CheckCircle2, Wifi } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* ── Left: Form panel ── */}
            <div className="relative flex flex-1 flex-col bg-white px-6 py-10 lg:px-12 xl:px-16">
                {/* Brand wordmark */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#0d5c7b] to-[#093a53] text-white shadow-[0_4px_12px_rgba(9,58,83,0.25)]">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">ISPNexus</span>
                </div>

                {/* Form content */}
                <div className="flex flex-1 flex-col justify-center overflow-y-auto py-10">
                    <div className="w-full max-w-sm">{children}</div>
                </div>
            </div>

            {/* ── Right: Hero panel ── */}
            <div className="relative hidden flex-col overflow-hidden bg-[#071828] lg:flex lg:w-[52%] xl:w-[55%]">
                {/* Gradient orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-24 -top-24 h-120 w-120 rounded-full bg-[#0d5c7b]/50 blur-[96px]" />
                    <div className="absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-[#0d5c7b]/25 blur-[72px]" />
                    <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1a8fba]/15 blur-[80px]" />
                </div>

                <div className="relative z-10 flex flex-1 flex-col justify-between px-12 py-14 xl:px-16">
                    {/* Hero text */}
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5ba8c4]">
                            Operator Platform
                        </p>
                        <h2 className="mt-5 text-[clamp(2.2rem,3.2vw,3.4rem)] font-bold leading-[1.1] tracking-tight text-white">
                            Command Your
                            <br />
                            Network
                            <br />
                            <span className="text-[#5ba8c4]">with Clarity.</span>
                        </h2>
                        <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/50">
                            Real-time visibility, automated workflows, and full subscriber control — from a single
                            operator console.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="mt-10 flex flex-wrap gap-2.5">
                        {[
                            "Real-time monitoring",
                            "Role-based access",
                            "Automated ticketing",
                            "Analytics & reports",
                        ].map((feat) => (
                            <span
                                key={feat}
                                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-[12px] font-medium text-white/65"
                            >
                                <CheckCircle2 className="h-3 w-3 text-[#5ba8c4]" />
                                {feat}
                            </span>
                        ))}
                    </div>

                    {/* Mock stats card */}
                    <div className="mt-auto pt-12">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
                                        Network Snapshot
                                    </p>
                                    <p className="mt-2 text-4xl font-bold tracking-tight text-white">98.7%</p>
                                    <p className="mt-0.5 text-xs text-white/35">Uptime across all nodes</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d5c7b]/40">
                                    <Activity className="h-6 w-6 text-[#5ba8c4]" />
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-white/6 px-3 py-3">
                                    <p className="text-lg font-bold text-white">2,841</p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/35">
                                        Subscribers
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white/6 px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <Wifi className="h-3.5 w-3.5 text-[#5ba8c4]" />
                                        <p className="text-lg font-bold text-white">147</p>
                                    </div>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/35">
                                        Devices
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white/6 px-3 py-3">
                                    <p className="text-lg font-bold text-[#4ade80]">3</p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/35">
                                        Tickets
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
