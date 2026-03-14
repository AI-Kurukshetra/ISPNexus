# ISPNexus

**ISPNexus** is a full-stack operator console for Internet Service Providers — built to manage subscribers, network devices, fault tickets, work orders, and field teams from a single platform.

## Features

- **Subscriber Management** — track customer accounts, service plans, and subscription status
- **Device Monitoring** — real-time visibility into network devices, performance metrics, and alerts
- **Fault Tickets** — create, assign, and resolve network incidents with severity tracking
- **Work Orders** — dispatch and manage field operations end-to-end
- **Analytics** — bandwidth utilization, subscriber growth, and revenue trends
- **Role-Based Access** — Admin, NOC Engineer, and CSR roles with scoped permissions
- **Team Management** — invite operators via email, assign roles, manage access
- **Password Reset** — secure HMAC-signed reset tokens delivered via Supabase email

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript 5 (strict)
- **Styling** — Tailwind CSS v4
- **Database** — PostgreSQL via [Supabase](https://supabase.com), Prisma ORM
- **Auth** — NextAuth v5 (credentials provider, JWT strategy)
- **API** — tRPC v11 + React Query
- **Email** — Supabase Auth email service
- **Database** — Supabase PostgreSQL
- **Charts** — Recharts

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A [Supabase](https://supabase.com) project (database + email delivery)

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string (Session mode, port 5432) |
| `DIRECT_URL` | Supabase direct connection string (port 5432) |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `AUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

### Database Setup

```bash
pnpm db:migrate   # apply migrations
pnpm db:seed      # seed demo data
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed on [Vercel](https://vercel.com). See the [deployment guide](https://nextjs.org/docs/app/building-your-application/deploying) for details. Make sure to add all environment variables in the Vercel project settings before deploying.
