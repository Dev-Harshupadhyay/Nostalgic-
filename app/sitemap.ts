import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const ROUTES = [
  { path: "", priority: 1 },
  { path: "/old-songs", priority: 0.9 },
  { path: "/singles", priority: 0.8 },
  { path: "/trending", priority: 0.9 },
  { path: "/chhath", priority: 0.85 },
  { path: "/bhojpuri", priority: 0.85 },
  { path: "/live", priority: 0.7 },
  { path: "/search", priority: 0.6 },
  { path: "/support", priority: 0.5 },
  { path: "/developer", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.path === "/trending" ? "daily" : "weekly",
    priority: r.priority,
  }));
}
