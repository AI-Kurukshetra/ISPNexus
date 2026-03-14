import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import { auth } from "@/auth";
import { normalizeUserRole, type UserRole } from "@/lib/auth/roles";
import { prisma } from "@/server/db";

export const createTRPCContext = async () => {
  const session = await auth();

  return {
    prisma,
    session,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

function requireRoles(roles: UserRole[]) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const role = normalizeUserRole(ctx.session.user.role);

    if (!roles.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  });
}

export const operatorProcedure = requireRoles(["admin", "noc"]);
export const adminProcedure = requireRoles(["admin"]);
