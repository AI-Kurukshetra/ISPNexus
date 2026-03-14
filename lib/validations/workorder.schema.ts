import { z } from "zod";

export const workOrderSchema = z.object({
  title: z.string().min(3),
  type: z.enum(["INSTALL", "REPAIR", "UPGRADE", "SURVEY"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  ticketId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type WorkOrderInput = z.infer<typeof workOrderSchema>;
