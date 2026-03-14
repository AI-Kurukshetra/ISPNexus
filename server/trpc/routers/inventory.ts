import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc";

const statusSchema = z.enum(["ALL", "AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"]);
const typeSchema = z.enum(["ALL", "ONT", "CABLE", "TRANSCEIVER", "ROUTER", "TOOL"]);

export const inventoryRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: statusSchema.default("ALL"),
        type: typeSchema.default("ALL"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.inventoryItem.findMany({
        where: {
          ...(input.status === "ALL" ? {} : { status: input.status }),
          ...(input.type === "ALL" ? {} : { type: input.type }),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        serialNumber: row.serialNumber,
        status: row.status,
        assignedDevice: row.assignedDevice,
        location: row.location,
      }));
    }),
});
