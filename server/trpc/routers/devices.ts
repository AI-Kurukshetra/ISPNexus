import { format } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc";

const listInputSchema = z.object({
  status: z.enum(["ALL", "ONLINE", "DEGRADED", "OFFLINE"]).default("ALL"),
  type: z.enum(["ALL", "OLT", "ONT", "ROUTER", "SWITCH"]).default("ALL"),
});

export const devicesRouter = createTRPCRouter({
  list: protectedProcedure.input(listInputSchema).query(async ({ ctx, input }) => {
    const where = {
      ...(input.status !== "ALL" ? { status: input.status } : {}),
      ...(input.type !== "ALL" ? { type: input.type } : {}),
    };

    const [devices, groupedStatuses] = await Promise.all([
      ctx.prisma.networkDevice.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      }),
      ctx.prisma.networkDevice.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const statusCounts = {
      ALL: 0,
      ONLINE: 0,
      DEGRADED: 0,
      OFFLINE: 0,
    };

    for (const group of groupedStatuses) {
      const count = group._count._all;
      if (group.status === "ONLINE") {
        statusCounts.ONLINE = count;
      }
      if (group.status === "DEGRADED") {
        statusCounts.DEGRADED = count;
      }
      if (group.status === "OFFLINE") {
        statusCounts.OFFLINE = count;
      }
      statusCounts.ALL += count;
    }

    const rows = devices.map((device) => ({
      id: device.id,
      model: device.model,
      vendor: device.vendor,
      type: device.type,
      technology: device.technology,
      status: device.status,
      ipAddress: device.ipAddress,
      serialNumber: device.serialNumber,
      firmwareVersion: device.firmwareVersion,
      configVersion: device.configVersion,
      lastSeenAt: device.lastSeenAt,
    }));

    return {
      rows,
      statusCounts,
    };
  }),

  byId: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const device = await ctx.prisma.networkDevice.findUnique({
        where: {
          id: input.id,
        },
        include: {
          subscription: {
            include: {
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!device) {
        return null;
      }

      const metrics = await ctx.prisma.performanceMetric.findMany({
        where: {
          deviceId: device.id,
          metricName: {
            in: ["bandwidth_down", "bandwidth_up", "latency"],
          },
        },
        orderBy: {
          timestamp: "asc",
        },
        take: 180,
      });

      const byTimestamp = new Map<
        string,
        {
          timestamp: Date;
          label: string;
          bandwidthDown: number;
          bandwidthUp: number;
          latency: number;
        }
      >();

      for (const metric of metrics) {
        const key = metric.timestamp.toISOString();
        const existing = byTimestamp.get(key) ?? {
          timestamp: metric.timestamp,
          label: format(metric.timestamp, "MMM d, HH:mm"),
          bandwidthDown: 0,
          bandwidthUp: 0,
          latency: 0,
        };

        if (metric.metricName === "bandwidth_down") {
          existing.bandwidthDown = Number(metric.value.toFixed(2));
        }
        if (metric.metricName === "bandwidth_up") {
          existing.bandwidthUp = Number(metric.value.toFixed(2));
        }
        if (metric.metricName === "latency") {
          existing.latency = Number(metric.value.toFixed(2));
        }

        byTimestamp.set(key, existing);
      }

      const series = [...byTimestamp.values()].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );

      return {
        id: device.id,
        model: device.model,
        vendor: device.vendor,
        serialNumber: device.serialNumber,
        type: device.type,
        technology: device.technology,
        status: device.status,
        ipAddress: device.ipAddress,
        firmwareVersion: device.firmwareVersion,
        configVersion: device.configVersion,
        installDate: device.installDate,
        lastSeenAt: device.lastSeenAt,
        locationLat: device.locationLat,
        locationLng: device.locationLng,
        assignedSubscriber: device.subscription?.customer
          ? {
              id: device.subscription.customer.id,
              fullName: `${device.subscription.customer.firstName} ${device.subscription.customer.lastName}`,
            }
          : null,
        bandwidthSeries: series.map((entry) => ({
          label: entry.label,
          bandwidthDown: entry.bandwidthDown,
          bandwidthUp: entry.bandwidthUp,
        })),
        latencySeries: series.map((entry) => ({
          label: entry.label,
          latency: entry.latency,
        })),
      };
    }),
});
