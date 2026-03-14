import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  deviceId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
});

export type TicketInput = z.infer<typeof ticketSchema>;
