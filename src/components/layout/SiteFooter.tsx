import Link from "next/link";
import type { Lang } from "@/lib/taxonomySlug";

export default function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-500 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-bold text-slate-900">龟迹 CheloniaTrace</p>
        </div>
        <div className="flex flex-wrap gap-3 font-semibold text-slate-600">
          <Link href={`/${lang}`} className="hover:text-emerald-700">
            {lang === "zh" ? "喂食试算" : "Calculator"}
          </Link>
          <Link href={`/${lang}/research`} className="hover:text-emerald-700">
            {lang === "zh" ? "资料来源" : "Research"}
          </Link>
          <Link href={`/${lang}/encyclopedia`} className="hover:text-emerald-700">
            {lang === "zh" ? "百科" : "Encyclopedia"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
