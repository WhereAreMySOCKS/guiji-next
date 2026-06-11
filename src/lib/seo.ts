import type { Metadata } from "next";

const BASE_URL = "https://www.guiji.online";
const OG_IMAGE_DEFAULT = "/images/og-default.jpg";

export function pageMetadata(params: {
  lang: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  path: string;
  keywords?: string[];
  ogType?: "website" | "article";
  ogImage?: string;
}): Metadata {
  const isZh = params.lang !== "en";
  const title = isZh ? params.titleZh : params.titleEn;
  const description = isZh ? params.descZh : params.descEn;
  const url = `${BASE_URL}/${isZh ? "zh" : "en"}${params.path}`;
  const imageUrl = params.ogImage || OG_IMAGE_DEFAULT;

  return {
    title,
    description,
    keywords: params.keywords,
    alternates: {
      canonical: url,
      languages: {
        "x-default": `${BASE_URL}${params.path}`,
        "zh-CN": `${BASE_URL}/zh${params.path}`,
        "en-US": `${BASE_URL}/en${params.path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CheloniaTrace",
      locale: isZh ? "zh_CN" : "en_US",
      type: params.ogType || "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
