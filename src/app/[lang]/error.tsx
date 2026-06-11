"use client";

import { useEffect } from "react";

export default function LangError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-4xl text-red-500">error</span>
        <h2 className="mt-4 text-xl font-bold text-slate-950">出错了</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          页面加载时发生了意外错误，请重试。
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
        >
          重试
        </button>
      </div>
    </div>
  );
}
