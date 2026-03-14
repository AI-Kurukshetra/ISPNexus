import { NextResponse } from "next/server";

import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { requestResetSchema } from "@/lib/validations/auth.schema";
import { prisma } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid request",
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "If this email exists, a reset link has been generated.",
      });
    }

    const { token, expiresAt } = createPasswordResetToken({
      userId: user.id,
      passwordHash: user.passwordHash,
    });

    const origin =
      process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
    const resetPath = `/reset-password?token=${token}`;
    const resetUrl = `${origin}${resetPath}`;

    return NextResponse.json({
      ok: true,
      message: "Password reset link generated.",
      resetUrl,
      resetPath,
      expiresAt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate reset link right now. Please try again.";
    const isSecretError = message.includes("AUTH_SECRET") || message.includes("NEXTAUTH_SECRET");

    return NextResponse.json(
      {
        error: isSecretError
          ? "Missing auth secret. Set AUTH_SECRET (or NEXTAUTH_SECRET)."
          : "Unable to generate reset link right now. Please try again.",
      },
      { status: isSecretError ? 500 : 503 },
    );
  }
}
