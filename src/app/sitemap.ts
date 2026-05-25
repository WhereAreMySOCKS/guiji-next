import type { MetadataRoute } from "next";
import { getTaxonEntries, localizedTaxonUrl, SITE_URL } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getTaxonEntries();

  const homePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/zh`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/zh`,
          "en-US": `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/zh`,
          "en-US": `${SITE_URL}/en`,
        },
      },
    },
  ];

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
