import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard", "/subscribers", "/devices", "/tickets", "/monitoring", "/analytics", "/workorders", "/inventory", "/settings", "/api/"],
            },
        ],
        sitemap: "https://ispnexus.vercel.app/sitemap.xml",
        host: "https://ispnexus.vercel.app",
    };
}
