import { z } from "zod";

import {
  createTRPCRouter,
  operatorProcedure,
  protectedProcedure,
} from "@/server/trpc/trpc";

const statusFilterSchema = z.enum(["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
const workOrderTypeSchema = z.enum(["INSTALL", "REPAIR", "UPGRADE", "SURVEY"]);
const workOrderStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export const workordersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: statusFilterSchema.default("ALL"),
        type: z.enum(["ALL", "INSTALL", "REPAIR", "UPGRADE", "SURVEY"]).default("ALL"),
        assigneeId: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.workOrder.findMany({
        where: {
          ...(input.status === "ALL" ? {} : { status: input.status }),
          ...(input.type === "ALL" ? {} : { type: input.type }),
          ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
        },
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
          ticket: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: row.type,
        status: row.status,
        dueDate: row.dueDate,
        createdAt: row.createdAt,
        notes: row.notes,
        assignee: row.assignee,
        ticket: row.ticket,
      }));
    }),

  formOptions: protectedProcedure.query(async ({ ctx }) => {
    const [users, tickets] = await Promise.all([
      ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      ctx.prisma.faultTicket.findMany({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return { users, tickets };
  }),

  create: operatorProcedure
    .input(
      z.object({
        title: z.string().min(3),
        type: workOrderTypeSchema,
        ticketId: z.string().cuid().optional(),
        assigneeId: z.string().cuid().optional(),
        dueDate: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.workOrder.create({
        data: {
          title: input.title,
          type: input.type,
          status: "PENDING",
          ticketId: input.ticketId,
          assigneeId: input.assigneeId,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          notes: input.notes,
        },
        include: {
          ticket: {
            select: {
              id: true,
            },
          },
        },
      });

      if (row.ticket?.id) {
        await ctx.prisma.ticketComment.create({
          data: {
            ticketId: row.ticket.id,
            authorId: ctx.session.user.id,
            body: `Work order created: ${row.title} (${row.type.replaceAll("_", " ")}).`,
          },
        });
      }

      return { id: row.id };
    }),

  updateStatus: operatorProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: workOrderStatusSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.workOrder.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
        include: {
          ticket: {
            select: {
              id: true,
            },
          },
        },
      });

      if (row.ticket?.id) {
        await ctx.prisma.ticketComment.create({
          data: {
            ticketId: row.ticket.id,
            authorId: ctx.session.user.id,
            body: `Work order ${row.title} moved to ${input.status.replaceAll("_", " ")}.`,
          },
        });
      }

      return { id: row.id };
    }),
});
