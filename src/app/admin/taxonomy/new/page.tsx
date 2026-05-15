"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateNode } from "@/lib/admin/hooks/useTaxonomy";

export default function NewTaxonomyNode() {
  const router = useRouter();
  const createNode = useCreateNode();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.target as HTMLFormElement);
    try {
      const node = await createNode.mutateAsync({
        name: form.get("name") as string,
        english_name: (form.get("english_name") as string) || undefined,
        latin_name: (form.get("latin_name") as string) || undefined,
        rank: form.get("rank") as string,
        page: form.get("page") ? Number(form.get("page")) : undefined,
        parent_id: (form.get("parent_id") as string) || undefined,
      });
      router.push(`/admin/taxonomy/${node.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-bold text-gray-800 mb-4">新建物种</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            中文名 *
          </label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f6821f]"
            placeholder="如: 中华草龟"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              英文名
            </label>
            <input
              name="english_name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f6821f]"
              placeholder="Chinese Pond Turtle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              拉丁名
            </label>
            <input
              name="latin_name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f6821f] font-mono"
              placeholder="Mauremys reevesii"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rank *
            </label>
            <select
              name="rank"
              required
              defaultValue="species"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f6821f]"
            >
              {["order", "family", "genus", "species", "subspecies"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              页码
            </label>
            <input
              name="page"
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f6821f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            父节点 ID
          </label>
          <input
            name="parent_id"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#f6821f]"
            placeholder="UUID of parent taxonomy node"
          />
          <p className="text-xs text-gray-400 mt-1">
            可以从物种列表中找到父节点的 ID 填入
          </p>
        </div>

        <button
          type="submit"
          disabled={createNode.isPending}
          className="w-full py-2 bg-[#f6821f] text-white rounded-lg text-sm font-medium hover:bg-[#e57317] disabled:opacity-50 transition-colors"
        >
          {createNode.isPending ? "创建中..." : "创建"}
        </button>
      </form>
    </div>
  );
}
