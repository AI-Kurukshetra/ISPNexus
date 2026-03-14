"use client";

import {
    Activity,
    ArrowRight,
    BarChart3,
    Building2,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Network,
    Play,
    Server,
    Ticket,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// ─── animation helpers ────────────────────────────────────────────────────────
const FADE_UP_INITIAL = { opacity: 0, y: 32 };
const FADE_UP_ANIMATE = { opacity: 1, y: 0 };

function AnimatedSection({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── data ─────────────────────────────────────────────────────────────────────
const features = [
    {
        icon: Users,
        title: "Subscriber Management",
        description:
            "Full lifecycle management - profiles, subscription plans, usage tracking, and service history in one unified view.",
        accentColor: "#0d5c7b",
    },
    {
        icon: Activity,
        title: "Network Monitoring",
        description:
            "Real-time bandwidth and latency charts across every device. Spot degradation before customers feel it.",
        accentColor: "#0d5c7b",
    },
    {
        icon: Ticket,
        title: "Fault Ticket System",
        description:
            "Create, assign, and resolve fault tickets with severity badges and SLA tracking built right in.",
        accentColor: "#f08a24",
    },
    {
        icon: BarChart3,
        title: "Analytics & Reporting",
        description:
            "Subscriber growth, revenue trends, and ticket volume charts give you the insight to plan ahead.",
        accentColor: "#f08a24",
    },
    {
        icon: ClipboardList,
        title: "Work Orders",
        description:
            "Dispatch field teams with structured work orders - create, assign, and track completion from anywhere.",
        accentColor: "#0d5c7b",
    },
    {
        icon: Server,
        title: "Device & Inventory",
        description:
            "Track every CPE, switch, and router. Know its status, firmware version, and customer assignment.",
        accentColor: "#0d5c7b",
    },
];

const stats = [
    { value: "10k+", label: "Subscribers managed" },
    { value: "99.9%", label: "Platform uptime" },
    { value: "<30s", label: "Alert polling interval" },
    { value: "3", label: "Operator roles" },
];

const benefits = [
    "Granular role-based access for Admin, NOC, and CSR teams",
    "Real-time alerting with configurable severity escalation",
    "Complete audit trail for compliance and accountability",
    "Cloud-native architecture - scales from 100 to 100k subscribers",
];

// ─── mock dashboard UI ────────────────────────────────────────────────────────
function MockDashboard() {
    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a1929] shadow-2xl">
            {/* browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <div className="ml-3 flex-1 rounded-full bg-white/10 px-4 py-1 text-xs text-white/40">
                    ispnexus.demo/dashboard
                </div>
            </div>

            {/* mock app shell */}
            <div className="flex h-85 sm:h-105">
                {/* sidebar */}
                <div className="hidden w-20 shrink-0 flex-col gap-3 border-r border-white/5 bg-white/3 p-3 sm:flex">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d5c7b] text-white shadow-lg">
                        <Building2 className="h-5 w-5" />
                    </div>
                    {[BarChart3, Users, Server, Activity, Ticket, ClipboardList].map(
                        (Icon, i) => (
                            <div
                                key={i}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${i === 0
                                    ? "bg-[#f08a24]/20 text-[#f08a24]"
                                    : "text-white/30 hover:bg-white/5"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                        )
                    )}
                </div>

                {/* content area */}
                <div className="flex-1 overflow-hidden p-4 sm:p-5">
                    <p className="mb-4 text-sm font-semibold text-white/60 uppercase tracking-widest">
                        Overview
                    </p>

                    {/* KPI row */}
                    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                            { label: "Subscribers", value: "248", hint: "+12 this month", color: "#0d5c7b" },
                            { label: "Online Devices", value: "31/34", hint: "91% healthy", color: "#10b981" },
                            { label: "Open Tickets", value: "7", hint: "2 critical", color: "#f08a24" },
                            { label: "Monthly Rev.", value: "$42.8k", hint: "+5.2% MoM", color: "#8b5cf6" },
                        ].map((kpi, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm"
                            >
                                <p className="text-[10px] uppercase tracking-widest text-white/40">
                                    {kpi.label}
                                </p>
                                <p className="mt-1 text-lg font-semibold text-white">{kpi.value}</p>
                                <p className="text-[10px]" style={{ color: kpi.color }}>
                                    {kpi.hint}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* chart placeholder */}
                    <div className="flex h-27.5 gap-2 sm:h-35">
                        <div className="flex-1 rounded-xl border border-white/5 bg-white/3 p-3">
                            <p className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
                                Bandwidth Last 24h
                            </p>
                            <div className="flex h-17.5 items-end gap-0.75 sm:h-22.5">
                                {[38, 52, 44, 61, 58, 70, 55, 80, 63, 74, 68, 90, 78, 85, 72, 88, 76, 92, 84, 96].map(
                                    (h, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 rounded-sm"
                                            style={{
                                                height: `${h}%`,
                                                background: `linear-gradient(180deg, #0d5c7b, #093a53)`,
                                                opacity: 0.6 + (i / 20) * 0.4,
                                            }}
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        <div className="hidden w-35 shrink-0 rounded-xl border border-white/5 bg-white/3 p-3 sm:block">
                            <p className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
                                Ticket Status
                            </p>
                            <div className="space-y-2">
                                {[
                                    { label: "Open", pct: 40, color: "#f08a24" },
                                    { label: "In Progress", pct: 30, color: "#0d5c7b" },
                                    { label: "Resolved", pct: 30, color: "#10b981" },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <div className="flex justify-between text-[9px] text-white/40">
                                            <span>{s.label}</span>
                                            <span>{s.pct}%</span>
                                        </div>
                                        <div className="mt-0.5 h-1.5 w-full rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${s.pct}%`, background: s.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── main component ────────────────────────────────────────────────────────────
export function LandingPage() {
    return (
        <div className="relative min-h-screen bg-[#050d18] text-white">
            {/* ── global background gradients ── */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 overflow-hidden"
            >
                <div className="absolute -left-40 -top-40 h-175 w-175 rounded-full bg-[#0d5c7b] opacity-[0.12] blur-[120px]" />
                <div className="absolute -right-60 top-1/4 h-150 w-150 rounded-full bg-[#f08a24] opacity-[0.07] blur-[120px]" />
                <div className="absolute bottom-0 left-1/3 h-125 w-125 rounded-full bg-[#0d5c7b] opacity-[0.08] blur-[100px]" />
                {/* grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* ─────────────────── NAVBAR ─────────────────── */}
            <header className="sticky top-0 z-50 border-b border-white/6 backdrop-blur-md">
                <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    {/* logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#0d5c7b] to-[#093a53] shadow-[0_8px_24px_rgba(13,92,123,0.4)]">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            ISPNexus
                        </span>
                    </div>

                    {/* desktop nav */}
                    <ul className="hidden items-center gap-8 md:flex">
                        {["Features", "Analytics", "Monitoring"].map((item) => (
                            <li key={item}>
                                <a
                                    href={`#${item.toLowerCase()}`}
                                    className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                                >
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 rounded-xl bg-[#0d5c7b] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(13,92,123,0.35)] transition-all hover:bg-[#0e6b8e] hover:shadow-[0_8px_28px_rgba(13,92,123,0.45)] active:scale-95"
                        >
                            Get Started
                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                    </div>
                </nav>
            </header>

            {/* ─────────────────── HERO ─────────────────── */}
            <main id="main-content">
                <section aria-label="Hero - ISPNexus overview" className="relative z-10 px-6 pb-24 pt-20 text-center">
                    <div className="mx-auto max-w-4xl">
                        {/* badge */}
                        <motion.div
                            initial={FADE_UP_INITIAL}
                            animate={FADE_UP_ANIMATE}
                            transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
                            className="mb-6 inline-flex"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#0d5c7b]/50 bg-[#0d5c7b]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#5ab4d4]">
                                <Zap className="h-3 w-3" />
                                The ISP Operations Platform
                            </span>
                        </motion.div>

                        {/* headline */}
                        <motion.h1
                            initial={FADE_UP_INITIAL}
                            animate={FADE_UP_ANIMATE}
                            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                            className="bg-linear-to-br from-white via-white to-white/50 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent sm:text-6xl lg:text-7xl"
                        >
                            The Smarter Way
                            <br />
                            <span className="bg-linear-to-r from-[#0d9cd4] to-[#f08a24] bg-clip-text text-transparent">
                                to Run Your ISP
                            </span>
                        </motion.h1>

                        {/* subtitle */}
                        <motion.p
                            initial={FADE_UP_INITIAL}
                            animate={FADE_UP_ANIMATE}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/55"
                        >
                            ISPNexus is a production-ready operations platform for broadband ISPs.
                            Manage subscribers, monitor your network in real time, resolve fault
                            tickets, and track revenue - all from a single, unified dashboard.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={FADE_UP_INITIAL}
                            animate={FADE_UP_ANIMATE}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            className="mt-10 flex flex-wrap items-center justify-center gap-4"
                        >
                            <Link
                                href="/login"
                                className="group flex items-center gap-2 rounded-2xl bg-linear-to-br from-[#0d5c7b] to-[#093a53] px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_40px_rgba(13,92,123,0.45)] transition-all hover:shadow-[0_16px_48px_rgba(13,92,123,0.55)] hover:-translate-y-0.5 active:scale-95"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                Get Started Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <a
                                href="#features"
                                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white active:scale-95"
                            >
                                See How It Works
                            </a>
                        </motion.div>

                    </div>

                    {/* floating dashboard preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
                        className="mx-auto mt-16 max-w-5xl"
                    >
                        <div className="relative">
                            {/* glow behind the preview */}
                            <div className="absolute -inset-4 rounded-3xl bg-linear-to-b from-[#0d5c7b]/20 to-transparent blur-2xl" />
                            <MockDashboard />
                        </div>
                    </motion.div>
                </section>

                {/* ─────────────────── STATS STRIP ─────────────────── */}
                <section aria-label="Platform statistics" className="relative z-10 border-y border-white/6 bg-white/2.5 backdrop-blur-sm">
                    <div className="mx-auto max-w-5xl px-6 py-10">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {stats.map((s) => (
                                <AnimatedSection key={s.label} className="text-center">
                                    <p className="text-4xl font-bold tracking-tight text-white">
                                        {s.value}
                                    </p>
                                    <p className="mt-1.5 text-sm text-white/45">{s.label}</p>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─────────────────── FEATURES ─────────────────── */}
                <section id="features" aria-label="Platform features" className="relative z-10 px-6 py-24">
                    <div className="mx-auto max-w-6xl">
                        <AnimatedSection className="mb-14 text-center">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#5ab4d4]">
                                Platform Capabilities
                            </p>
                            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                Everything your
                                <br />
                                <span className="text-white/50">operations team needs</span>
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-base text-white/45">
                                Six purpose-built modules that cover the full ISP operations
                                workflow - from subscriber onboarding to network fault resolution.
                            </p>
                        </AnimatedSection>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                            {features.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <motion.article
                                        role="listitem"
                                        key={f.title}
                                        initial={{ opacity: 0, y: 28 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-60px" }}
                                        transition={{
                                            duration: 0.55,
                                            delay: i * 0.07,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className="group relative overflow-hidden rounded-2xl border border-white/7 bg-white/4 p-6 backdrop-blur-sm transition-all hover:border-white/12 hover:bg-white/6"
                                    >
                                        {/* hover glow */}
                                        <div
                                            className="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity group-hover:opacity-100"
                                            style={{
                                                background: `radial-gradient(circle at 50% 0%, ${f.accentColor}22, transparent 70%)`,
                                            }}
                                        />
                                        <div className="relative">
                                            <div
                                                className="mb-4 inline-flex rounded-xl p-2.5"
                                                style={{
                                                    background: `${f.accentColor}18`,
                                                    boxShadow: `0 0 0 1px ${f.accentColor}22`,
                                                }}
                                            >
                                                <Icon
                                                    aria-hidden="true"
                                                    className="h-5 w-5"
                                                    style={{ color: f.accentColor }}
                                                />
                                            </div>
                                            <h3 className="mb-2 text-base font-semibold text-white">
                                                {f.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-white/45">
                                                {f.description}
                                            </p>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ─────────────────── MONITORING CALLOUT ─────────────────── */}
                <section id="monitoring" aria-label="Network monitoring features" className="relative z-10 px-6 py-16">
                    <div className="mx-auto max-w-6xl">
                        <AnimatedSection>
                            <div className="relative overflow-hidden rounded-3xl border border-[#0d5c7b]/30 bg-linear-to-br from-[#0d5c7b]/20 via-[#050d18] to-[#050d18] p-8 sm:p-12">
                                {/* decorative orb */}
                                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#0d5c7b]/20 blur-3xl" />
                                <div className="relative grid items-center gap-10 md:grid-cols-2">
                                    <div>
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#5ab4d4]">
                                            Real-time Monitoring
                                        </p>
                                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                            Know your network
                                            <br />health at a glance
                                        </h2>
                                        <p className="mt-4 text-base leading-relaxed text-white/50">
                                            30-second polling keeps your bandwidth and latency charts
                                            up to date. Get alerted the moment a device degrades or goes
                                            offline - before your customers notice.
                                        </p>
                                        <ul className="mt-6 space-y-3">
                                            {[
                                                "Per-device bandwidth & latency charts",
                                                "Alert feed with severity levels",
                                                "Online / degraded / offline device states",
                                            ].map((item) => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0d9cd4]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href="/login"
                                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0d5c7b] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(13,92,123,0.4)] transition-all hover:bg-[#0e6b8e] hover:-translate-y-0.5"
                                        >
                                            View Live Monitoring
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>

                                    {/* mini monitoring card */}
                                    <div className="rounded-2xl border border-white/10 bg-[#0a1929] p-5">
                                        <div className="mb-4 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-white">
                                                Network Devices
                                            </p>
                                            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                                Live
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { name: "Core Router - LOC-01", status: "online", latency: "2ms", bw: "92%" },
                                                { name: "Edge Switch - LOC-02", status: "online", latency: "4ms", bw: "76%" },
                                                { name: "OLT Node - SEC-03", status: "degraded", latency: "18ms", bw: "45%" },
                                                { name: "AP Cluster - NOR-04", status: "online", latency: "5ms", bw: "83%" },
                                            ].map((device) => (
                                                <div
                                                    key={device.name}
                                                    className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                background:
                                                                    device.status === "online"
                                                                        ? "#10b981"
                                                                        : device.status === "degraded"
                                                                            ? "#f59e0b"
                                                                            : "#ef4444",
                                                            }}
                                                        />
                                                        <p className="text-xs text-white/70">{device.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                                        <span>{device.latency}</span>
                                                        <span className="w-8 text-right">{device.bw}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </section>

                {/* ─────────────────── ANALYTICS CALLOUT ─────────────────── */}
                <section id="analytics" aria-label="Analytics and reporting features" className="relative z-10 px-6 py-16">
                    <div className="mx-auto max-w-6xl">
                        <AnimatedSection>
                            <div className="relative overflow-hidden rounded-3xl border border-[#f08a24]/20 bg-linear-to-br from-[#f08a24]/10 via-[#050d18] to-[#050d18] p-8 sm:p-12">
                                <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#f08a24]/10 blur-3xl" />
                                <div className="relative grid items-center gap-10 md:grid-cols-2">
                                    {/* mini analytics card */}
                                    <div className="order-2 rounded-2xl border border-white/10 bg-[#0a1929] p-5 md:order-1">
                                        <p className="mb-4 text-sm font-semibold text-white">
                                            Revenue & Growth
                                        </p>
                                        <div className="flex gap-4">
                                            {/* revenue bars */}
                                            <div className="flex-1">
                                                <p className="mb-2 text-[10px] uppercase tracking-widest text-white/40">Monthly Rev.</p>
                                                <div className="flex h-25 items-end gap-1">
                                                    {[55, 62, 58, 70, 67, 80, 75, 88, 84, 92, 90, 100].map(
                                                        (h, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex-1 rounded-sm"
                                                                style={{
                                                                    height: `${h}%`,
                                                                    background: `linear-gradient(180deg, #f08a24, #d4620f)`,
                                                                    opacity: 0.5 + (i / 12) * 0.5,
                                                                }}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <p className="mt-2 text-[10px] text-white/30">Jan → Dec</p>
                                            </div>
                                            {/* growth stats */}
                                            <div className="w-25 space-y-3">
                                                {[
                                                    { label: "MRR", value: "$42.8k", up: true },
                                                    { label: "Subs", value: "248", up: true },
                                                    { label: "Churn", value: "1.2%", up: false },
                                                ].map((s) => (
                                                    <div key={s.label} className="rounded-xl bg-white/4 p-2.5 text-center">
                                                        <p className="text-[10px] text-white/40">{s.label}</p>
                                                        <p className="text-sm font-semibold text-white">
                                                            {s.value}
                                                        </p>
                                                        <div className="flex items-center justify-center gap-0.5">
                                                            <TrendingUp
                                                                className="h-3 w-3"
                                                                style={{ color: s.up ? "#10b981" : "#ef4444" }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-1 md:order-2">
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#f0a854]">
                                            Analytics
                                        </p>
                                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                            Data-driven
                                            <br />decisions at scale
                                        </h2>
                                        <p className="mt-4 text-base leading-relaxed text-white/50">
                                            Track subscriber growth, revenue trends, and ticket volume
                                            over time. Spot patterns and plan network capacity before
                                            demand outpaces your infrastructure.
                                        </p>
                                        <ul className="mt-6 space-y-3">
                                            {[
                                                "Subscriber growth over time",
                                                "Revenue & MRR trend charts",
                                                "Fault ticket volume by severity",
                                            ].map((item) => (
                                                <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#f08a24]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href="/login"
                                            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#f08a24]/40 bg-[#f08a24]/10 px-6 py-3 text-sm font-semibold text-[#f0a854] transition-all hover:bg-[#f08a24]/20 hover:-translate-y-0.5"
                                        >
                                            View Analytics
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </section>

                {/* ─────────────────── BENEFITS LIST ─────────────────── */}
                <section aria-label="Product benefits" className="relative z-10 px-6 py-16">
                    <div className="mx-auto max-w-4xl">
                        <AnimatedSection className="mb-10 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Enterprise-grade,
                                <br />
                                <span className="text-white/40">without the enterprise price</span>
                            </h2>
                        </AnimatedSection>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {benefits.map((b, i) => (
                                <motion.div
                                    key={b}
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.45, delay: i * 0.08 }}
                                    className="flex items-start gap-3 rounded-2xl border border-white/7 bg-white/3 px-5 py-4"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9cd4]" />
                                    <span className="text-sm text-white/65">{b}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─────────────────── FINAL CTA ─────────────────── */}
                <section aria-label="Call to action" className="relative z-10 px-6 py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <AnimatedSection>
                            <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-linear-to-br from-[#0d5c7b]/25 via-[#050d18] to-[#050d18] p-12">
                                <div className="absolute inset-0 rounded-3xl" style={{
                                    background: "radial-gradient(circle at 50% 0%, rgba(13,92,123,0.3), transparent 60%)"
                                }} />
                                <div className="relative">
                                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#0d5c7b] to-[#093a53] shadow-[0_16px_40px_rgba(13,92,123,0.5)]">
                                        <Network className="h-7 w-7 text-white" />
                                    </div>
                                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                        Everything your ISP
                                        <br />needs to operate at scale
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-md text-base text-white/45">
                                        From your first hundred subscribers to tens of thousands -
                                        ISPNexus scales with your business without adding operational
                                        complexity.
                                    </p>
                                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                        <Link
                                            href="/login"
                                            className="group flex items-center gap-2 rounded-2xl bg-linear-to-br from-[#0d5c7b] to-[#093a53] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_40px_rgba(13,92,123,0.5)] transition-all hover:shadow-[0_16px_52px_rgba(13,92,123,0.6)] hover:-translate-y-0.5 active:scale-95"
                                        >
                                            <Play className="h-4 w-4 fill-current" />
                                            Start Using ISPNexus
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </div>
                                    <p className="mt-4 text-xs text-white/25">
                                        No credit card required · Free to explore
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </section>
            </main>

            {/* ─────────────────── FOOTER ─────────────────── */}
            <footer aria-label="Site footer" className="relative z-10 border-t border-white/6 px-6 py-10">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-[#0d5c7b] to-[#093a53]">
                            <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white/70">ISPNexus</span>
                    </div>
                    <p className="text-xs text-white/25">
                        © 2026 ISPNexus. All rights reserved.
                    </p>
                    <p className="text-xs text-white/20">Cloud-native ISP operations platform</p>
                </div>
            </footer>
        </div>
    );
}
