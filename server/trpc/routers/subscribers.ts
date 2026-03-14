import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc";

const listInputSchema = z.object({
  search: z.string().default(""),
  status: z.enum(["ALL", "ACTIVE", "SUSPENDED", "TERMINATED"]).default("ALL"),
});

export const subscribersRouter = createTRPCRouter({
  list: protectedProcedure.input(listInputSchema).query(async ({ ctx, input }) => {
    const search = input.search.trim();

    const where = {
      ...(input.status !== "ALL" ? { status: input.status } : {}),
      ...(search.length > 0
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [customers, groupedStatuses] = await Promise.all([
      ctx.prisma.customer.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      }),
      ctx.prisma.customer.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const statusCounts = {
      ACTIVE: 0,
      SUSPENDED: 0,
      TERMINATED: 0,
      ALL: 0,
    };

    for (const group of groupedStatuses) {
      const count = group._count._all;
      if (group.status === "ACTIVE") {
        statusCounts.ACTIVE = count;
      }
      if (group.status === "SUSPENDED") {
        statusCounts.SUSPENDED = count;
      }
      if (group.status === "TERMINATED") {
        statusCounts.TERMINATED = count;
      }
      statusCounts.ALL += count;
    }

    const rows = customers.map((customer) => ({
      id: customer.id,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      status: customer.status,
      city: customer.city,
      state: customer.state,
      planName: customer.subscription?.plan.name ?? "No plan",
      monthlyValue: customer.subscription ? Number(customer.subscription.plan.priceMonthly) : 0,
      activationDate: customer.subscription?.activatedAt ?? customer.createdAt,
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
      const customer = await ctx.prisma.customer.findUnique({
        where: {
          id: input.id,
        },
        include: {
          subscription: {
            include: {
              plan: true,
              device: true,
            },
          },
          tickets: {
            orderBy: {
              createdAt: "desc",
            },
            take: 20,
            select: {
              id: true,
              title: true,
              severity: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (!customer) {
        return null;
      }

      const usageMetrics = customer.subscription?.deviceId
        ? await ctx.prisma.performanceMetric.findMany({
            where: {
              deviceId: customer.subscription.deviceId,
              metricName: {
                in: ["bandwidth_down", "bandwidth_up"],
              },
            },
            orderBy: {
              timestamp: "asc",
            },
            take: 120,
          })
        : [];

      const usageByTimestamp = new Map<
        string,
        {
          label: string;
          timestamp: Date;
          download: number;
          upload: number;
        }
      >();

      for (const metric of usageMetrics) {
        const key = metric.timestamp.toISOString();
        const existing = usageByTimestamp.get(key) ?? {
          label: format(metric.timestamp, "MMM d, HH:mm"),
          timestamp: metric.timestamp,
          download: 0,
          upload: 0,
        };

        if (metric.metricName === "bandwidth_down") {
          existing.download = Number(metric.value.toFixed(2));
        }
        if (metric.metricName === "bandwidth_up") {
          existing.upload = Number(metric.value.toFixed(2));
        }

        usageByTimestamp.set(key, existing);
      }

      const usageSeries = [...usageByTimestamp.values()].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );

      return {
        id: customer.id,
        fullName: `${customer.firstName} ${customer.lastName}`,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        address: [customer.street, customer.city, customer.state, customer.zip]
          .filter(Boolean)
          .join(", "),
        activationDate: customer.subscription?.activatedAt ?? customer.createdAt,
        plan: customer.subscription
          ? {
              name: customer.subscription.plan.name,
              speedDown: customer.subscription.plan.speedDown,
              speedUp: customer.subscription.plan.speedUp,
              priceMonthly: Number(customer.subscription.plan.priceMonthly),
              technology: customer.subscription.plan.technology,
              status: customer.subscription.status,
            }
          : null,
        device: customer.subscription?.device
          ? {
              id: customer.subscription.device.id,
              model: customer.subscription.device.model,
              vendor: customer.subscription.device.vendor,
              status: customer.subscription.device.status,
              ipAddress: customer.subscription.device.ipAddress,
            }
          : null,
        usageSeries,
        tickets: customer.tickets,
      };
    }),

  create: adminProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const subscriber = await ctx.prisma.customer.create({
          data: {
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone?.trim() || null,
            street: input.street?.trim() || null,
            city: input.city?.trim() || null,
            state: input.state?.trim() || null,
            zip: input.zip?.trim() || null,
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        });

        return subscriber;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A subscriber with this email already exists.",
          });
        }

        throw error;
      }
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          subscription: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscriber not found.",
        });
      }

      const allowedTransitions: Record<string, string[]> = {
        ACTIVE: ["SUSPENDED", "TERMINATED"],
        SUSPENDED: ["ACTIVE", "TERMINATED"],
        TERMINATED: [],
      };

      if (customer.status === input.status) {
        return { id: customer.id, status: customer.status };
      }

      if (!allowedTransitions[customer.status]?.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That status change is not allowed.",
        });
      }

      await ctx.prisma.$transaction([
        ctx.prisma.customer.update({
          where: { id: input.id },
          data: { status: input.status },
        }),
        ...(customer.subscription
          ? [
              ctx.prisma.subscription.update({
                where: { id: customer.subscription.id },
                data: { status: input.status },
              }),
            ]
          : []),
      ]);

      return { id: customer.id, status: input.status };
    }),
});
