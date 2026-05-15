"use client";

import { useState } from "react";
import Link from "next/link";
import { useTaxonomyNodes, useDeleteNode } from "@/lib/admin/hooks/useTaxonomy";

const RANKS = ["", "order", "family", "genus", "species", "subspecies"];
const TRAIT_FILTERS = [
  { value: "", label: "全部特征" },
  { value: "true", label: "已配置特征" },
  { value: "false", label: "未配置特征" },
];

function generateChallenge(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function TaxonomyListPage() {
  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("");
  const [traitFilter, setTraitFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteChallenge, setDeleteChallenge] = useState("");
  const [deleteInput, setDeleteInput] = useState("");

  const { data, isLoading, error, refetch } = useTaxonomyNodes({
    search: search || undefined,
    rank: rank || undefined,
    has_trait: traitFilter === "" ? undefined : traitFilter === "true",
    page,
    size: 20,
  });
  const deleteNode = useDeleteNode();

  function startDelete(id: string) {
    setDeleteTarget(id);
    setDeleteChallenge(generateChallenge());
    setDeleteInput("");
  }

  function cancelDelete() {
    setDeleteTarget(null);
    setDeleteChallenge("");
    setDeleteInput("");
  }

  async function handleDelete(id: string) {
    if (deleteInput !== deleteChallenge) return;
    await deleteNode.mutateAsync(id);
    cancelDelete();
    refetch();
  }

  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / 20));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">物种管理</h1>
        <Link
          href="/admin/taxonomy/new"
          className="px-4 py-1.5 text-sm bg-[#f6821f] text-white rounded-lg hover:bg-[#e57317] transition-colors"
        >
          新建物种
        </Link>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索名称..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#f6821f]"
        />
        <select
          value={rank}
          onChange={(e) => { setRank(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          {RANKS.map((r) => (
            <option key={r} value={r}>
              {r || "全部 rank"}
            </option>
          ))}
        </select>
        <select
          value={traitFilter}
          onChange={(e) => { setTraitFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          {TRAIT_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500 p-4">加载中...</div>
      )}
      {error && (
        <div className="text-sm text-red-600 p-4">
          加载失败: {error.message}
          <button onClick={() => refetch()} className="ml-2 underline">
            重试
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">名称</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-20">Rank</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600 w-16">特征</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600 w-28">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.nodes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  data.nodes.map((node) => (
                    <tr key={node.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span className="font-medium text-gray-800">{node.name}</span>
                        {node.english_name && (
                          <span className="text-gray-400 ml-2 text-xs">
                            {node.english_name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {node.rank}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {node.has_trait ? (
                          <span className="material-symbols-outlined text-[#f6821f] text-base">
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-gray-300 text-base">
                            radio_button_unchecked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/admin/taxonomy/${node.id}`}
                          className="text-[#f6821f] hover:text-[#e57317] text-xs mr-3"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => startDelete(node.id)}
                          className="text-gray-400 hover:text-red-600 text-xs"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>共 {data.total} 条</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50"
              >
                上一页
              </button>
              <span className="px-3 py-1">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={cancelDelete}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              <div>
                <h3 className="text-base font-bold text-gray-800">确认删除</h3>
                <p className="text-sm text-gray-500">
                  此操作不可撤销。
                  <span className="font-semibold text-gray-700">
                    「{data?.nodes.find((n) => n.id === deleteTarget)?.name || "未知物种"}」
                  </span>
                  及其特征数据将被永久删除。
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              请输入以下字符以确认操作：
            </p>
            <div className="bg-gray-100 rounded-lg px-4 py-2 mb-3 text-center font-mono text-lg font-bold text-gray-800 tracking-widest select-all">
              {deleteChallenge}
            </div>

            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && deleteInput === deleteChallenge && !deleteNode.isPending) {
                  handleDelete(deleteTarget!);
                }
              }}
              placeholder="输入上方字符"
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteTarget!)}
                disabled={deleteInput !== deleteChallenge || deleteNode.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {deleteNode.isPending ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
