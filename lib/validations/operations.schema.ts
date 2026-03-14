import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const subscriberCreateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Provide a valid email"),
  phone: optionalText,
  street: optionalText,
  city: optionalText,
  state: optionalText,
  zip: optionalText,
});

export const ticketCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  deviceId: optionalText,
  customerId: optionalText,
  assigneeId: optionalText,
});

export const ticketCommentSchema = z.object({
  body: z.string().trim().min(2, "Add at least 2 characters"),
});

export const workOrderCreateSchema = z.object({
  title: z.string().trim().min(3, "Work order title must be at least 3 characters"),
  type: z.enum(["INSTALL", "REPAIR", "UPGRADE", "SURVEY"]),
  ticketId: optionalText,
  assigneeId: optionalText,
  dueDate: optionalText,
  notes: optionalText,
});
