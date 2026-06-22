import type { MetadataRoute } from "next";
import { DEMOS } from "@/data/demos";

const BASE = "https://xfalcon.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                         changeFrequency: "weekly",   priority: 1.0 },
    { url: `${BASE}/demos`,              changeFrequency: "weekly",   priority: 0.9 },
    { url: `${BASE}/pricing`,            changeFrequency: "monthly",  priority: 0.8 },
    { url: `${BASE}/docs`,               changeFrequency: "weekly",   priority: 0.8 },
    { url: `${BASE}/about`,              changeFrequency: "monthly",  priority: 0.7 },
    { url: `${BASE}/blog`,               changeFrequency: "weekly",   priority: 0.7 },
    { url: `${BASE}/contact`,            changeFrequency: "monthly",  priority: 0.6 },
    { url: `${BASE}/changelog`,          changeFrequency: "weekly",   priority: 0.6 },
    { url: `${BASE}/careers`,            changeFrequency: "monthly",  priority: 0.5 },
    { url: `${BASE}/press`,              changeFrequency: "monthly",  priority: 0.5 },
    { url: `${BASE}/signup`,             changeFrequency: "monthly",  priority: 0.5 },
    { url: `${BASE}/security`,           changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/privacy`,            changeFrequency: "yearly",   priority: 0.3 },
    { url: `${BASE}/terms`,              changeFrequency: "yearly",   priority: 0.3 },
  ];

  const demoPages: MetadataRoute.Sitemap = DEMOS.map(d => ({
    url: `${BASE}/demos/${d.slug}`,
    changeFrequency: "monthly" as const,
    priority: d.featured ? 0.8 : 0.7,
  }));

  return [...staticPages, ...demoPages];
}
