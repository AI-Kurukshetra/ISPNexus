import { NextResponse } from "next/server";

import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/supabase/send-reset-email";
import { requestResetSchema } from "@/lib/validations/auth.schema";
import { prisma } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same response to prevent email enumeration.
    const okResponse = NextResponse.json({
      ok: true,
      message: "If an account with that address exists, a reset link is on its way.",
    });

    if (!user) return okResponse;

    const { token } = createPasswordResetToken({
      userId: user.id,
      passwordHash: user.passwordHash,
    });

    const origin =
      process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    await sendPasswordResetEmail({ email, resetUrl });

    return okResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    const isConfigError =
      message.includes("SUPABASE_URL") ||
      message.includes("SUPABASE_SERVICE_ROLE_KEY") ||
      message.includes("AUTH_SECRET") ||
      message.includes("NEXTAUTH_SECRET");

    return NextResponse.json(
      {
        error: isConfigError
          ? message
          : "Unable to send reset email right now. Please try again.",
      },
      { status: isConfigError ? 500 : 503 },
    );
  }
}
