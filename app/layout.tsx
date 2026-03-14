import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "ISPNexus",
  description: "Cloud-native ISP operations platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}
