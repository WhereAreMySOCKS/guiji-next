import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 页面未找到 | 龟迹 CheloniaTrace",
  description: "请求的页面不存在或已被移除。返回龟迹首页继续浏览。",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="text-6xl font-extrabold text-slate-300">404</span>
        <h2 className="mt-4 text-xl font-bold text-slate-950">页面未找到</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          该页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
