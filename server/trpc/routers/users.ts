import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendInviteEmail } from "@/lib/supabase/send-invite-email";
import { inviteUserSchema } from "@/lib/validations/auth.schema";
import { adminProcedure, createTRPCRouter } from "@/server/trpc/trpc";

export const usersRouter = createTRPCRouter({
    list: adminProcedure.query(async ({ ctx }) => {
        return ctx.prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: "asc" },
        });
    }),

    invite: adminProcedure.input(inviteUserSchema).mutation(async ({ ctx, input }) => {
        const existing = await ctx.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });

        if (existing) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "An account with that email address already exists.",
            });
        }

        // Create with a random placeholder hash — user will set their real password
        // after clicking the invite link.
        const placeholderHash = await bcrypt.hash(crypto.randomUUID(), 10);

        const user = await ctx.prisma.user.create({
            data: {
                name: input.name,
                email: input.email.toLowerCase(),
                role: input.role,
                passwordHash: placeholderHash,
            },
        });

        const { token } = createPasswordResetToken({
            userId: user.id,
            passwordHash: placeholderHash,
        });

        const origin =
            process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
        const setPasswordUrl = `${origin}/set-password?token=${token}`;

        try {
            await sendInviteEmail({ email: user.email, setPasswordUrl });
        } catch (emailError) {
            // Roll back the user record if email delivery fails.
            await ctx.prisma.user.delete({ where: { id: user.id } }).catch(() => { });
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message:
                    emailError instanceof Error
                        ? emailError.message
                        : "Failed to send invite email. User was not created.",
            });
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }),

    remove: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (input.id === ctx.session.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You cannot remove your own account.",
                });
            }

            await ctx.prisma.user.delete({ where: { id: input.id } });
            return { success: true };
        }),
});
