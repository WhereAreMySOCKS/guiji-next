"use client";

import { useState } from "react";
import Link from "next/link";
import { useTaxonomyNodes, useDeleteNode } from "@/lib/admin/hooks/useTaxonomy";

const RANKS = ["", "order", "family", "genus", "species", "subspecies"];

export default function TaxonomyListPage() {
  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useTaxonomyNodes({
    search: search || undefined,
    rank: rank || undefined,
    page,
    size: 20,
  });
  const deleteNode = useDeleteNode();

  async function handleDelete(id: string) {
    await deleteNode.mutateAsync(id);
    setConfirmDelete(null);
    refetch();
  }

  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / 20));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">物种管理</h1>
        <Link
          href="/admin/taxonomy/new"
          className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          新建物种
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索名称或拉丁名..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  <th className="text-left px-4 py-2 font-medium text-gray-600">拉丁名</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-20">Rank</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-600 w-16">特征</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600 w-28">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.nodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
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
                      <td className="px-4 py-2 text-gray-500 font-mono text-xs">
                        {node.latin_name || "-"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {node.rank}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {node.has_trait ? (
                          <span className="material-symbols-outlined text-emerald-600 text-base">
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
                          className="text-emerald-600 hover:text-emerald-800 text-xs mr-3"
                        >
                          编辑
                        </Link>
                        {confirmDelete === node.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(node.id)}
                              className="text-red-600 hover:text-red-800 text-xs mr-2"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                              取消
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(node.id)}
                            className="text-gray-400 hover:text-red-600 text-xs"
                          >
                            删除
                          </button>
                        )}
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
    </div>
  );
}
