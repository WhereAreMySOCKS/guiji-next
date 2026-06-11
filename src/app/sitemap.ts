import type { MetadataRoute } from "next";
import { getTaxonEntries, localizedTaxonUrl, SITE_URL } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getTaxonEntries();

  const staticPaths = ["", "/tools/feeding-strategy", "/research", "/research/species", "/research/sources", "/encyclopedia", "/taxonomy", "/download"];
  const homePages: MetadataRoute.Sitemap = staticPaths.flatMap((path) => [
    {
      url: `${SITE_URL}/zh${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path === "/tools/feeding-strategy" ? 0.95 : 0.85,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/zh${path}`,
          "en-US": `${SITE_URL}/en${path}`,
        },
      },
    },
    {
      url: `${SITE_URL}/en${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path === "/tools/feeding-strategy" ? 0.9 : 0.8,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/zh${path}`,
          "en-US": `${SITE_URL}/en${path}`,
        },
      },
    },
  ]);

  const taxonPages: MetadataRoute.Sitemap = entries.flatMap((entry) => [
    {
      url: localizedTaxonUrl("zh", entry.slug),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: entry.node.rank === "species" || entry.node.rank === "subspecies" ? 0.85 : 0.75,
      alternates: {
        languages: {
          "zh-CN": localizedTaxonUrl("zh", entry.slug),
          "en-US": localizedTaxonUrl("en", entry.slug),
        },
      },
    },
    {
      url: localizedTaxonUrl("en", entry.slug),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: entry.node.rank === "species" || entry.node.rank === "subspecies" ? 0.85 : 0.75,
      alternates: {
        languages: {
          "zh-CN": localizedTaxonUrl("zh", entry.slug),
          "en-US": localizedTaxonUrl("en", entry.slug),
        },
      },
    },
  ]);

  return [...homePages, ...taxonPages];
}
