import { describe, expect, test } from "vitest";

import {
  createPasswordResetToken,
  isPasswordFingerprintMatch,
  verifyPasswordResetToken,
} from "@/lib/auth/password-reset";

describe("password reset token", () => {
  test("creates and verifies token", () => {
    process.env.AUTH_SECRET = "unit-test-secret";

    const passwordHash = "$2b$12$abcdefghijklmnopqrstuv";
    const { token } = createPasswordResetToken({
      userId: "user_cuid_123",
      passwordHash,
    });

    const payload = verifyPasswordResetToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user_cuid_123");

    const matches = isPasswordFingerprintMatch({
      passwordHash,
      fingerprint: payload?.pwd ?? "",
    });

    expect(matches).toBe(true);
  });

  test("rejects tampered token", () => {
    process.env.AUTH_SECRET = "unit-test-secret";

    const { token } = createPasswordResetToken({
      userId: "user_cuid_123",
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
    });

    const [payload] = token.split(".");
    const tampered = `${payload}.invalid-signature`;
    expect(verifyPasswordResetToken(tampered)).toBeNull();
  });
});
