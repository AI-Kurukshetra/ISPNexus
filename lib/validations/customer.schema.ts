import { z } from "zod";

export const customerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED"]),
});

export type CustomerInput = z.infer<typeof customerSchema>;
