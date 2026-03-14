import { describe, expect, test } from "vitest";

import {
  requestResetSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validations/auth.schema";

describe("auth validation schemas", () => {
  test("accepts valid sign up payload", () => {
    const result = signUpSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "Password123",
    });

    expect(result.success).toBe(true);
  });

  test("rejects weak password", () => {
    const result = signUpSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "weak",
    });

    expect(result.success).toBe(false);
  });

  test("validates reset schemas", () => {
    expect(requestResetSchema.safeParse({ email: "test@example.com" }).success).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ token: "a".repeat(40), password: "Password123" }).success,
    ).toBe(true);
  });
});
