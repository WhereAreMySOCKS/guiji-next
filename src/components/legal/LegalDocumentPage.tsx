import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import { getLegalDocument } from "@/lib/legal";
import type { Lang } from "@/lib/taxonomySlug";

export default function LegalDocumentPage({
  lang,
  kind,
}: {
  lang: Lang;
  kind: "terms" | "privacy";
}) {
  const document = getLegalDocument(kind, lang);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href={`/${lang}`} className="font-bold text-emerald-700">
            龟迹 CheloniaTrace
          </Link>
          <nav className="flex gap-4 text-sm font-semibold text-slate-600">
            <Link href={`/${lang}/terms`} className="hover:text-emerald-700">
              {lang === "zh" ? "用户协议" : "Terms"}
            </Link>
            <Link href={`/${lang}/privacy`} className="hover:text-emerald-700">
              {lang === "zh" ? "隐私政策" : "Privacy"}
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{document.title}</h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {lang === "zh" ? "生效及更新日期：" : "Effective and updated: "}
            {document.updatedAt}
          </p>
          <p className="mt-6 rounded-2xl bg-emerald-50 p-4 leading-7 text-emerald-950">
            {document.summary}
          </p>

          <div className="mt-10 space-y-9">
            {document.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-extrabold text-slate-900">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-8 text-slate-700">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 list-disc space-y-2 pl-6 leading-8 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </article>

      <SiteFooter lang={lang} />
    </main>
  );
}
