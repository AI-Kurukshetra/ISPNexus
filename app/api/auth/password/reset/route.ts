import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  isPasswordFingerprintMatch,
  verifyPasswordResetToken,
} from "@/lib/auth/password-reset";
import { resetPasswordSchema } from "@/lib/validations/auth.schema";
import { prisma } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid reset payload",
        },
        { status: 400 },
      );
    }

    const payload = verifyPasswordResetToken(parsed.data.token);
    if (!payload) {
      return NextResponse.json(
        {
          error: "Reset token is invalid or expired",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Reset token is invalid or expired",
        },
        { status: 400 },
      );
    }

    const isValidFingerprint = isPasswordFingerprintMatch({
      passwordHash: user.passwordHash,
      fingerprint: payload.pwd,
    });
    if (!isValidFingerprint) {
      return NextResponse.json(
        {
          error: "Reset token has already been used. Request a new reset link.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to reset password right now. Please try again.",
      },
      { status: 503 },
    );
  }
}
