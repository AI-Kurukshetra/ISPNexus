import { analyticsRouter } from "@/server/trpc/routers/analytics";
import { dashboardRouter } from "@/server/trpc/routers/dashboard";
import { devicesRouter } from "@/server/trpc/routers/devices";
import { inventoryRouter } from "@/server/trpc/routers/inventory";
import { monitoringRouter } from "@/server/trpc/routers/monitoring";
import { settingsRouter } from "@/server/trpc/routers/settings";
import { subscribersRouter } from "@/server/trpc/routers/subscribers";
import { ticketsRouter } from "@/server/trpc/routers/tickets";
import { usersRouter } from "@/server/trpc/routers/users";
import { workordersRouter } from "@/server/trpc/routers/workorders";
import { createTRPCRouter } from "@/server/trpc/trpc";

export const appRouter = createTRPCRouter({
  analytics: analyticsRouter,
  dashboard: dashboardRouter,
  devices: devicesRouter,
  inventory: inventoryRouter,
  monitoring: monitoringRouter,
  settings: settingsRouter,
  subscribers: subscribersRouter,
  tickets: ticketsRouter,
  users: usersRouter,
  workorders: workordersRouter,
});

export type AppRouter = typeof appRouter;
