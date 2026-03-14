# ISPNexus — Hackathon PRD (8-Hour Sprint)

**Version:** 1.0.0-hackathon
**Date:** March 2026
**Duration:** 8 hours — everything must be working and demo-ready at the end
**Goal:** A fully functional, seeded, deployable ISP management platform

---

## The One-Line Pitch

> ISPNexus lets broadband ISPs manage subscribers, monitor network devices, handle fault tickets, and view live analytics — all in one modern cloud-native dashboard.

---

## What "Done" Looks Like

At the end of 8 hours, a demo user logs in and can:

1. See a live **overview dashboard** with KPI cards (subscribers, devices, active tickets, revenue)
2. Browse and search a list of **subscribers** — click one to see their full profile, subscription, and usage
3. Browse **network devices** — see status (online / degraded / offline), type, and metrics
4. Open and resolve **fault tickets** — create new ones, change status, assign to users
5. View a **monitoring page** with bandwidth and latency charts per device
6. See an **analytics page** with charts: subscriber growth, revenue trend, ticket volume
7. Manage **work orders** — create, assign, update status
8. All of the above is pre-populated with realistic seed data — no empty states on demo day

---

## User & Auth

Single user type for the hackathon: **ISP Operator (Admin)**. No multi-tenancy, no RBAC complexity. One tenant, hardcoded. Auth via NextAuth credentials (email + password).

**Seed users:**

| Email | Password | Role |
|-------|----------|------|
| `admin@ispnexus.demo` | `Demo1234!` | Admin |
| `noc@ispnexus.demo` | `Demo1234!` | NOC Engineer |
| `csr@ispnexus.demo` | `Demo1234!` | CSR |

---

## Pages to Build (in priority order)

### P0 — Must ship (core demo path)

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | Login | `/login` | Credentials form, redirect to dashboard |
| 2 | Dashboard Overview | `/dashboard` | KPI cards + mini charts + recent tickets feed |
| 3 | Subscribers List | `/subscribers` | Table with search, filter by status |
| 4 | Subscriber Detail | `/subscribers/[id]` | Profile, subscription, usage chart, ticket history |
| 5 | Devices List | `/devices` | Card/table grid, status badge, filter by type |
| 6 | Device Detail | `/devices/[id]` | Device info, 24h metrics chart |
| 7 | Fault Tickets | `/tickets` | List with severity badge, status filter, create button |
| 8 | Ticket Detail | `/tickets/[id]` | Full ticket, status change, comments |
| 9 | Monitoring | `/monitoring` | Bandwidth + latency charts, alert feed |
| 10 | Analytics | `/analytics` | Subscriber growth, revenue, ticket volume charts |

### P1 — Build if time allows (last 90 minutes)

| # | Page | Route | Description |
|---|------|-------|-------------|
| 11 | Work Orders | `/workorders` | List, create, assign, status update |
| 12 | Inventory | `/inventory` | Asset list with status and assignment |

### P2 — Skip entirely

- Customer self-service portal
- Multi-tenancy
- Email/SMS notifications
- PDF report generation
- Real-time SSE (use 30s polling instead)
- AI/ML features
- External billing integration
- API key management UI
- Map/topology visualization
- Capacity planning tools
- Mobile responsiveness (desktop-first only)

---

## Feature Specs Per Page

### 1. Login (`/login`)
- Email + password form with Zod validation
- Show inline error on bad credentials
- Redirect to `/dashboard` on success
- ISPNexus logo + branded card layout, no sidebar

### 2. Dashboard (`/dashboard`)

**KPI Cards — top row (4 cards):**
- Total Active Subscribers (number + % change badge)
- Online Devices / Total Devices (fraction + health color)
- Open Fault Tickets (number, critical count in red)
- Monthly Revenue (MRR, formatted as $XX,XXX)

**Charts — middle row:**
- Subscriber growth line chart — last 6 months cumulative
- Bandwidth utilization bar chart — today's avg per top 5 devices

**Live feeds — bottom row:**
- Recent fault tickets (last 5 rows: severity chip, title, status, time ago)
- Recent subscriber sign-ups (last 5 rows: name, plan, time ago)

### 3. Subscribers List (`/subscribers`)
- Searchable table (search by name or email, debounced 300ms)
- Status filter pills: All | Active | Suspended | Terminated — counts in badge
- Columns: Avatar+Name, Email, Plan, Status, Activation Date, Monthly Value
- Click any row → `/subscribers/[id]`
- "New Subscriber" button → modal dialog form

### 4. Subscriber Detail (`/subscribers/[id]`)
- Back link → subscribers list
- Header: avatar initials, full name, email, status badge
- Three tabs: **Overview** | **Usage** | **Tickets**
- Overview: address, plan name, speed (down/up), assigned device, activation date, monthly value
- Usage tab: 30-day bandwidth chart (download line + upload line using Recharts)
- Tickets tab: table of linked fault tickets (title, severity, status, date)

### 5. Devices List (`/devices`)
- Two view modes: Card grid (default) | Table — toggle button top-right
- Status filter: All | Online | Degraded | Offline — with colored count badges
- Type filter: All | OLT | ONT | Router | Switch
- Card view: device name/model, vendor, status badge, IP address, last seen
- Table view: all above as columns + firmware version
- Click → `/devices/[id]`

### 6. Device Detail (`/devices/[id]`)
- Header: model, vendor, serial number, status badge, IP
- Info grid (2 columns): type, technology, firmware, install date, location coords
- If ONT: show assigned subscriber name (linked)
- Metrics section: tabs for Bandwidth (down+up lines) and Latency (single line) — last 24h
- Last config backup timestamp and config version

### 7. Fault Tickets (`/tickets`)
- Table: Ticket ID, Title, Severity badge, Status badge, Device, Assigned To, Created
- Filter by Severity: All | Critical | High | Medium | Low
- Filter by Status: All | Open | In Progress | Resolved | Closed
- Sort by created date (newest first, default)
- "Create Ticket" button → modal dialog: title, description, severity (select), linked device (select), linked subscriber (select), assignee (select from users)
- Row click → `/tickets/[id]`

### 8. Ticket Detail (`/tickets/[id]`)
- Header: ticket ID (#001), title, severity badge, status badge
- Two columns: left=details (description, device, subscriber, created date), right=actions
- Action panel: status dropdown (Open→In Progress→Resolved→Closed), assignee select, "Save Changes" button
- Activity log section: chronological list of events (created, status changes) — mocked timestamps from seed
- Comments section: list of comments + "Add Comment" textarea + submit button (persists to DB)
- "Create Work Order" button — links ticket to new work order

### 9. Monitoring (`/monitoring`)
- Device selector: dropdown at top, defaults to first OLT
- Summary metric cards: Current Download, Current Upload, Avg Latency, Packet Loss %
- Bandwidth chart: last 24h, two lines (download/upload) — Recharts LineChart
- Latency chart: last 24h — Recharts AreaChart
- Alert Events feed: table of recent alerts for selected device (metric, value, threshold, severity, time)
- Data refetches every 30s (`refetchInterval: 30000` in TanStack Query)
- "Refresh" button for manual refresh

### 10. Analytics (`/analytics`)
- Time range selector: 7 days | 30 days | 90 days | 6 months — changes all charts
- **Chart 1:** Subscriber Growth — cumulative line chart (new subscribers per period)
- **Chart 2:** Revenue Trend — MRR bar chart (monthly)
- **Chart 3:** Ticket Volume — grouped bar chart by severity per week
- **Chart 4:** Device Health — donut/pie chart (Online / Degraded / Offline counts)
- **Chart 5:** Top 5 Subscribers by Bandwidth — horizontal bar chart
- All charts use consistent color palette defined in a single constants file

### 11. Work Orders (`/workorders`) — P1
- Table: ID, Title, Type, Linked Ticket, Assignee, Status, Due Date
- Status filter: All | Pending | In Progress | Completed | Cancelled
- "New Work Order" button → modal: title, type (Install/Repair/Upgrade/Survey), linked ticket (optional), assignee, due date
- Status change inline via select dropdown in table row
- Click row → expanded details panel (not a separate page — slide-out or accordion to save time)

### 12. Inventory (`/inventory`) — P1
- Table: Item Name, Type, Serial Number, Status, Assigned To, Location
- Status: Available | In Use | Maintenance | Retired
- Filter by type and status
- No create form needed — seed data only for demo

---

## Data Model (Hackathon Scope)

Flat and pragmatic. Every relation is optional at the application layer to keep forms simple.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("admin") // admin | noc | csr
  createdAt    DateTime @default(now())

  assignedTickets  FaultTicket[]
  assignedOrders   WorkOrder[]
  comments         TicketComment[]
}

model ServicePlan {
  id           String   @id @default(cuid())
  name         String
  speedDown    Int      // Mbps
  speedUp      Int      // Mbps
  priceMonthly Decimal
  technology   String   // GPON | XGS_PON

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
  status    String   @default("ACTIVE") // ACTIVE | SUSPENDED | TERMINATED
  createdAt DateTime @default(now())

  subscription  Subscription?
  tickets       FaultTicket[]
}

model Subscription {
  id          String    @id @default(cuid())
  customerId  String    @unique
  customer    Customer  @relation(fields: [customerId], references: [id])
  planId      String
  plan        ServicePlan @relation(fields: [planId], references: [id])
  deviceId    String?   @unique
  device      NetworkDevice? @relation(fields: [deviceId], references: [id])
  status      String    @default("ACTIVE") // ACTIVE | SUSPENDED | TERMINATED
  activatedAt DateTime  @default(now())
}

model NetworkDevice {
  id              String   @id @default(cuid())
  serialNumber    String   @unique
  model           String
  vendor          String
  type            String   // OLT | ONT | ROUTER | SWITCH
  technology      String   // GPON | XGS_PON | ETHERNET
  status          String   @default("ONLINE") // ONLINE | DEGRADED | OFFLINE
  ipAddress       String?
  firmwareVersion String?
  configVersion   String?
  locationLat     Float?
  locationLng     Float?
  installDate     DateTime?
  lastSeenAt      DateTime?
  createdAt       DateTime @default(now())

  subscription    Subscription?
  metrics         PerformanceMetric[]
  tickets         FaultTicket[]
  alertRules      AlertRule[]
  alertEvents     AlertEvent[]
}

model PerformanceMetric {
  id         String   @id @default(cuid())
  deviceId   String
  device     NetworkDevice @relation(fields: [deviceId], references: [id])
  metricName String   // bandwidth_down | bandwidth_up | latency | packet_loss
  value      Float
  unit       String   // Mbps | ms | %
  timestamp  DateTime

  @@index([deviceId, metricName, timestamp])
}

model FaultTicket {
  id          String   @id @default(cuid())
  title       String
  description String
  severity    String   // CRITICAL | HIGH | MEDIUM | LOW
  status      String   @default("OPEN") // OPEN | IN_PROGRESS | RESOLVED | CLOSED
  deviceId    String?
  device      NetworkDevice? @relation(fields: [deviceId], references: [id])
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  assigneeId  String?
  assignee    User?     @relation(fields: [assigneeId], references: [id])
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?

  comments    TicketComment[]
  workOrders  WorkOrder[]

  @@index([status])
  @@index([severity])
}

model TicketComment {
  id        String   @id @default(cuid())
  ticketId  String
  ticket    FaultTicket @relation(fields: [ticketId], references: [id])
  authorId  String
  author    User @relation(fields: [authorId], references: [id])
  body      String
  createdAt DateTime @default(now())
}

model WorkOrder {
  id         String    @id @default(cuid())
  title      String
  type       String    // INSTALL | REPAIR | UPGRADE | SURVEY
  status     String    @default("PENDING") // PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  ticketId   String?
  ticket     FaultTicket? @relation(fields: [ticketId], references: [id])
  assigneeId String?
  assignee   User? @relation(fields: [assigneeId], references: [id])
  dueDate    DateTime?
  notes      String?
  createdAt  DateTime @default(now())
}

model InventoryItem {
  id             String  @id @default(cuid())
  name           String
  type           String  // ONT | CABLE | TRANSCEIVER | ROUTER | TOOL
  serialNumber   String?
  status         String  @default("AVAILABLE") // AVAILABLE | IN_USE | MAINTENANCE | RETIRED
  assignedDevice String?
  location       String?
  createdAt      DateTime @default(now())
}

model AlertRule {
  id         String @id @default(cuid())
  deviceId   String
  device     NetworkDevice @relation(fields: [deviceId], references: [id])
  metricName String
  threshold  Float
  operator   String // GT | LT | GTE | LTE
  severity   String // CRITICAL | HIGH | MEDIUM | LOW

  alertEvents AlertEvent[]
}

model AlertEvent {
  id           String   @id @default(cuid())
  ruleId       String
  rule         AlertRule @relation(fields: [ruleId], references: [id])
  deviceId     String
  device       NetworkDevice @relation(fields: [deviceId], references: [id])
  value        Float
  severity     String
  acknowledged Boolean  @default(false)
  createdAt    DateTime @default(now())

  @@index([deviceId, createdAt])
}
```

---

## Seed Data Specification

Run with: `pnpm db:seed`
File: `prisma/seed.ts`

### Counts

| Entity | Count |
|--------|-------|
| ServicePlan | 4 |
| User | 5 |
| Customer | 50 |
| Subscription | 50 (one per active/suspended customer) |
| NetworkDevice | 20 |
| PerformanceMetric | ~5,760 (20 devices × 4 metrics × 72 data points = last 6h in 5-min intervals for charts; last 30 days daily aggregates for usage charts) |
| FaultTicket | 30 |
| TicketComment | 60 |
| WorkOrder | 15 |
| InventoryItem | 25 |
| AlertRule | 10 |
| AlertEvent | 20 |

### Seed Details

**Service Plans:**
```
name: "Starter"   speedDown:25    speedUp:10   price:29.99  tech:GPON
name: "Standard"  speedDown:100   speedUp:25   price:49.99  tech:GPON
name: "Pro"       speedDown:500   speedUp:100  price:79.99  tech:XGS_PON
name: "Gigabit"   speedDown:1000  speedUp:500  price:99.99  tech:XGS_PON
```

**Users (passwords all bcrypt of "Demo1234!"):**
```
admin@ispnexus.demo  — "Alex Rivera"     — admin
noc@ispnexus.demo    — "Sam Chen"        — noc
noc2@ispnexus.demo   — "Jordan Park"     — noc
csr@ispnexus.demo    — "Casey Williams"  — csr
csr2@ispnexus.demo   — "Morgan Taylor"   — csr
```

**Network Devices (20 total):**
```
2 OLTs:
  - Calix E7-2    vendor:Calix   type:OLT  tech:GPON     status:ONLINE  ip:10.0.1.1
  - Nokia 7360    vendor:Nokia   type:OLT  tech:XGS_PON  status:ONLINE  ip:10.0.1.2

2 Routers:
  - Cisco ASR1001  vendor:Cisco   type:ROUTER  status:ONLINE  ip:10.0.0.1
  - Juniper MX104  vendor:Juniper type:ROUTER  status:ONLINE  ip:10.0.0.2

1 Switch:
  - Cisco Catalyst 9300  vendor:Cisco  type:SWITCH  status:ONLINE  ip:10.0.2.1

15 ONTs (customer premises):
  - 12 ONLINE  — varied vendors (Calix 716GE, Nokia G-010S, ZTE F660)
  - 2  DEGRADED — simulate high latency / packet loss in metrics
  - 1  OFFLINE  — no recent metrics
```

**Performance Metrics strategy:**
- For each device, generate metrics for: `bandwidth_down`, `bandwidth_up`, `latency`, `packet_loss`
- **Last 6 hours** (for monitoring page): one row every 5 minutes = 72 points per metric per device
- **Last 30 days** (for subscriber usage chart): one row per day (daily aggregate)
- OLT bandwidth: 200–800 Mbps with realistic sine-wave pattern (day/night variation)
- ONT bandwidth: 5–(plan speedDown × 0.85) Mbps — correlated to their plan
- DEGRADED ONTs: latency 80–200 ms, packet_loss 2–8%
- ONLINE ONTs: latency 5–25 ms, packet_loss 0–0.1%
- OFFLINE ONT: no metrics after 3 days ago

**Fault Tickets (30):**
```
Severity distribution:
  CRITICAL: 5  (status: 2 OPEN, 2 IN_PROGRESS, 1 RESOLVED)
  HIGH:     8  (status: 3 OPEN, 3 IN_PROGRESS, 2 RESOLVED)
  MEDIUM:   12 (status: 4 OPEN, 4 IN_PROGRESS, 4 RESOLVED)
  LOW:      5  (status: 1 OPEN, 4 RESOLVED)

Example ticket titles:
  - "OLT port saturation on Calix E7-2 — SLOT-3 at 94% capacity"
  - "ONT offline — no signal — 42 Maple Street subscriber"
  - "Latency spike affecting 8 downstream subscribers"
  - "Firmware update required — EOL version on Nokia 7360"
  - "Subscriber reports intermittent drops — Pro plan SLA breach risk"
  - "New installation failing — ONT not registering on OLT"
  - "Billing sync failure — 3 subscriptions not reporting usage"
  - "Packet loss 6% on degraded ONT — SN: C7F2A19B3"
```

**Customers (50):**
Use realistic US names, email addresses, and addresses spread across 3 fictional cities:
- Maplewood, CA
- Ridgeview, TX  
- Clearwater, OH

Status distribution: 35 ACTIVE, 10 SUSPENDED, 5 TERMINATED

**Work Orders (15):**
```
Types: 6 INSTALL, 5 REPAIR, 3 UPGRADE, 1 SURVEY
Status: 3 PENDING, 5 IN_PROGRESS, 6 COMPLETED, 1 CANCELLED
Link 10 of them to existing FaultTickets
```

**Inventory (25 items):**
```
10 ONT units (Calix 716GE)  — AVAILABLE
5  ONT units (Nokia G-010S) — 3 IN_USE, 2 AVAILABLE
4  SFP Transceivers          — AVAILABLE
3  Patch cables (50m)        — AVAILABLE
2  Fiber splice kits         — 1 AVAILABLE, 1 MAINTENANCE
1  OTDR tester               — AVAILABLE
```

**Alert Rules (10):**
- Per OLT: bandwidth_down > 900 Mbps (CRITICAL), latency > 20 ms (HIGH)
- Per core Router: bandwidth > 800 Mbps (HIGH), packet_loss > 1% (CRITICAL)
- Per degraded ONT: latency > 100 ms (HIGH), packet_loss > 5% (CRITICAL)

**Alert Events (20):**
- 8 CRITICAL (4 acknowledged, 4 not)
- 8 HIGH (5 acknowledged, 3 not)
- 4 MEDIUM (all acknowledged)
- Timestamps: spread over last 6 hours

---

## Derived Metrics for KPI Cards

Compute these in tRPC queries (not stored):

```
Total Active Subscribers   → COUNT customers WHERE status = ACTIVE
Previous month count       → COUNT customers WHERE status = ACTIVE AND createdAt < startOfThisMonth
% change                   → (current - previous) / previous * 100

Online / Total Devices     → COUNT devices WHERE status = ONLINE / COUNT all devices

Open Tickets               → COUNT tickets WHERE status IN (OPEN, IN_PROGRESS)
Critical Open Tickets      → COUNT tickets WHERE status IN (OPEN, IN_PROGRESS) AND severity = CRITICAL

MRR                        → SUM(subscriptions.plan.priceMonthly) WHERE subscription.status = ACTIVE
```

---

## UI Component Decisions

To maximize speed, use these specific choices:

| Need | Component |
|------|-----------|
| Charts | `recharts` — LineChart, BarChart, AreaChart, PieChart |
| Tables | shadcn `Table` + manual state for sort/filter |
| Modals | shadcn `Dialog` |
| Forms | React Hook Form + shadcn `Form` + Zod |
| Toast | shadcn `Sonner` (toast notifications) |
| Date formatting | `date-fns` (`formatDistanceToNow`, `format`) |
| Select dropdowns | shadcn `Select` |
| Status badges | Custom `StatusBadge` component wrapping shadcn `Badge` |
| Skeleton loaders | shadcn `Skeleton` |
| Tabs | shadcn `Tabs` |
| Command palette | Skip — not needed for demo |
| Avatar | shadcn `Avatar` with initials fallback |

---

## Hour-by-Hour Schedule

| Hour | Focus | Deliverable |
|------|-------|------------|
| 0–0.5h | Setup | Repo init, dependencies, DB connection, NextAuth, middleware |
| 0.5–1h | DB + Seed | Prisma schema, migration, full seed script |
| 1–1.5h | Layout | App shell: sidebar, topbar, providers, routing |
| 1.5–2.5h | Dashboard + Auth | Login page, dashboard KPIs, mini charts |
| 2.5–3.5h | Subscribers | List + detail + usage chart |
| 3.5–4.5h | Devices + Tickets | Devices list+detail, tickets list+detail |
| 4.5–5.5h | Monitoring + Analytics | Monitoring charts, analytics page |
| 5.5–6.5h | Mutations | Create ticket form, status changes, add comment |
| 6.5–7h | P1 pages | Work orders page |
| 7–7.5h | Polish | Loading states, toasts, empty states, error boundaries |
| 7.5–8h | Deploy | Vercel deploy, env vars, seed prod DB, smoke test |

---

## Definition of Done

- [ ] `pnpm dev` starts without errors
- [ ] `pnpm db:seed` populates all entities with no errors
- [ ] Login works with `admin@ispnexus.demo` / `Demo1234!`
- [ ] Dashboard KPI cards show real numbers from DB
- [ ] Subscriber list: search and filter both work
- [ ] Subscriber detail: all 3 tabs render with data
- [ ] Device list: card grid + status badges working
- [ ] Device detail: metrics chart shows 24h data
- [ ] Tickets list: create ticket via modal works and persists
- [ ] Ticket detail: status change persists to DB
- [ ] Monitoring: charts load with seed data, refresh works
- [ ] Analytics: all 4+ charts render correctly
- [ ] No TypeScript errors (`pnpm typecheck` clean)
- [ ] No broken nav links — all sidebar routes work
- [ ] `pnpm build` succeeds (production build clean)
- [ ] Deployed to Vercel with DATABASE_URL and NEXTAUTH_SECRET set
- [ ] Seeded prod DB — no empty states on demo
