import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { signUpSchema } from "@/lib/validations/auth.schema";
import { prisma } from "@/server/db";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid sign up input",
      },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return NextResponse.json(
      {
        error: "An account with that email already exists",
      },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: "csr",
    },
  });

  return NextResponse.json({ ok: true });
}
