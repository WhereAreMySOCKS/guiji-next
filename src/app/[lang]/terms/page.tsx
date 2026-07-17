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
    title: lang === "zh" ? "龟迹用户协议" : "CheloniaTrace Terms of Service",
    description: lang === "zh" ? "龟迹用户协议" : "Terms governing the CheloniaTrace service.",
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "en" ? "en" : "zh";
  return <LegalDocumentPage lang={lang} kind="terms" />;
}
