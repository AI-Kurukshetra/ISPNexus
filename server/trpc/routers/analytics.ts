import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc";

const rangeSchema = z.enum(["7D", "30D", "90D", "6M"]);

function getStartDate(range: z.infer<typeof rangeSchema>) {
  const now = new Date();
  if (range === "7D") {
    return subDays(now, 6);
  }
  if (range === "30D") {
    return subDays(now, 29);
  }
  if (range === "90D") {
    return subDays(now, 89);
  }
  return subMonths(now, 5);
}

export const analyticsRouter = createTRPCRouter({
  dashboard: protectedProcedure
    .input(
      z.object({
        range: rangeSchema.default("30D"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = startOfDay(getStartDate(input.range));

      const [customers, subscriptions, tickets, deviceStatuses, deviceMetrics, customerDevices] =
        await Promise.all([
          ctx.prisma.customer.findMany({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            select: {
              id: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          }),
          ctx.prisma.subscription.findMany({
            where: {
              activatedAt: {
                gte: startDate,
              },
              status: "ACTIVE",
            },
            include: {
              plan: {
                select: {
                  priceMonthly: true,
                },
              },
            },
          }),
          ctx.prisma.faultTicket.findMany({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
            select: {
              id: true,
              createdAt: true,
              severity: true,
            },
          }),
          ctx.prisma.networkDevice.groupBy({
            by: ["status"],
            _count: {
              _all: true,
            },
          }),
          ctx.prisma.performanceMetric.groupBy({
            by: ["deviceId"],
            where: {
              metricName: "bandwidth_down",
              timestamp: {
                gte: startDate,
              },
            },
            _avg: {
              value: true,
            },
          }),
          ctx.prisma.customer.findMany({
            where: {
              subscription: {
                isNot: null,
              },
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              subscription: {
                select: {
                  deviceId: true,
                },
              },
            },
          }),
        ]);

      const dailyBuckets = eachDayOfInterval({
        start: startDate,
        end: endOfDay(now),
      });

      let runningTotal = 0;
      const customerCountByDay = new Map<string, number>();
      for (const customer of customers) {
        const key = format(startOfDay(customer.createdAt), "yyyy-MM-dd");
        customerCountByDay.set(key, (customerCountByDay.get(key) ?? 0) + 1);
      }

      const subscriberGrowth = dailyBuckets.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        runningTotal += customerCountByDay.get(key) ?? 0;
        return {
          label: format(day, "MMM d"),
          total: runningTotal,
        };
      });

      const monthlyBuckets = eachMonthOfInterval({
        start: startOfMonth(startDate),
        end: endOfMonth(now),
      });

      const revenueByMonth = new Map<string, number>();
      for (const subscription of subscriptions) {
        const key = format(startOfMonth(subscription.activatedAt), "yyyy-MM");
        const revenue = Number(subscription.plan.priceMonthly);
        revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + revenue);
      }

      const revenueTrend = monthlyBuckets.map((month) => {
        const key = format(month, "yyyy-MM");
        return {
          label: format(month, "MMM yy"),
          revenue: Number((revenueByMonth.get(key) ?? 0).toFixed(2)),
        };
      });

      const ticketBucketStart = startOfWeek(startDate, { weekStartsOn: 1 });
      const ticketBucketEnd = endOfWeek(now, { weekStartsOn: 1 });
      const weeklyBuckets = eachDayOfInterval({ start: ticketBucketStart, end: ticketBucketEnd }).filter(
        (day) => day.getDay() === 1,
      );

      const ticketVolume = weeklyBuckets.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekTickets = tickets.filter(
          (ticket) => ticket.createdAt >= weekStart && ticket.createdAt <= weekEnd,
        );

        return {
          label: `${format(weekStart, "MMM d")}`,
          CRITICAL: weekTickets.filter((ticket) => ticket.severity === "CRITICAL").length,
          HIGH: weekTickets.filter((ticket) => ticket.severity === "HIGH").length,
          MEDIUM: weekTickets.filter((ticket) => ticket.severity === "MEDIUM").length,
          LOW: weekTickets.filter((ticket) => ticket.severity === "LOW").length,
        };
      });

      const deviceHealth = ["ONLINE", "DEGRADED", "OFFLINE"].map((status) => {
        const entry = deviceStatuses.find((group) => group.status === status);
        return {
          name: status,
          value: entry?._count._all ?? 0,
        };
      });

      const customerByDevice = new Map<string, string>();
      for (const customer of customerDevices) {
        const deviceId = customer.subscription?.deviceId;
        if (!deviceId) {
          continue;
        }
        customerByDevice.set(deviceId, `${customer.firstName} ${customer.lastName}`);
      }

      const topSubscribers = deviceMetrics
        .map((metric) => ({
          name: customerByDevice.get(metric.deviceId) ?? `Device ${metric.deviceId.slice(0, 6)}`,
          bandwidth: Number((metric._avg.value ?? 0).toFixed(2)),
        }))
        .sort((a, b) => b.bandwidth - a.bandwidth)
        .slice(0, 5);

      return {
        range: input.range,
        subscriberGrowth,
        revenueTrend,
        ticketVolume,
        deviceHealth,
        topSubscribers,
      };
    }),
});
