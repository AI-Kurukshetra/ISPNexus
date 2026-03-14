# DECISIONS

## 2026-03-14
- Adopted Prisma + NextAuth + tRPC as the initial implementation path to match the detailed architecture guide in `docs/Architecture.md`.
- Implemented an initial vertical slice (login + dashboard KPIs) before full feature expansion to ensure early end-to-end viability.
- Seed scope intentionally reduced for phase 1 (small realistic dataset) to validate schema, auth, and dashboard wiring before scaling to full PRD seed volume.
- Standardized on Prisma v5 for now to avoid Prisma v7 datasource config migration overhead during initial build phase.
- Used `proxy.ts` (not `middleware.ts`) to align with Next.js 16 convention.
- Kept subscriber search/filter logic server-side in tRPC to maintain a single source of truth for status counts and row results.
- Implemented subscriber detail as a client-driven tabbed view (overview/usage/tickets) to reduce route complexity and keep interactions responsive.
- Kept device list filters (`status`, `type`) server-driven via tRPC query inputs so card and table modes always share the same dataset.
- Shaped device telemetry into chart-ready series in the server router to keep client components focused on rendering logic.
- Centralized auth gating in `proxy.ts` and removed layout-level access checks to keep route protection consistent across protected pages.
- Implemented password reset with signed, expiring stateless tokens bound to current password hash fingerprint to avoid DB schema expansion for reset state.
- Kept ticket CRUD and comment actions in tRPC mutations for end-to-end typed client/server contracts.
- Split monitoring into `devices` and `metrics` procedures so the UI can keep a stable selected device and independently refresh telemetry on interval.
- Kept analytics aggregations server-side to avoid heavy client computation and provide ready-to-chart datasets per selected range.
- Adopted Vitest for fast deterministic unit checks on utility/schema logic and Playwright for critical auth smoke coverage.
- Added work orders as a single-page table + inline expansion interaction to match the user-flow document while keeping implementation sprint-friendly.
- Kept inventory module read-only with filterable table in hackathon scope, and deferred mutations per PRD/UserFlow constraints.
- Exposed minimal settings profile via tRPC using current session user id (no password change/RBAC editor) for scope control.
- Enforced role permissions in tRPC rather than only hiding controls in the UI so CSR read-only paths cannot bypass restrictions client-side.
- Reused `TicketComment` as the lightweight activity stream for ticket status/assignee/work-order events to avoid adding a separate audit table during hackathon scope.
- Added shared toast/session-expiry handling in the global tRPC provider so mutation feedback and auth expiry behavior stay consistent across modules.
- Standardized on React Hook Form + Zod resolvers for interactive forms so field-level validation is consistent between auth and operational workflows while keeping server-side schema checks in place.
