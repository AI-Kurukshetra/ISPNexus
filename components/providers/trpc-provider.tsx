"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import superjson from "superjson";

import { trpc } from "@/lib/trpc/client";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function getErrorDetails(error: unknown) {
  const maybeError = error as {
    data?: { code?: string };
    message?: string;
  };

  return {
    code: maybeError?.data?.code,
    message: maybeError?.message ?? "Something went wrong. Please try again.",
  };
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  const next = `${window.location.pathname}${window.location.search}`;
  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("next", next);
  window.location.assign(loginUrl.toString());
}

function handleApiError(error: unknown) {
  const { code, message } = getErrorDetails(error);

  if (code === "UNAUTHORIZED") {
    toast.error("Your session expired. Sign in again.");
    redirectToLogin();
    return;
  }

  if (code === "FORBIDDEN") {
    toast.error("You do not have permission to do that.");
    return;
  }

  toast.error(message);
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: handleApiError,
        }),
        mutationCache: new MutationCache({
          onError: handleApiError,
        }),
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
