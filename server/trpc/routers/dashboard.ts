import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc";

export const dashboardRouter = createTRPCRouter({
  kpis: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const [
      activeSubscribers,
      activeSubscribersLastMonth,
      totalDevices,
      onlineDevices,
      openTickets,
      criticalOpenTickets,
      revenueSubscriptions,
      lastMonthRevenueSubscriptions,
      recentTickets,
      recentSubscribers,
      customersForGrowth,
      bandwidthMetrics,
    ] = await Promise.all([
      ctx.prisma.customer.count({ where: { status: "ACTIVE" } }),
      ctx.prisma.customer.count({
        where: {
          status: "ACTIVE",
          createdAt: {
            lt: currentMonthStart,
          },
        },
      }),
      ctx.prisma.networkDevice.count(),
      ctx.prisma.networkDevice.count({ where: { status: "ONLINE" } }),
      ctx.prisma.faultTicket.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
      }),
      ctx.prisma.faultTicket.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
          severity: "CRITICAL",
        },
      }),
      ctx.prisma.subscription.findMany({
        where: {
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
      ctx.prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          activatedAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
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
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          severity: true,
          createdAt: true,
        },
      }),
      ctx.prisma.customer.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          status: true,
        },
      }),
      ctx.prisma.customer.findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          createdAt: true,
        },
      }),
      ctx.prisma.performanceMetric.findMany({
        where: {
          metricName: "bandwidth_down",
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 200,
        include: {
          device: {
            select: {
              id: true,
              vendor: true,
              model: true,
            },
          },
        },
      }),
    ]);

    const monthlyRevenue = revenueSubscriptions.reduce((sum, subscription) => {
      return sum + Number(subscription.plan.priceMonthly);
    }, 0);

    const previousMonthRevenue = lastMonthRevenueSubscriptions.reduce((sum, subscription) => {
      return sum + Number(subscription.plan.priceMonthly);
    }, 0);

    const activeSubscribersDelta =
      activeSubscribersLastMonth > 0
        ? Number(
            (
              ((activeSubscribers - activeSubscribersLastMonth) / activeSubscribersLastMonth) *
              100
            ).toFixed(1),
          )
        : 0;

    const revenueDelta =
      previousMonthRevenue > 0
        ? Number((((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1))
        : 0;

    const growthMonths = Array.from({ length: 6 }, (_, index) => startOfMonth(subMonths(now, 5 - index)));
    const subscriberGrowth = growthMonths.map((monthStart) => {
      const total = customersForGrowth.filter((customer) => customer.createdAt <= endOfMonth(monthStart)).length;
      return {
        label: format(monthStart, "MMM"),
        total,
      };
    });

    const latestBandwidthByDevice = new Map<
      string,
      { name: string; utilization: number }
    >();

    for (const metric of bandwidthMetrics) {
      if (latestBandwidthByDevice.has(metric.deviceId)) {
        continue;
      }

      latestBandwidthByDevice.set(metric.deviceId, {
        name: `${metric.device.vendor} ${metric.device.model}`,
        utilization: Number(metric.value.toFixed(1)),
      });
    }

    const bandwidthUtilization = [...latestBandwidthByDevice.values()]
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 5);

    return {
      activeSubscribers,
      activeSubscribersDelta,
      onlineDevices,
      totalDevices,
      openTickets,
      criticalOpenTickets,
      monthlyRevenue,
      revenueDelta,
      recentTickets,
      recentSubscribers: recentSubscribers.map((subscriber) => ({
        id: subscriber.id,
        fullName: `${subscriber.firstName} ${subscriber.lastName}`,
        email: subscriber.email,
        status: subscriber.status,
        createdAt: subscriber.createdAt,
      })),
      subscriberGrowth,
      bandwidthUtilization,
    };
  }),
});
