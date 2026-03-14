import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { auth } from "@/auth";
import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ispnexus.vercel.app"),
  title: {
    default: "ISPNexus - Cloud-Native ISP Operations Platform",
    template: "%s | ISPNexus",
  },
  description:
    "ISPNexus gives broadband ISPs a unified control plane - subscriber management, real-time network monitoring, fault tickets, analytics, and work orders in one modern dashboard.",
  keywords: [
    "ISP management software",
    "broadband operations platform",
    "network monitoring dashboard",
    "subscriber management system",
    "fault ticket management",
    "ISP analytics",
    "NOC dashboard",
    "network operations center",
    "CPE management",
    "ISP billing and ticketing",
  ],
  authors: [{ name: "ISPNexus" }],
  creator: "ISPNexus",
  publisher: "ISPNexus",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ispnexus.vercel.app",
    siteName: "ISPNexus",
    title: "ISPNexus - Cloud-Native ISP Operations Platform",
    description:
      "Manage subscribers, monitor network devices, handle fault tickets, and view live analytics - all in one modern ISP operations dashboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ISPNexus dashboard preview - cloud-native ISP operations platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ISPNexus - Cloud-Native ISP Operations Platform",
    description:
      "Manage subscribers, monitor network devices, handle fault tickets, and view live analytics - all in one modern ISP operations dashboard.",
    images: ["/og-image.png"],
    creator: "@ispnexus",
  },
  alternates: {
    canonical: "https://ispnexus.vercel.app",
  },
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased font-sans">
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}
