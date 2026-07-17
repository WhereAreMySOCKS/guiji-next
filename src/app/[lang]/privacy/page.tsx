import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import type { Lang } from "@/lib/taxonomySlug";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "zh" ? "龟迹隐私政策" : "CheloniaTrace Privacy Policy",
    description:
      lang === "zh"
        ? "龟迹收集、使用、存储和保护个人信息的规则。"
        : "How CheloniaTrace collects, uses, stores, and protects personal data.",
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  return <LegalDocumentPage lang={lang} kind="privacy" />;
}
