import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc";

function maskApiKey(value: string) {
  if (value.length <= 6) {
    return `${value.slice(0, 2)}•••`;
  }
  return `${value.slice(0, 8)}•••••••`;
}

export const settingsRouter = createTRPCRouter({
  profile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    const rawApiKey = process.env.ISPNEXUS_API_KEY ?? "isk_live_demo_key";

    return {
      user,
      apiKeyPreview: maskApiKey(rawApiKey),
    };
  }),
});
