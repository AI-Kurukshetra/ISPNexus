# ISPNexus — Technical Architecture (8-Hour Hackathon)

**Version:** 1.0.0-hackathon
**Date:** March 2026
**Constraint:** Everything ships in 8 hours. Every decision below optimizes for speed without sacrificing code quality or TypeScript strictness.

---

## Table of Contents

1. [Stack & Tooling Quick Reference](#1-stack--tooling-quick-reference)
2. [Project Bootstrap (Hour 0–0.5)](#2-project-bootstrap-hour-00-05)
3. [Folder Structure](#3-folder-structure)
4. [Database Setup (Hour 0.5–1)](#4-database-setup-hour-05-1)
5. [Seed Script (Hour 0.5–1)](#5-seed-script-hour-05-1)
6. [Authentication (Hour 0–0.5, alongside setup)](#6-authentication-hour-00-05)
7. [tRPC Setup](#7-trpc-setup)
8. [App Shell & Layout (Hour 1–1.5)](#8-app-shell--layout-hour-1-15)
9. [Page-by-Page Implementation Guide](#9-page-by-page-implementation-guide)
10. [tRPC Routers Reference](#10-trpc-routers-reference)
11. [Server Actions Reference](#11-server-actions-reference)
12. [Charting with Recharts](#12-charting-with-recharts)
13. [Environment Variables](#13-environment-variables)
14. [Vercel Deployment (Hour 7.5–8)](#14-vercel-deployment-hour-75-8)
15. [Common Patterns Cheatsheet](#15-common-patterns-cheatsheet)

---

## 1. Stack & Tooling Quick Reference

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 App Router + Turbopack | `next dev --turbo` |
| Language | TypeScript 5 strict, zero `any` | `strict: true` in tsconfig |
| Database | PostgreSQL via Neon (serverless) | Free tier sufficient for hackathon |
| ORM | Prisma 5 | Type-safe, fast schema iteration |
| Auth | NextAuth v5 (Auth.js) + Credentials | JWT strategy, no DB adapter needed for hackathon |
| API | tRPC v11 | End-to-end type safety, no codegen |
| Client data | TanStack React Query v5 | Via tRPC React client |
| Styling | Tailwind CSS v3 | shadcn/ui compatible |
| Components | shadcn/ui + Radix UI | Add components via CLI |
| Charts | Recharts | Works with shadcn theming |
| Forms | React Hook Form v7 + Zod v3 | zodResolver for validation |
| Animations | Framer Motion v11 | Use sparingly — layout + fade only |
| Icons | lucide-react | Already in shadcn |
| State | Zustand v4 | Only for sidebar collapse state |
| Dates | date-fns | formatDistanceToNow, format |
| Toasts | Sonner (via shadcn) | `pnpm dlx shadcn@latest add sonner` |
| Package mgr | pnpm | NEVER npm or yarn |
| Deploy | Vercel | Push to main → auto-deploy |

---

## 2. Project Bootstrap (Hour 0–0.5)

Run these commands in order. Do not deviate.

```bash
# 1. Create Next.js project
pnpm create next-app@latest ispnexus \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd ispnexus

# 2. Core dependencies
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next \
  @tanstack/react-query \
  next-auth@beta @auth/prisma-adapter \
  @prisma/client prisma \
  zod \
  react-hook-form @hookform/resolvers \
  recharts \
  framer-motion \
  lucide-react \
  zustand \
  date-fns \
  bcryptjs \
  superjson

pnpm add -D @types/bcryptjs prisma

# 3. shadcn/ui init
pnpm dlx shadcn@latest init
# Choose: Default style, Slate base color, CSS variables: yes

# 4. Add shadcn components needed
pnpm dlx shadcn@latest add \
  button card badge table dialog form input label select \
  tabs skeleton avatar separator dropdown-menu \
  sheet sidebar sonner tooltip

# 5. Prisma init
pnpm prisma init

# 6. Environment file
cp .env.example .env.local
```

**`tsconfig.json` — ensure strict mode:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## 3. Folder Structure

Exact structure to create. Every file has a clear home.

```
ispnexus/
├── app/
│   ├── layout.tsx                    ← Root layout (fonts, providers)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                ← Sidebar + topbar shell
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── subscribers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── devices/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── tickets/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── monitoring/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── workorders/               ← P1
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       └── trpc/
│           └── [trpc]/
│               └── route.ts
│
├── components/
│   ├── ui/                           ← shadcn generated (do not edit)
│   ├── layout/
│   │   ├── app-sidebar.tsx           ← Nav sidebar
│   │   ├── top-header.tsx            ← Breadcrumb + user menu
│   │   └── nav-link.tsx
│   ├── shared/
│   │   ├── status-badge.tsx          ← Colored status pill
│   │   ├── severity-badge.tsx        ← Colored severity pill
│   │   ├── kpi-card.tsx              ← Dashboard metric card
│   │   ├── page-header.tsx           ← Page title + action button
│   │   ├── data-table.tsx            ← Generic table wrapper
│   │   ├── empty-state.tsx           ← Empty table/list state
│   │   └── loading-skeleton.tsx      ← Generic skeleton
│   ├── dashboard/
│   │   ├── subscriber-growth-chart.tsx
│   │   ├── bandwidth-chart.tsx
│   │   ├── recent-tickets-feed.tsx
│   │   └── recent-signups-feed.tsx
│   ├── subscribers/
│   │   ├── subscriber-table.tsx      ← 'use client'
│   │   ├── subscriber-usage-chart.tsx
│   │   └── create-subscriber-dialog.tsx
│   ├── devices/
│   │   ├── device-grid.tsx           ← Card view
│   │   ├── device-table.tsx          ← Table view
│   │   └── device-metrics-chart.tsx
│   ├── tickets/
│   │   ├── ticket-table.tsx
│   │   ├── create-ticket-dialog.tsx
│   │   └── ticket-activity-log.tsx
│   ├── monitoring/
│   │   ├── monitoring-charts.tsx     ← 'use client', polling
│   │   └── alert-events-feed.tsx
│   ├── analytics/
│   │   └── analytics-charts.tsx     ← 'use client'
│   └── providers/
│       ├── trpc-provider.tsx         ← 'use client'
│       └── session-provider.tsx     ← 'use client'
│
├── server/
│   ├── auth.ts                       ← NextAuth config + export
│   ├── db.ts                         ← Prisma singleton
│   ├── trpc/
│   │   ├── trpc.ts                   ← Init, context, base procedures
│   │   ├── root.ts                   ← Merged root router
│   │   └── routers/
│   │       ├── dashboard.ts
│   │       ├── customers.ts
│   │       ├── devices.ts
│   │       ├── tickets.ts
│   │       ├── monitoring.ts
│   │       ├── analytics.ts
│   │       └── workorders.ts
│   └── actions/
│       ├── ticket.actions.ts
│       └── workorder.actions.ts
│
├── lib/
│   ├── trpc/
│   │   └── client.ts                 ← tRPC React hooks client
│   ├── validations/
│   │   ├── ticket.schema.ts
│   │   ├── customer.schema.ts
│   │   └── workorder.schema.ts
│   ├── utils.ts                      ← cn(), formatters
│   └── constants.ts                  ← Status colors, nav items
│
├── store/
│   └── ui.store.ts                   ← Zustand: sidebar collapsed
│
├── types/
│   └── index.ts                      ← Shared app types
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── middleware.ts                      ← Edge: auth guard
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## 4. Database Setup (Hour 0.5–1)

### Prisma Schema

Paste this entire block into `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("admin")
  createdAt    DateTime @default(now())

  assignedTickets FaultTicket[]
  assignedOrders  WorkOrder[]
  comments        TicketComment[]
}

model ServicePlan {
  id           String   @id @default(cuid())
  name         String
  speedDown    Int
  speedUp      Int
  priceMonthly Decimal  @db.Decimal(10, 2)
  technology   String

  subscriptions Subscription[]
}

model Customer {
  id        String   @id @default(cuid())
  firstName String
  lastName  String
  email     String   @unique
  phone     String?
  street    String?
  city      String?
  state     String?
  zip       String?
  status    String   @default("ACTIVE")
  createdAt DateTime @default(now())

  subscription Subscription?
  tickets      FaultTicket[]
}

model Subscription {
  id          String      @id @default(cuid())
  customerId  String      @unique
  customer    Customer    @relation(fields: [customerId], references: [id])
  planId      String
  plan        ServicePlan @relation(fields: [planId], references: [id])
  deviceId    String?     @unique
  device      NetworkDevice? @relation(fields: [deviceId], references: [id])
  status      String      @default("ACTIVE")
  activatedAt DateTime    @default(now())
}

model NetworkDevice {
  id              String    @id @default(cuid())
  serialNumber    String    @unique
  model           String
  vendor          String
  type            String
  technology      String
  status          String    @default("ONLINE")
  ipAddress       String?
  firmwareVersion String?
  configVersion   String?
  locationLat     Float?
  locationLng     Float?
  installDate     DateTime?
  lastSeenAt      DateTime?
  createdAt       DateTime  @default(now())

  subscription Subscription?
  metrics      PerformanceMetric[]
  tickets      FaultTicket[]
  alertRules   AlertRule[]
  alertEvents  AlertEvent[]
}

model PerformanceMetric {
  id         String        @id @default(cuid())
  deviceId   String
  device     NetworkDevice @relation(fields: [deviceId], references: [id])
  metricName String
  value      Float
  unit       String
  timestamp  DateTime

  @@index([deviceId, metricName, timestamp])
}

model FaultTicket {
  id          String        @id @default(cuid())
  title       String
  description String
  severity    String
  status      String        @default("OPEN")
  deviceId    String?
  device      NetworkDevice? @relation(fields: [deviceId], references: [id])
  customerId  String?
  customer    Customer?     @relation(fields: [customerId], references: [id])
  assigneeId  String?
  assignee    User?         @relation(fields: [assigneeId], references: [id])
  createdAt   DateTime      @default(now())
  resolvedAt  DateTime?

  comments   TicketComment[]
  workOrders WorkOrder[]

  @@index([status])
  @@index([severity])
}

model TicketComment {
  id        String      @id @default(cuid())
  ticketId  String
  ticket    FaultTicket @relation(fields: [ticketId], references: [id])
  authorId  String
  author    User        @relation(fields: [authorId], references: [id])
  body      String
  createdAt DateTime    @default(now())
}

model WorkOrder {
  id         String       @id @default(cuid())
  title      String
  type       String
  status     String       @default("PENDING")
  ticketId   String?
  ticket     FaultTicket? @relation(fields: [ticketId], references: [id])
  assigneeId String?
  assignee   User?        @relation(fields: [assigneeId], references: [id])
  dueDate    DateTime?
  notes      String?
  createdAt  DateTime     @default(now())
}

model InventoryItem {
  id             String   @id @default(cuid())
  name           String
  type           String
  serialNumber   String?
  status         String   @default("AVAILABLE")
  assignedDevice String?
  location       String?
  createdAt      DateTime @default(now())
}

model AlertRule {
  id         String        @id @default(cuid())
  deviceId   String
  device     NetworkDevice @relation(fields: [deviceId], references: [id])
  metricName String
  threshold  Float
  operator   String
  severity   String

  alertEvents AlertEvent[]
}

model AlertEvent {
  id           String        @id @default(cuid())
  ruleId       String
  rule         AlertRule     @relation(fields: [ruleId], references: [id])
  deviceId     String
  device       NetworkDevice @relation(fields: [deviceId], references: [id])
  value        Float
  severity     String
  acknowledged Boolean       @default(false)
  createdAt    DateTime      @default(now())

  @@index([deviceId, createdAt])
}
```

### Migration commands:
```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

### Prisma Client singleton (`server/db.ts`):
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 5. Seed Script (Hour 0.5–1)

Full implementation for `prisma/seed.ts`. This is the most important file — get it right first.

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1))
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000)
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000)
}

function minutesAgo(m: number) {
  return new Date(Date.now() - m * 60 * 1000)
}

/** Generate a sine-wave-ish value for realistic time-series data */
function sineValue(base: number, amplitude: number, i: number, period = 288) {
  return base + amplitude * Math.sin((2 * Math.PI * i) / period) + randomBetween(-amplitude * 0.2, amplitude * 0.2)
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const CUSTOMERS = [
  // 35 ACTIVE
  { firstName: 'James', lastName: 'Mitchell', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Sarah', lastName: 'Johnson', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Robert', lastName: 'Chen', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Emily', lastName: 'Davis', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Michael', lastName: 'Thompson', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Jessica', lastName: 'Wilson', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'David', lastName: 'Martinez', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Ashley', lastName: 'Anderson', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Christopher', lastName: 'Taylor', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Amanda', lastName: 'Moore', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Daniel', lastName: 'Jackson', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Melissa', lastName: 'White', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Matthew', lastName: 'Harris', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Jennifer', lastName: 'Martin', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Joshua', lastName: 'Garcia', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Lauren', lastName: 'Rodriguez', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Andrew', lastName: 'Lewis', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Stephanie', lastName: 'Lee', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Ryan', lastName: 'Walker', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Nicole', lastName: 'Hall', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Justin', lastName: 'Allen', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Megan', lastName: 'Young', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Brandon', lastName: 'King', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Brittany', lastName: 'Wright', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Tyler', lastName: 'Scott', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Kayla', lastName: 'Torres', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Nathan', lastName: 'Nguyen', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Amber', lastName: 'Hill', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Kevin', lastName: 'Adams', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Rachel', lastName: 'Baker', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  { firstName: 'Eric', lastName: 'Gonzalez', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Samantha', lastName: 'Nelson', city: 'Clearwater', state: 'OH', status: 'ACTIVE' },
  { firstName: 'Adam', lastName: 'Carter', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Heather', lastName: 'Mitchell', city: 'Maplewood', state: 'CA', status: 'ACTIVE' },
  { firstName: 'Jonathan', lastName: 'Perez', city: 'Ridgeview', state: 'TX', status: 'ACTIVE' },
  // 10 SUSPENDED
  { firstName: 'Victoria', lastName: 'Roberts', city: 'Ridgeview', state: 'TX', status: 'SUSPENDED' },
  { firstName: 'Patrick', lastName: 'Turner', city: 'Clearwater', state: 'OH', status: 'SUSPENDED' },
  { firstName: 'Diana', lastName: 'Phillips', city: 'Clearwater', state: 'OH', status: 'SUSPENDED' },
  { firstName: 'Sean', lastName: 'Campbell', city: 'Maplewood', state: 'CA', status: 'SUSPENDED' },
  { firstName: 'Tiffany', lastName: 'Parker', city: 'Maplewood', state: 'CA', status: 'SUSPENDED' },
  { firstName: 'Gregory', lastName: 'Evans', city: 'Ridgeview', state: 'TX', status: 'SUSPENDED' },
  { firstName: 'Vanessa', lastName: 'Edwards', city: 'Ridgeview', state: 'TX', status: 'SUSPENDED' },
  { firstName: 'Kyle', lastName: 'Collins', city: 'Clearwater', state: 'OH', status: 'SUSPENDED' },
  { firstName: 'Natalie', lastName: 'Stewart', city: 'Clearwater', state: 'OH', status: 'SUSPENDED' },
  { firstName: 'Derek', lastName: 'Sanchez', city: 'Maplewood', state: 'CA', status: 'SUSPENDED' },
  // 5 TERMINATED
  { firstName: 'Chelsea', lastName: 'Morris', city: 'Maplewood', state: 'CA', status: 'TERMINATED' },
  { firstName: 'Travis', lastName: 'Rogers', city: 'Ridgeview', state: 'TX', status: 'TERMINATED' },
  { firstName: 'Danielle', lastName: 'Reed', city: 'Ridgeview', state: 'TX', status: 'TERMINATED' },
  { firstName: 'Brett', lastName: 'Cook', city: 'Clearwater', state: 'OH', status: 'TERMINATED' },
  { firstName: 'Lindsey', lastName: 'Morgan', city: 'Clearwater', state: 'OH', status: 'TERMINATED' },
]

const TICKET_TEMPLATES = [
  { title: 'OLT port saturation on Calix E7-2 — SLOT-3 at 94% capacity', severity: 'CRITICAL', description: 'Port utilization on SLOT-3 has exceeded 90% threshold for the past 2 hours. Downstream subscribers experiencing throughput degradation. Immediate capacity review required.' },
  { title: 'ONT offline — no signal — 42 Maple Street subscriber', severity: 'CRITICAL', description: 'Subscriber ONT at 42 Maple Street has been offline for 45 minutes. No OLT registration. Possible fiber cut or power failure at CPE.' },
  { title: 'Latency spike affecting 8 downstream subscribers', severity: 'CRITICAL', description: 'Average latency increased from 8ms to 180ms on the north distribution segment. Affecting 8 Pro and Gigabit plan subscribers. Possible upstream router issue.' },
  { title: 'Nokia 7360 OLT — card fault alarm on XGS-PON line card 3', severity: 'CRITICAL', description: 'Hardware fault alarm triggered on XGS-PON line card in slot 3. Card may need replacement. 23 ONTs at risk.' },
  { title: 'Backbone router memory utilization at 91%', severity: 'CRITICAL', description: 'Cisco ASR1001 memory utilization has been above 85% for 3 hours. Performance degradation imminent. Requires immediate process audit.' },
  { title: 'Firmware EOL on Nokia 7360 — security patch required', severity: 'HIGH', description: 'Nokia 7360 is running firmware v7.2.1 which reached end-of-life 60 days ago. Security patch v8.1.0 available. Maintenance window required for upgrade.' },
  { title: 'Subscriber SLA breach risk — Pro plan latency SLA at limit', severity: 'HIGH', description: 'Three Pro plan subscribers near SLA latency threshold (25ms). Current average 22ms. Potential SLA credit liability if not remediated.' },
  { title: 'Packet loss 6% on degraded ONT — SN: C7F2A19B3', severity: 'HIGH', description: 'ONT serial C7F2A19B3 showing consistent 6% packet loss for 90 minutes. Subscriber reports video call drops. Possible dirty optical connector or fiber micro-bend.' },
  { title: 'New installation failing — ONT not registering on OLT', severity: 'HIGH', description: 'New subscriber installation at 88 Ridgeview Blvd unable to complete. ONT not authenticating on OLT. Tech on-site reports fiber continuity confirmed. Possible auth config issue.' },
  { title: 'DHCP pool exhaustion warning — 89% utilization', severity: 'HIGH', description: 'Primary DHCP pool for residential subscribers at 89% capacity. Estimated exhaustion in 48 hours at current growth rate.' },
  { title: 'Billing sync failure — 3 subscriptions not reporting usage', severity: 'HIGH', description: '3 subscriber accounts not sending usage data to billing system for the past 24 hours. Revenue impact risk. Subscription IDs flagged for investigation.' },
  { title: 'ONT power cycle loop detected — 17 Pine Ave', severity: 'HIGH', description: 'ONT at 17 Pine Ave rebooting every 15-20 minutes. Subscriber connection repeatedly dropping. Likely power supply degradation on CPE.' },
  { title: 'Scheduled maintenance — Juniper MX104 config backup overdue', severity: 'MEDIUM', description: 'Automated config backup for Juniper MX104 has failed for the past 5 days. Manual backup required before next maintenance window.' },
  { title: 'Upstream bandwidth utilization trending high — 78% at peak', severity: 'MEDIUM', description: 'Peak hour upstream utilization reached 78% this evening. Above 80% threshold alert expected within 2 weeks if growth continues.' },
  { title: 'ONT firmware batch update required — 8 devices on v3.1.2', severity: 'MEDIUM', description: '8 ONT devices still running firmware v3.1.2. Current recommended version is v3.4.0. Update addresses stability improvements.' },
  { title: 'Subscriber bandwidth test shows 40% below advertised speed', severity: 'MEDIUM', description: 'Standard plan subscriber reporting speeds of 60Mbps vs advertised 100Mbps. Speed test via ISPNexus confirms. Investigation needed.' },
  { title: 'Switch CPU at 72% — investigate spanning tree convergence', severity: 'MEDIUM', description: 'Cisco Catalyst 9300 CPU utilization elevated. Spanning tree logs show frequent topology changes. May indicate loop or misconfigured port.' },
  { title: 'Optical power level low on ONT — SN: A1B2C3D4E5', severity: 'MEDIUM', description: 'Receive optical power -28dBm, approaching sensitivity threshold of -30dBm. Fiber connection inspection recommended.' },
  { title: 'Customer report: sporadic drops between 6–9 PM daily', severity: 'MEDIUM', description: 'Subscriber at 204 Oak Lane reports daily connection interruptions during peak hours. Usage data review needed to correlate with network congestion.' },
  { title: 'Work order overdue — installation at 56 Birch Road', severity: 'MEDIUM', description: 'Field technician work order for new installation at 56 Birch Road is 2 days past due date. Subscriber has not been contacted.' },
  { title: 'Alert rule threshold calibration needed — false positives', severity: 'MEDIUM', description: 'Latency alert rule triggering 40+ times per day with actual latency readings of 21-23ms vs threshold of 20ms. Threshold needs adjustment.' },
  { title: 'Inventory count discrepancy — 3 ONTs unaccounted', severity: 'MEDIUM', description: 'Physical count of ONT inventory does not match system records. 3 units showing as AVAILABLE in system but not found in warehouse.' },
  { title: 'ONT reboot detected — possible power flicker at site', severity: 'LOW', description: 'ONT at 78 Elm Street rebooted once at 3:42 AM. Likely power fluctuation. No ongoing issues detected. Monitoring for recurrence.' },
  { title: 'Documentation update required — network diagram outdated', severity: 'LOW', description: 'Current network topology diagram does not reflect 4 ONT installations from last month. NOC team requires updated documentation.' },
  { title: 'Subscriber requested speed tier downgrade', severity: 'LOW', description: 'Subscriber at 112 Walnut Ave requested downgrade from Pro (500M) to Standard (100M) plan. Requires provisioning change and billing update.' },
  { title: 'Alert acknowledgement backlog — 12 low severity events', severity: 'LOW', description: '12 low-severity alert events remain unacknowledged from the past 48 hours. Team to review and acknowledge or escalate.' },
  { title: 'Fiber splice enclosure inspection overdue — scheduled Q1', severity: 'LOW', description: 'Quarterly inspection of outdoor fiber splice enclosures on the north segment is overdue. Schedule field visit.' },
]

async function main() {
  console.log('🌱 Starting ISPNexus seed...')

  // Clean up in correct order
  await prisma.alertEvent.deleteMany()
  await prisma.alertRule.deleteMany()
  await prisma.ticketComment.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.faultTicket.deleteMany()
  await prisma.performanceMetric.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.networkDevice.deleteMany()
  await prisma.servicePlan.deleteMany()
  await prisma.user.deleteMany()

  // ── 1. Users ─────────────────────────────────────────────────────────────
  console.log('👤 Creating users...')
  const passwordHash = await bcrypt.hash('Demo1234!', 12)

  const [adminUser, nocUser, noc2User, csrUser, csr2User] = await Promise.all([
    prisma.user.create({ data: { email: 'admin@ispnexus.demo', passwordHash, name: 'Alex Rivera', role: 'admin' } }),
    prisma.user.create({ data: { email: 'noc@ispnexus.demo', passwordHash, name: 'Sam Chen', role: 'noc' } }),
    prisma.user.create({ data: { email: 'noc2@ispnexus.demo', passwordHash, name: 'Jordan Park', role: 'noc' } }),
    prisma.user.create({ data: { email: 'csr@ispnexus.demo', passwordHash, name: 'Casey Williams', role: 'csr' } }),
    prisma.user.create({ data: { email: 'csr2@ispnexus.demo', passwordHash, name: 'Morgan Taylor', role: 'csr' } }),
  ])
  const allUsers = [adminUser, nocUser, noc2User, csrUser, csr2User]

  // ── 2. Service Plans ──────────────────────────────────────────────────────
  console.log('📋 Creating service plans...')
  const [planStarter, planStandard, planPro, planGig] = await Promise.all([
    prisma.servicePlan.create({ data: { name: 'Starter', speedDown: 25, speedUp: 10, priceMonthly: 29.99, technology: 'GPON' } }),
    prisma.servicePlan.create({ data: { name: 'Standard', speedDown: 100, speedUp: 25, priceMonthly: 49.99, technology: 'GPON' } }),
    prisma.servicePlan.create({ data: { name: 'Pro', speedDown: 500, speedUp: 100, priceMonthly: 79.99, technology: 'XGS_PON' } }),
    prisma.servicePlan.create({ data: { name: 'Gigabit', speedDown: 1000, speedUp: 500, priceMonthly: 99.99, technology: 'XGS_PON' } }),
  ])
  const plans = [planStarter, planStandard, planPro, planGig]

  // ── 3. Network Devices ────────────────────────────────────────────────────
  console.log('🖥️  Creating network devices...')

  const oltCalix = await prisma.networkDevice.create({
    data: {
      serialNumber: 'CLX-E72-001A2B3C',
      model: 'E7-2', vendor: 'Calix', type: 'OLT', technology: 'GPON',
      status: 'ONLINE', ipAddress: '10.0.1.1', firmwareVersion: '22.4.1',
      configVersion: 'cfg-2025-02-14', installDate: daysAgo(540),
      lastSeenAt: minutesAgo(2), locationLat: 37.3861, locationLng: -122.0839,
    }
  })

  const oltNokia = await prisma.networkDevice.create({
    data: {
      serialNumber: 'NOK-7360-002D4E5F',
      model: '7360 ISAM FX', vendor: 'Nokia', type: 'OLT', technology: 'XGS_PON',
      status: 'ONLINE', ipAddress: '10.0.1.2', firmwareVersion: '8.1.0',
      configVersion: 'cfg-2025-01-28', installDate: daysAgo(365),
      lastSeenAt: minutesAgo(1), locationLat: 37.3861, locationLng: -122.0839,
    }
  })

  const routerCisco = await prisma.networkDevice.create({
    data: {
      serialNumber: 'CSC-ASR1001-ABCDEF',
      model: 'ASR1001-X', vendor: 'Cisco', type: 'ROUTER', technology: 'ETHERNET',
      status: 'ONLINE', ipAddress: '10.0.0.1', firmwareVersion: 'IOS-XE 17.9.3',
      configVersion: 'cfg-2025-03-01', installDate: daysAgo(720),
      lastSeenAt: minutesAgo(1),
    }
  })

  const routerJuniper = await prisma.networkDevice.create({
    data: {
      serialNumber: 'JNP-MX104-123456',
      model: 'MX104', vendor: 'Juniper', type: 'ROUTER', technology: 'ETHERNET',
      status: 'ONLINE', ipAddress: '10.0.0.2', firmwareVersion: 'Junos 23.2R1',
      configVersion: 'cfg-2025-02-20', installDate: daysAgo(600),
      lastSeenAt: minutesAgo(3),
    }
  })

  const switchCisco = await prisma.networkDevice.create({
    data: {
      serialNumber: 'CSC-CAT9300-789012',
      model: 'Catalyst 9300-48P', vendor: 'Cisco', type: 'SWITCH', technology: 'ETHERNET',
      status: 'ONLINE', ipAddress: '10.0.2.1', firmwareVersion: 'IOS-XE 17.11.1',
      configVersion: 'cfg-2025-02-28', installDate: daysAgo(450),
      lastSeenAt: minutesAgo(5),
    }
  })

  const ontVendors = [
    { vendor: 'Calix', model: '716GE-I', technology: 'GPON' },
    { vendor: 'Nokia', model: 'G-010S-A', technology: 'XGS_PON' },
    { vendor: 'ZTE', model: 'F660', technology: 'GPON' },
  ]

  const onts: Awaited<ReturnType<typeof prisma.networkDevice.create>>[] = []
  for (let i = 0; i < 15; i++) {
    const isOnline = i < 12
    const isDegraded = i === 12 || i === 13
    const isOffline = i === 14
    const v = ontVendors[i % 3]
    const status = isOnline ? 'ONLINE' : isDegraded ? 'DEGRADED' : 'OFFLINE'
    const lastSeen = isOffline ? daysAgo(3) : minutesAgo(randomInt(1, 10))

    const ont = await prisma.networkDevice.create({
      data: {
        serialNumber: `ONT-${v.vendor.slice(0, 3).toUpperCase()}-${(i + 1).toString().padStart(3, '0')}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        model: v.model, vendor: v.vendor, type: 'ONT', technology: v.technology,
        status,
        ipAddress: `192.168.${randomInt(1, 10)}.${randomInt(2, 254)}`,
        firmwareVersion: v.vendor === 'Calix' ? '21.9.2' : v.vendor === 'Nokia' ? '3.4.0' : '2.1.8',
        configVersion: `cfg-${(i + 1).toString().padStart(3, '0')}`,
        installDate: daysAgo(randomInt(30, 500)),
        lastSeenAt: lastSeen,
      }
    })
    onts.push(ont)
  }

  const cpeDevices = onts // ONTs are the CPE devices assigned to subscribers
  const infraDevices = [oltCalix, oltNokia, routerCisco, routerJuniper, switchCisco]

  // ── 4. Customers & Subscriptions ──────────────────────────────────────────
  console.log('👥 Creating customers & subscriptions...')

  const customers = await Promise.all(
    CUSTOMERS.map(async (c, i) => {
      const streetNum = randomInt(10, 999)
      const streets = ['Maple St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Birch Ln', 'Cedar Blvd', 'Walnut Way', 'Willow Ct']
      const zip = c.state === 'CA' ? `9${randomInt(4000, 5999)}` : c.state === 'TX' ? `7${randomInt(5000, 9999)}` : `4${randomInt(3000, 7999)}`

      return prisma.customer.create({
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          email: `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}${i}@example.com`,
          phone: `+1${randomInt(2000000000, 9999999999)}`,
          street: `${streetNum} ${streets[i % streets.length]}`,
          city: c.city, state: c.state, zip,
          status: c.status,
          createdAt: daysAgo(randomInt(1, 720)),
        }
      })
    })
  )

  // Create subscriptions for non-terminated customers
  const plansDistribution = [planStarter, planStarter, planStandard, planStandard, planPro, planPro, planGig]
  let ontIndex = 0

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i]
    if (customer.status === 'TERMINATED') continue

    const plan = plansDistribution[i % plansDistribution.length]
    const assignedOnt = ontIndex < cpeDevices.length ? cpeDevices[ontIndex] : null
    ontIndex++

    await prisma.subscription.create({
      data: {
        customerId: customer.id,
        planId: plan.id,
        deviceId: assignedOnt?.id ?? undefined,
        status: customer.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
        activatedAt: daysAgo(randomInt(1, 700)),
      }
    })
  }

  // ── 5. Performance Metrics ────────────────────────────────────────────────
  console.log('📊 Creating performance metrics (this takes ~20s)...')

  const allDevices = [...infraDevices, ...onts]

  for (const device of allDevices) {
    if (device.status === 'OFFLINE') continue

    const isDegraded = device.status === 'DEGRADED'
    const isOLT = device.type === 'OLT'
    const isRouter = device.type === 'ROUTER'

    // Determine bandwidth range based on device type
    const bwBase = isOLT ? 400 : isRouter ? 500 : randomInt(20, 80)
    const bwAmp = isOLT ? 200 : isRouter ? 150 : randomInt(5, 20)
    const latBase = isDegraded ? 120 : isOLT ? 4 : isRouter ? 3 : 12
    const latAmp = isDegraded ? 60 : isOLT ? 2 : isRouter ? 1 : 5
    const plossBase = isDegraded ? 4 : 0
    const plossAmp = isDegraded ? 3 : 0

    const metricsToInsert: {
      deviceId: string
      metricName: string
      value: number
      unit: string
      timestamp: Date
    }[] = []

    // Last 6 hours: one point every 5 minutes = 72 points (for monitoring page)
    for (let i = 0; i < 72; i++) {
      const timestamp = minutesAgo((72 - i) * 5)
      const bwDown = Math.max(0, sineValue(bwBase, bwAmp, i, 72))
      const bwUp = Math.max(0, bwDown * (isOLT ? 0.3 : 0.25) + randomBetween(-5, 5))
      const latency = Math.max(1, sineValue(latBase, latAmp, i, 72))
      const packetLoss = Math.max(0, plossBase + randomBetween(-plossAmp, plossAmp))

      metricsToInsert.push(
        { deviceId: device.id, metricName: 'bandwidth_down', value: parseFloat(bwDown.toFixed(2)), unit: 'Mbps', timestamp },
        { deviceId: device.id, metricName: 'bandwidth_up', value: parseFloat(bwUp.toFixed(2)), unit: 'Mbps', timestamp },
        { deviceId: device.id, metricName: 'latency', value: parseFloat(latency.toFixed(2)), unit: 'ms', timestamp },
        { deviceId: device.id, metricName: 'packet_loss', value: parseFloat(packetLoss.toFixed(3)), unit: '%', timestamp },
      )
    }

    // Last 30 days: one point per day (for subscriber usage charts)
    for (let d = 30; d >= 1; d--) {
      const timestamp = daysAgo(d)
      const bwDown = Math.max(0, bwBase + randomBetween(-bwAmp * 0.5, bwAmp * 0.5))
      const bwUp = Math.max(0, bwDown * 0.25 + randomBetween(-2, 2))

      metricsToInsert.push(
        { deviceId: device.id, metricName: 'bandwidth_down_daily', value: parseFloat(bwDown.toFixed(2)), unit: 'Mbps', timestamp },
        { deviceId: device.id, metricName: 'bandwidth_up_daily', value: parseFloat(bwUp.toFixed(2)), unit: 'Mbps', timestamp },
      )
    }

    await prisma.performanceMetric.createMany({ data: metricsToInsert })
  }

  // ── 6. Fault Tickets ──────────────────────────────────────────────────────
  console.log('🎫 Creating fault tickets...')

  const ticketStatusBySeverity: Record<string, string[]> = {
    CRITICAL: ['OPEN', 'OPEN', 'IN_PROGRESS', 'IN_PROGRESS', 'RESOLVED'],
    HIGH:     ['OPEN', 'OPEN', 'OPEN', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'RESOLVED', 'RESOLVED'],
    MEDIUM:   ['OPEN', 'OPEN', 'OPEN', 'OPEN', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'RESOLVED', 'RESOLVED', 'RESOLVED', 'RESOLVED'],
    LOW:      ['OPEN', 'RESOLVED', 'RESOLVED', 'RESOLVED', 'RESOLVED'],
  }

  const ticketsBySeverity: Record<string, typeof TICKET_TEMPLATES> = {
    CRITICAL: TICKET_TEMPLATES.slice(0, 5),
    HIGH:     TICKET_TEMPLATES.slice(5, 13),
    MEDIUM:   TICKET_TEMPLATES.slice(13, 25),
    LOW:      TICKET_TEMPLATES.slice(25),
  }

  const createdTickets = []
  const assignees = [nocUser, noc2User, adminUser]

  for (const [severity, templates] of Object.entries(ticketsBySeverity)) {
    const statuses = ticketStatusBySeverity[severity]
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      const status = statuses[i]
      const createdAt = daysAgo(randomInt(1, 30))
      const resolvedAt = status === 'RESOLVED' ? new Date(createdAt.getTime() + randomInt(2, 48) * 3600000) : null
      const device = infraDevices[randomInt(0, infraDevices.length - 1)]
      const customer = customers[randomInt(0, 34)] // active customers only

      const ticket = await prisma.faultTicket.create({
        data: {
          title: template.title,
          description: template.description,
          severity, status,
          deviceId: device.id,
          customerId: customer.id,
          assigneeId: assignees[randomInt(0, assignees.length - 1)].id,
          createdAt,
          resolvedAt,
        }
      })
      createdTickets.push(ticket)
    }
  }

  // ── 7. Ticket Comments ────────────────────────────────────────────────────
  console.log('💬 Creating ticket comments...')

  const commentTemplates = [
    'Investigating the issue now. Initial analysis points to a hardware fault.',
    'Remote diagnostics complete. Rebooted the device, monitoring for stability.',
    'Dispatched field tech. ETA 2 hours.',
    'Root cause identified: firmware bug in version 3.1.2. Patch available.',
    'Subscriber notified via email and phone. They are aware of the ongoing issue.',
    'Escalated to Tier 2 NOC. Requires on-site inspection.',
    'Configuration backup created before applying changes.',
    'Fix applied. Monitoring for the next 30 minutes before closing.',
    'Confirmed with subscriber that service is restored. Closing ticket.',
    'Work order created and assigned to field team for physical inspection.',
    'Optical power levels checked — within acceptable range at -24dBm.',
    'Upstream provider notified. Waiting on their confirmation.',
  ]

  for (const ticket of createdTickets) {
    const numComments = randomInt(1, 3)
    for (let c = 0; c < numComments; c++) {
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: allUsers[randomInt(0, allUsers.length - 1)].id,
          body: commentTemplates[randomInt(0, commentTemplates.length - 1)],
          createdAt: new Date(ticket.createdAt.getTime() + randomInt(10, 240) * 60000),
        }
      })
    }
  }

  // ── 8. Work Orders ────────────────────────────────────────────────────────
  console.log('🔧 Creating work orders...')

  const woTypes = ['INSTALL', 'INSTALL', 'INSTALL', 'INSTALL', 'INSTALL', 'INSTALL',
                   'REPAIR', 'REPAIR', 'REPAIR', 'REPAIR', 'REPAIR',
                   'UPGRADE', 'UPGRADE', 'UPGRADE', 'SURVEY']
  const woStatuses = ['PENDING', 'PENDING', 'PENDING',
                      'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS',
                      'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED',
                      'CANCELLED']
  const woTitles = [
    'New fiber installation — 12 Birch Lane', 'ONT installation — 88 Ridgeview Blvd',
    'Service activation — 204 Oak Lane', 'New business installation — 500 Commerce Dr',
    'Residential install — 34 Willow Court', 'Install — 67 Cedar Boulevard',
    'ONT replacement — signal degraded — 42 Maple St', 'Fiber repair — suspected cut near node 3',
    'ONT power supply replacement — 17 Pine Ave', 'Optical connector cleaning — cabinet B7',
    'Emergency repair — OLT port card fault', 'Firmware upgrade — batch ONT update v3.4.0',
    'Router software upgrade — Juniper MX104 Junos 23.4', 'OLT capacity upgrade — add line card SLOT-4',
    'Network survey — north quadrant expansion planning',
  ]

  const resolvedTickets = createdTickets.filter(t => t.status !== 'OPEN')
  for (let i = 0; i < 15; i++) {
    const linkedTicket = i < 10 ? resolvedTickets[i % resolvedTickets.length] : null
    await prisma.workOrder.create({
      data: {
        title: woTitles[i],
        type: woTypes[i],
        status: woStatuses[i],
        ticketId: linkedTicket?.id ?? null,
        assigneeId: [nocUser, noc2User][randomInt(0, 1)].id,
        dueDate: daysAgo(randomInt(-14, 7)),
        notes: i % 3 === 0 ? 'Customer requires morning appointment. Access code: 4821' : null,
        createdAt: daysAgo(randomInt(1, 21)),
      }
    })
  }

  // ── 9. Inventory ──────────────────────────────────────────────────────────
  console.log('📦 Creating inventory...')

  const inventoryItems = [
    ...Array.from({ length: 10 }, (_, i) => ({ name: `Calix 716GE-I ONT Unit ${i + 1}`, type: 'ONT', serialNumber: `INV-CLX-${(i + 1).toString().padStart(4, '0')}`, status: 'AVAILABLE', location: 'Warehouse A - Shelf 3' })),
    { name: 'Nokia G-010S-A ONT Unit 1', type: 'ONT', serialNumber: 'INV-NOK-0001', status: 'IN_USE', location: 'Deployed - 14 Cedar Blvd' },
    { name: 'Nokia G-010S-A ONT Unit 2', type: 'ONT', serialNumber: 'INV-NOK-0002', status: 'IN_USE', location: 'Deployed - 88 Oak Ave' },
    { name: 'Nokia G-010S-A ONT Unit 3', type: 'ONT', serialNumber: 'INV-NOK-0003', status: 'AVAILABLE', location: 'Warehouse A - Shelf 4' },
    { name: 'SFP+ 10G SR Transceiver #1', type: 'TRANSCEIVER', serialNumber: 'INV-SFP-0001', status: 'AVAILABLE', location: 'Cabinet B - Parts Bin' },
    { name: 'SFP+ 10G SR Transceiver #2', type: 'TRANSCEIVER', serialNumber: 'INV-SFP-0002', status: 'AVAILABLE', location: 'Cabinet B - Parts Bin' },
    { name: 'SFP+ 10G SR Transceiver #3', type: 'TRANSCEIVER', serialNumber: 'INV-SFP-0003', status: 'AVAILABLE', location: 'Cabinet B - Parts Bin' },
    { name: 'SFP+ 10G SR Transceiver #4', type: 'TRANSCEIVER', serialNumber: 'INV-SFP-0004', status: 'AVAILABLE', location: 'Cabinet B - Parts Bin' },
    { name: 'SC/APC Patch Cable 50m #1', type: 'CABLE', serialNumber: null, status: 'AVAILABLE', location: 'Warehouse A - Cable Rack' },
    { name: 'SC/APC Patch Cable 50m #2', type: 'CABLE', serialNumber: null, status: 'AVAILABLE', location: 'Warehouse A - Cable Rack' },
    { name: 'SC/APC Patch Cable 50m #3', type: 'CABLE', serialNumber: null, status: 'AVAILABLE', location: 'Warehouse A - Cable Rack' },
    { name: 'Fiber Splice Kit #1', type: 'TOOL', serialNumber: 'INV-FSK-0001', status: 'AVAILABLE', location: 'Field Team - Van 1' },
    { name: 'Fiber Splice Kit #2', type: 'TOOL', serialNumber: 'INV-FSK-0002', status: 'MAINTENANCE', location: 'Repair Shop - Calibration' },
    { name: 'OTDR Tester (EXFO FTB-1)', type: 'TOOL', serialNumber: 'INV-OTDR-0001', status: 'AVAILABLE', location: 'Field Team - Van 1' },
  ]

  await prisma.inventoryItem.createMany({ data: inventoryItems })

  // ── 10. Alert Rules ───────────────────────────────────────────────────────
  console.log('🔔 Creating alert rules...')

  const alertRulesData = [
    { deviceId: oltCalix.id, metricName: 'bandwidth_down', threshold: 900, operator: 'GT', severity: 'CRITICAL' },
    { deviceId: oltCalix.id, metricName: 'latency', threshold: 20, operator: 'GT', severity: 'HIGH' },
    { deviceId: oltNokia.id, metricName: 'bandwidth_down', threshold: 900, operator: 'GT', severity: 'CRITICAL' },
    { deviceId: oltNokia.id, metricName: 'packet_loss', threshold: 1, operator: 'GT', severity: 'HIGH' },
    { deviceId: routerCisco.id, metricName: 'bandwidth_down', threshold: 800, operator: 'GT', severity: 'HIGH' },
    { deviceId: routerCisco.id, metricName: 'packet_loss', threshold: 1, operator: 'GT', severity: 'CRITICAL' },
    { deviceId: routerJuniper.id, metricName: 'bandwidth_down', threshold: 800, operator: 'GT', severity: 'HIGH' },
    { deviceId: routerJuniper.id, metricName: 'latency', threshold: 15, operator: 'GT', severity: 'MEDIUM' },
    { deviceId: onts[12].id, metricName: 'latency', threshold: 100, operator: 'GT', severity: 'HIGH' },
    { deviceId: onts[12].id, metricName: 'packet_loss', threshold: 5, operator: 'GT', severity: 'CRITICAL' },
  ]

  const alertRules = await Promise.all(
    alertRulesData.map(data => prisma.alertRule.create({ data }))
  )

  // ── 11. Alert Events ──────────────────────────────────────────────────────
  console.log('⚠️  Creating alert events...')

  const alertEventDefs = [
    // CRITICAL unacknowledged
    { ruleIdx: 0, deviceId: oltCalix.id, value: 947.3, severity: 'CRITICAL', acknowledged: false, minsAgo: 25 },
    { ruleIdx: 2, deviceId: oltNokia.id, value: 923.8, severity: 'CRITICAL', acknowledged: false, minsAgo: 15 },
    { ruleIdx: 5, deviceId: routerCisco.id, value: 1.8, severity: 'CRITICAL', acknowledged: false, minsAgo: 45 },
    { ruleIdx: 9, deviceId: onts[12].id, value: 6.2, severity: 'CRITICAL', acknowledged: false, minsAgo: 8 },
    // CRITICAL acknowledged
    { ruleIdx: 0, deviceId: oltCalix.id, value: 912.1, severity: 'CRITICAL', acknowledged: true, minsAgo: 180 },
    { ruleIdx: 2, deviceId: oltNokia.id, value: 956.4, severity: 'CRITICAL', acknowledged: true, minsAgo: 240 },
    { ruleIdx: 5, deviceId: routerCisco.id, value: 2.1, severity: 'CRITICAL', acknowledged: true, minsAgo: 300 },
    { ruleIdx: 9, deviceId: onts[12].id, value: 7.8, severity: 'CRITICAL', acknowledged: true, minsAgo: 360 },
    // HIGH unacknowledged
    { ruleIdx: 1, deviceId: oltCalix.id, value: 24.7, severity: 'HIGH', acknowledged: false, minsAgo: 35 },
    { ruleIdx: 4, deviceId: routerCisco.id, value: 842.3, severity: 'HIGH', acknowledged: false, minsAgo: 55 },
    { ruleIdx: 8, deviceId: onts[12].id, value: 148.2, severity: 'HIGH', acknowledged: false, minsAgo: 12 },
    // HIGH acknowledged
    { ruleIdx: 1, deviceId: oltCalix.id, value: 22.1, severity: 'HIGH', acknowledged: true, minsAgo: 150 },
    { ruleIdx: 6, deviceId: routerJuniper.id, value: 818.9, severity: 'HIGH', acknowledged: true, minsAgo: 200 },
    { ruleIdx: 8, deviceId: onts[12].id, value: 165.3, severity: 'HIGH', acknowledged: true, minsAgo: 280 },
    { ruleIdx: 3, deviceId: oltNokia.id, value: 1.2, severity: 'HIGH', acknowledged: true, minsAgo: 320 },
    { ruleIdx: 6, deviceId: routerJuniper.id, value: 824.7, severity: 'HIGH', acknowledged: true, minsAgo: 260 },
    // MEDIUM acknowledged
    { ruleIdx: 7, deviceId: routerJuniper.id, value: 17.3, severity: 'MEDIUM', acknowledged: true, minsAgo: 90 },
    { ruleIdx: 7, deviceId: routerJuniper.id, value: 16.8, severity: 'MEDIUM', acknowledged: true, minsAgo: 120 },
    { ruleIdx: 7, deviceId: routerJuniper.id, value: 18.1, severity: 'MEDIUM', acknowledged: true, minsAgo: 200 },
    { ruleIdx: 7, deviceId: routerJuniper.id, value: 15.9, severity: 'MEDIUM', acknowledged: true, minsAgo: 340 },
  ]

  await prisma.alertEvent.createMany({
    data: alertEventDefs.map(e => ({
      ruleId: alertRules[e.ruleIdx].id,
      deviceId: e.deviceId,
      value: e.value,
      severity: e.severity,
      acknowledged: e.acknowledged,
      createdAt: minutesAgo(e.minsAgo),
    }))
  })

  console.log('✅ Seed complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Login: admin@ispnexus.demo / Demo1234!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "pnpm prisma db seed",
    "db:reset": "pnpm prisma migrate reset --force && pnpm db:seed",
    "typecheck": "tsc --noEmit"
  }
}
```

Install `tsx` for running seed:
```bash
pnpm add -D tsx
```

---

## 6. Authentication (Hour 0–0.5)

### `server/auth.ts`

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/server/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    }
  }
})
```

### `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/server/auth'
export const { GET, POST } = handlers
```

### `middleware.ts`

```typescript
import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/subscribers') ||
    req.nextUrl.pathname.startsWith('/devices') ||
    req.nextUrl.pathname.startsWith('/tickets') ||
    req.nextUrl.pathname.startsWith('/monitoring') ||
    req.nextUrl.pathname.startsWith('/analytics') ||
    req.nextUrl.pathname.startsWith('/workorders')

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
  if (req.nextUrl.pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)']
}
```

---

## 7. tRPC Setup

### `server/trpc/trpc.ts`

```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/db'

export const createTRPCContext = async () => {
  const session = await auth()
  return { session, db: prisma }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    }
  }
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, session: ctx.session } })
})
```

### `app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/trpc/root'
import { createTRPCContext } from '@/server/trpc/trpc'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
```

### `lib/trpc/client.ts`

```typescript
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/trpc/root'

export const api = createTRPCReact<AppRouter>()
```

### `components/providers/trpc-provider.tsx`

```typescript
'use client'
import { api } from '@/lib/trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30 * 1000, retry: 1 } }
  }))

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [httpBatchLink({ url: '/api/trpc', transformer: superjson })]
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  )
}
```

---

## 8. App Shell & Layout (Hour 1–1.5)

### Nav items constant (`lib/constants.ts`)

```typescript
import {
  LayoutDashboard, Users, Monitor, Ticket, Activity,
  BarChart3, Package, ClipboardList, Settings
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Subscribers', href: '/subscribers', icon: Users },
  { label: 'Devices',     href: '/devices',     icon: Monitor },
  { label: 'Tickets',     href: '/tickets',     icon: Ticket },
  { label: 'Monitoring',  href: '/monitoring',  icon: Activity },
  { label: 'Analytics',   href: '/analytics',   icon: BarChart3 },
  { label: 'Work Orders', href: '/workorders',  icon: ClipboardList },
  { label: 'Inventory',   href: '/inventory',   icon: Package },
] as const

export const STATUS_COLORS = {
  ONLINE:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  DEGRADED:    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  OFFLINE:     'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ACTIVE:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  SUSPENDED:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  TERMINATED:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  OPEN:        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  RESOLVED:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CLOSED:      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  PENDING:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  COMPLETED:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
} as const

export const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  HIGH:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  MEDIUM:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  LOW:      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
} as const

export const CHART_COLORS = {
  primary:   '#2563eb',
  secondary: '#0d9488',
  warning:   '#d97706',
  danger:    '#dc2626',
  muted:     '#94a3b8',
  download:  '#2563eb',
  upload:    '#0d9488',
}
```

---

## 9. Page-by-Page Implementation Guide

### Pattern for every RSC page

```typescript
// Always this shape — RSC fetches, passes to client component
import { Suspense } from 'react'
import { api } from '@/server/trpc/server' // server-side caller

export default async function PageName() {
  const data = await api.router.procedure(input)
  return (
    <div>
      <PageHeader title="Page Name" />
      <Suspense fallback={<LoadingSkeleton />}>
        <ClientComponent initialData={data} />
      </Suspense>
    </div>
  )
}
```

### Server-side tRPC caller setup

```typescript
// lib/trpc/server.ts
import { createCallerFactory } from '@trpc/server'
import { appRouter } from '@/server/trpc/root'
import { createTRPCContext } from '@/server/trpc/trpc'

const createCaller = createCallerFactory(appRouter)

export const api = async () => {
  const ctx = await createTRPCContext()
  return createCaller(ctx)
}
```

---

## 10. tRPC Routers Reference

Implement each router in `server/trpc/routers/`. Keep procedures thin — logic in the query, no separate service layer needed for hackathon.

### `dashboard.ts`
```
dashboard.getKpis         → active subscribers, prev month count, device counts, open ticket counts, MRR
dashboard.getSubGrowth    → subscriber counts per month for last 6 months (for line chart)
dashboard.getBandwidth    → avg bandwidth_down per device today, top 5 (for bar chart)
dashboard.recentTickets   → last 5 tickets with severity + status
dashboard.recentSignups   → last 5 customers with plan name
```

### `customers.ts`
```
customers.list            → paginated list with search + status filter
customers.getById         → full customer with subscription.plan, subscription.device
customers.getUsage        → PerformanceMetric bandwidth_down_daily + bandwidth_up_daily for deviceId, last 30 days
customers.create          → create customer (from modal form)
customers.updateStatus    → change customer status (suspend, reactivate)
```

### `devices.ts`
```
devices.list              → all devices with type/status filter
devices.getById           → device + subscription.customer
devices.getMetrics        → last 6h metrics for a device, by metricName (bandwidth or latency)
```

### `tickets.ts`
```
tickets.list              → paginated, filter by severity + status, newest first
tickets.getById           → ticket + device + customer + assignee + comments.author + workOrders
tickets.create            → create ticket (from modal form)
tickets.updateStatus      → change ticket status
tickets.updateAssignee    → change assignee
tickets.addComment        → add TicketComment
```

### `monitoring.ts`
```
monitoring.getDevices     → list of all devices (for selector)
monitoring.getMetrics     → last 6h bandwidth + latency metrics for a deviceId
monitoring.getSummary     → latest metric value per metricName for a deviceId (current stats)
monitoring.getAlerts      → AlertEvents for a deviceId, last 24h, newest first
```

### `analytics.ts`
```
analytics.getSubGrowth    → cumulative subscriber count per period (7d/30d/90d/6mo)
analytics.getRevenue      → MRR per month for last 12 months
analytics.getTicketVolume → ticket count per week grouped by severity, for last N weeks
analytics.getDeviceHealth → count of ONLINE/DEGRADED/OFFLINE
analytics.getTopBandwidth → top 5 customers by avg bandwidth_down_daily last 7 days
```

### `workorders.ts`
```
workorders.list           → all work orders with assignee + linked ticket, filter by status
workorders.create         → create work order
workorders.updateStatus   → change status
```

---

## 11. Server Actions Reference

Use Server Actions only for simple forms that need `revalidatePath`. Put in `server/actions/`.

```typescript
// server/actions/ticket.actions.ts
'use server'
import { prisma } from '@/server/db'
import { auth } from '@/server/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateStatusSchema = z.object({
  ticketId: z.string().cuid(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
})

export async function updateTicketStatus(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const parsed = updateStatusSchema.parse({
    ticketId: formData.get('ticketId'),
    status: formData.get('status')
  })

  await prisma.faultTicket.update({
    where: { id: parsed.ticketId },
    data: {
      status: parsed.status,
      resolvedAt: parsed.status === 'RESOLVED' ? new Date() : undefined
    }
  })

  revalidatePath(`/tickets/${parsed.ticketId}`)
  revalidatePath('/tickets')
}
```

**Prefer tRPC mutations** (`.useMutation()`) for forms in client components — they integrate better with TanStack Query cache invalidation.

---

## 12. Charting with Recharts

Standard chart setup used across all pages:

```typescript
'use client'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'

// Bandwidth chart (monitoring + device detail)
export function BandwidthChart({ data }: { data: MetricPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="timestamp" tickFormatter={(v) => format(new Date(v), 'HH:mm')} tick={{ fontSize: 12 }} />
        <YAxis unit=" Mbps" tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string) => [`${value.toFixed(1)} Mbps`, name]}
          labelFormatter={(label) => format(new Date(label as string), 'HH:mm')}
        />
        <Legend />
        <Line type="monotone" dataKey="bandwidth_down" name="Download" stroke={CHART_COLORS.download} dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="bandwidth_up" name="Upload" stroke={CHART_COLORS.upload} dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Device health donut (analytics)
export function DeviceHealthChart({ online, degraded, offline }: { online: number; degraded: number; offline: number }) {
  const data = [
    { name: 'Online', value: online, color: '#10b981' },
    { name: 'Degraded', value: degraded, color: '#f59e0b' },
    { name: 'Offline', value: offline, color: '#ef4444' },
  ]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

---

## 13. Environment Variables

### `.env.local`

```bash
# PostgreSQL — use Neon free tier
DATABASE_URL="postgresql://user:password@host/ispnexus?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/ispnexus?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# For production on Vercel — NEXTAUTH_URL not needed (auto-detected)
```

### Neon setup (free, no credit card):
1. Go to neon.tech → create project "ispnexus"
2. Copy connection string → set as DATABASE_URL (pooled) and DIRECT_URL (unpooled)
3. Run: `pnpm prisma migrate deploy && pnpm db:seed`

---

## 14. Vercel Deployment (Hour 7.5–8)

### Steps

```bash
# 1. Push to GitHub
git add -A && git commit -m "feat: ISPNexus hackathon complete"
git push origin main

# 2. Import to Vercel (one-time)
# vercel.com → New Project → Import from GitHub → ispnexus

# 3. Set environment variables in Vercel dashboard:
DATABASE_URL=<neon pooled url>
DIRECT_URL=<neon direct url>
NEXTAUTH_SECRET=<openssl rand -base64 32>
# NEXTAUTH_URL is auto-set by Vercel

# 4. Deploy
vercel --prod

# 5. Seed production DB
DATABASE_URL=<prod url> DIRECT_URL=<prod direct url> pnpm db:seed
```

### `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: { turbo: {} },
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
}

export default config
```

---

## 15. Common Patterns Cheatsheet

### Status Badge component

```typescript
// components/shared/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Status = keyof typeof STATUS_COLORS

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn('font-medium text-xs', STATUS_COLORS[status])}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
```

### KPI Card component

```typescript
// components/shared/kpi-card.tsx
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'danger' | 'warning'
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              'text-3xl font-bold mt-1',
              variant === 'danger' && 'text-red-600',
              variant === 'warning' && 'text-amber-600',
            )}>{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}% {trend.label}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Debounced search hook

```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

### Relative date formatter

```typescript
// lib/utils.ts
import { formatDistanceToNow, format } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

export function formatMRR(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatMbps(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} Gbps`
  return `${value.toFixed(1)} Mbps`
}
```

### TanStack Query mutation with toast

```typescript
'use client'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'

// In a component:
const updateStatus = api.tickets.updateStatus.useMutation({
  onSuccess: () => {
    toast.success('Ticket status updated')
    utils.tickets.getById.invalidate({ id: ticketId })
  },
  onError: (err) => {
    toast.error(err.message ?? 'Something went wrong')
  }
})
```

### Polling (monitoring page)

```typescript
const { data } = api.monitoring.getMetrics.useQuery(
  { deviceId: selectedDeviceId },
  { refetchInterval: 30_000 } // 30 seconds
)
```

### Zustand sidebar store

```typescript
// store/ui.store.ts
import { create } from 'zustand'

interface UIStore { collapsed: boolean; toggle: () => void }

export const useUIStore = create<UIStore>((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed }))
}))
```

---

## Hour-by-Hour Execution Plan

| Time | Task | Key files |
|------|------|-----------|
| 0:00–0:30 | Bootstrap, install deps, shadcn init | `package.json`, `tsconfig.json` |
| 0:30–1:00 | Prisma schema + migrate + seed script | `prisma/schema.prisma`, `prisma/seed.ts` |
| 1:00–1:30 | Auth + middleware + tRPC plumbing + layout shell | `server/auth.ts`, `middleware.ts`, `server/trpc/`, `app/(dashboard)/layout.tsx` |
| 1:30–2:30 | Dashboard page + KPI queries + mini charts | `server/trpc/routers/dashboard.ts`, `app/(dashboard)/dashboard/` |
| 2:30–3:30 | Subscribers list + detail + usage chart | `routers/customers.ts`, `app/(dashboard)/subscribers/` |
| 3:30–4:30 | Devices list + detail + metrics chart | `routers/devices.ts`, `app/(dashboard)/devices/` |
| 4:30–5:00 | Tickets list + create dialog | `routers/tickets.ts`, `app/(dashboard)/tickets/` |
| 5:00–5:30 | Ticket detail + status update + comments | `app/(dashboard)/tickets/[id]/` |
| 5:30–6:15 | Monitoring page + charts + polling | `routers/monitoring.ts`, `app/(dashboard)/monitoring/` |
| 6:15–7:00 | Analytics page + all 5 charts | `routers/analytics.ts`, `app/(dashboard)/analytics/` |
| 7:00–7:30 | Work orders page (P1) | `routers/workorders.ts`, `app/(dashboard)/workorders/` |
| 7:30–7:45 | Polish: toasts, skeletons, empty states | All pages |
| 7:45–8:00 | Vercel deploy + seed prod DB + smoke test | `vercel.com` |
