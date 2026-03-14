import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  operatorProcedure,
  protectedProcedure,
} from "@/server/trpc/trpc";

const listInputSchema = z.object({
  severity: z.enum(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("ALL"),
  status: z.enum(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).default("ALL"),
});

const createTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  deviceId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
});

const updateTicketSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  assigneeId: z.string().cuid().nullable(),
});

const addCommentSchema = z.object({
  ticketId: z.string().cuid(),
  body: z.string().min(2),
});

export const ticketsRouter = createTRPCRouter({
  list: protectedProcedure.input(listInputSchema).query(async ({ ctx, input }) => {
    const where = {
      ...(input.severity !== "ALL" ? { severity: input.severity } : {}),
      ...(input.status !== "ALL" ? { status: input.status } : {}),
    };

    const tickets = await ctx.prisma.faultTicket.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        device: {
          select: {
            id: true,
            model: true,
            vendor: true,
          },
        },
      },
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      severity: ticket.severity,
      status: ticket.status,
      createdAt: ticket.createdAt,
      assignee: ticket.assignee,
      device: ticket.device,
    }));
  }),

  formOptions: protectedProcedure.query(async ({ ctx }) => {
      const [users, devices, customers] = await Promise.all([
        ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      ctx.prisma.networkDevice.findMany({
        select: {
          id: true,
          model: true,
          vendor: true,
        },
        orderBy: {
          model: "asc",
        },
      }),
      ctx.prisma.customer.findMany({
        where: {
          status: {
            in: ["ACTIVE", "SUSPENDED"],
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
        orderBy: {
          firstName: "asc",
        },
      }),
    ]);

    return {
      users,
      devices,
      customers: customers.map((customer) => ({
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
      })),
    };
  }),

  byId: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.faultTicket.findUnique({
        where: {
          id: input.id,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          device: {
            select: {
              id: true,
              model: true,
              vendor: true,
            },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          workOrders: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              title: true,
              status: true,
              type: true,
              dueDate: true,
              assignee: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          comments: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        return null;
      }

      return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        severity: ticket.severity,
        status: ticket.status,
        createdAt: ticket.createdAt,
        resolvedAt: ticket.resolvedAt,
        assignee: ticket.assignee,
        device: ticket.device,
        customer: ticket.customer
          ? {
              id: ticket.customer.id,
              name: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
              email: ticket.customer.email,
            }
          : null,
        workOrders: ticket.workOrders,
        comments: ticket.comments,
      };
    }),

  create: protectedProcedure.input(createTicketSchema).mutation(async ({ ctx, input }) => {
    const ticket = await ctx.prisma.faultTicket.create({
      data: {
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: "OPEN",
        deviceId: input.deviceId,
        customerId: input.customerId,
        assigneeId: input.assigneeId,
      },
    });

    return { id: ticket.id };
  }),

  update: operatorProcedure.input(updateTicketSchema).mutation(async ({ ctx, input }) => {
    const existingTicket = await ctx.prisma.faultTicket.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        status: true,
        resolvedAt: true,
        assigneeId: true,
      },
    });

    if (!existingTicket) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Ticket not found.",
      });
    }

    const nextStatus = input.status;
    const statusChanged = existingTicket.status !== nextStatus;
    const assigneeChanged = existingTicket.assigneeId !== input.assigneeId;

    const ticket = await ctx.prisma.faultTicket.update({
      where: {
        id: input.id,
      },
      data: {
        status: nextStatus,
        assigneeId: input.assigneeId,
        resolvedAt:
          nextStatus === "RESOLVED"
            ? new Date()
            : nextStatus === "OPEN" || nextStatus === "IN_PROGRESS"
              ? null
              : existingTicket.resolvedAt ?? (nextStatus === "CLOSED" ? new Date() : null),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const activityEntries: string[] = [];

    if (statusChanged) {
      activityEntries.push(
        `Status changed from ${existingTicket.status.replaceAll("_", " ")} to ${nextStatus.replaceAll("_", " ")}.`,
      );
    }

    if (assigneeChanged) {
      activityEntries.push(
        input.assigneeId
          ? `Ticket reassigned to ${ticket.assignee?.name ?? "another operator"}.`
          : "Ticket was unassigned.",
      );
    }

    if (activityEntries.length > 0) {
      await ctx.prisma.ticketComment.createMany({
        data: activityEntries.map((body) => ({
          ticketId: ticket.id,
          authorId: ctx.session.user.id,
          body,
        })),
      });
    }

    return { id: ticket.id };
  }),

  addComment: protectedProcedure.input(addCommentSchema).mutation(async ({ ctx, input }) => {
    await ctx.prisma.ticketComment.create({
      data: {
        ticketId: input.ticketId,
        body: input.body,
        authorId: ctx.session.user.id,
      },
    });

    return { ok: true };
  }),
});
