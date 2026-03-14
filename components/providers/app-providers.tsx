import type { Session } from "next-auth";
import { Toaster } from "sonner";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";

export function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <AuthSessionProvider session={session}>
      <TRPCProvider>
        {children}
        <Toaster closeButton duration={4000} richColors position="top-right" />
      </TRPCProvider>
    </AuthSessionProvider>
  );
}
