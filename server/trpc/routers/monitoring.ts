import { format } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc";

export const monitoringRouter = createTRPCRouter({
  devices: protectedProcedure.query(async ({ ctx }) => {
    const devices = await ctx.prisma.networkDevice.findMany({
      select: {
        id: true,
        model: true,
        vendor: true,
        type: true,
        status: true,
      },
      orderBy: [{ type: "asc" }, { model: "asc" }],
    });

    return devices;
  }),

  metrics: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const selectedDevice = input.deviceId
        ? await ctx.prisma.networkDevice.findUnique({ where: { id: input.deviceId } })
        : await ctx.prisma.networkDevice.findFirst({
            where: { type: "OLT" },
            orderBy: { createdAt: "asc" },
          });

      if (!selectedDevice) {
        return {
          selectedDeviceId: null,
          summary: {
            currentDownload: null,
            currentUpload: null,
            avgLatency: null,
            packetLoss: null,
          },
          bandwidthSeries: [] as Array<{ label: string; download: number; upload: number }>,
          latencySeries: [] as Array<{ label: string; latency: number }>,
          alerts: [] as Array<{
            id: string;
            metric: string;
            value: number;
            threshold: number;
            severity: string;
            acknowledged: boolean;
            createdAt: Date;
          }>,
        };
      }

      const metrics = await ctx.prisma.performanceMetric.findMany({
        where: {
          deviceId: selectedDevice.id,
          metricName: {
            in: ["bandwidth_down", "bandwidth_up", "latency", "packet_loss"],
          },
        },
        orderBy: {
          timestamp: "asc",
        },
        take: 288,
      });

      const points = new Map<
        string,
        {
          timestamp: Date;
          label: string;
          download: number;
          upload: number;
          latency: number;
          packetLoss: number;
        }
      >();

      for (const metric of metrics) {
        const key = metric.timestamp.toISOString();
        const point = points.get(key) ?? {
          timestamp: metric.timestamp,
          label: format(metric.timestamp, "MMM d, HH:mm"),
          download: 0,
          upload: 0,
          latency: 0,
          packetLoss: 0,
        };

        if (metric.metricName === "bandwidth_down") {
          point.download = Number(metric.value.toFixed(2));
        }
        if (metric.metricName === "bandwidth_up") {
          point.upload = Number(metric.value.toFixed(2));
        }
        if (metric.metricName === "latency") {
          point.latency = Number(metric.value.toFixed(2));
        }
        if (metric.metricName === "packet_loss") {
          point.packetLoss = Number(metric.value.toFixed(2));
        }

        points.set(key, point);
      }

      const series = [...points.values()].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const latest = series.at(-1);

      const recentLatencySeries = series.slice(-12);

      const avgLatency =
        recentLatencySeries.length > 0
          ? Number(
              (
                recentLatencySeries.reduce((sum, point) => sum + point.latency, 0) /
                Math.max(recentLatencySeries.length, 1)
              ).toFixed(2),
            )
          : 0;

      const alerts = await ctx.prisma.alertEvent.findMany({
        where: {
          deviceId: selectedDevice.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          rule: {
            select: {
              metricName: true,
              threshold: true,
            },
          },
        },
      });

      return {
        selectedDeviceId: selectedDevice.id,
        summary: {
          currentDownload: latest?.download ?? null,
          currentUpload: latest?.upload ?? null,
          avgLatency: recentLatencySeries.length > 0 ? avgLatency : null,
          packetLoss: latest?.packetLoss ?? null,
        },
        bandwidthSeries: series.map((point) => ({
          label: point.label,
          download: point.download,
          upload: point.upload,
        })),
        latencySeries: series.map((point) => ({
          label: point.label,
          latency: point.latency,
        })),
        alerts: alerts.map((alert) => ({
          id: alert.id,
          metric: alert.rule.metricName,
          value: Number(alert.value.toFixed(2)),
          threshold: Number(alert.rule.threshold.toFixed(2)),
          severity: alert.severity,
          acknowledged: alert.acknowledged,
          createdAt: alert.createdAt,
        })),
      };
    }),
});
