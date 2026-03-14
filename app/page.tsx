import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "ISPNexus - The ISP Operations Platform",
  description:
    "ISPNexus is a production-ready operations platform for broadband ISPs. Manage subscribers, monitor your network in real time, resolve fault tickets, and track revenue from a single unified dashboard.",
  alternates: {
    canonical: "https://ispnexus.vercel.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ispnexus.vercel.app/#website",
      url: "https://ispnexus.vercel.app",
      name: "ISPNexus",
      description: "Cloud-native ISP operations platform",
      publisher: { "@id": "https://ispnexus.vercel.app/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://ispnexus.vercel.app/#organization",
      name: "ISPNexus",
      url: "https://ispnexus.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://ispnexus.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "ISPNexus",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://ispnexus.vercel.app",
      description:
        "A fully functional ISP management platform - subscriber tracking, network monitoring, fault tickets, analytics, work orders, and inventory management in one dashboard.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to explore with live demo environment",
      },
      featureList: [
        "Subscriber lifecycle management",
        "Real-time network device monitoring",
        "Fault ticket creation and resolution",
        "Analytics and revenue reporting",
        "Work order management",
        "Device and inventory tracking",
        "Role-based access control",
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://ispnexus.vercel.app/#webpage",
      url: "https://ispnexus.vercel.app",
      name: "ISPNexus - Cloud-Native ISP Operations Platform",
      isPartOf: { "@id": "https://ispnexus.vercel.app/#website" },
      about: { "@id": "https://ispnexus.vercel.app/#organization" },
      description:
        "ISPNexus gives broadband ISPs a unified control plane - subscriber management, real-time network monitoring, fault tickets, analytics, and work orders in one modern dashboard.",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ispnexus.vercel.app",
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is ISPNexus?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ISPNexus is a cloud-native ISP operations platform that gives broadband ISPs a unified dashboard for subscriber management, network monitoring, fault ticket handling, analytics, work orders, and inventory.",
          },
        },
        {
          "@type": "Question",
          name: "How do I try ISPNexus?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can access the live environment by signing in with your operator credentials. A demo account is also available for evaluation.",
          },
        },
        {
          "@type": "Question",
          name: "What roles does ISPNexus support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ISPNexus includes three operator roles: Admin, NOC Engineer, and CSR (Customer Service Representative), each with scoped access to the platform.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
