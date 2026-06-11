import type { Metadata } from "next";
import TaxonomyClient from "@/components/taxonomy/TaxonomyClient";
import { getTaxonomyTree } from "@/lib/taxonomy";
import { pageMetadata } from "@/lib/seo";
import type { Lang } from "@/lib/taxonomySlug";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    lang,
    titleZh: "龟鳖目物种树 | 分类浏览 | 龟迹 CheloniaTrace",
    titleEn: "Testudines Taxonomy Tree | Species Browser | CheloniaTrace",
    descZh: "按分类层级浏览全球龟鳖目物种，从目到科到属到种，查看完整分类信息。",
    descEn: "Browse the complete Testudines taxonomy from order to species with full classification details.",
    path: "/taxonomy",
    keywords: ["龟鳖目", "物种树", "分类", "乌龟品种", "Testudines", "龟迹"],
  });
}

export default async function TaxonomyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Lang;
  const treeData = await getTaxonomyTree();

  return treeData ? (
    <TaxonomyClient initialTreeData={treeData} lang={lang} />
  ) : (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-medium text-red-500">数据加载失败，请检查网络连接或接口状态。</p>
    </div>
  );
}
