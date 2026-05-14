"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useTaxonomyNode,
  useUpdateNode,
  useSaveTrait,
  useDeleteNode,
} from "@/lib/admin/hooks/useTaxonomy";

const DIET_OPTIONS = ["", "肉食性", "素食性", "杂食性"];
const BASKING_OPTIONS = ["", "低", "中", "高"];
const UVB_OPTIONS = ["", "低", "中", "高"];

export default function TaxonomyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: node, isLoading, error } = useTaxonomyNode(id);
  const updateNode = useUpdateNode();
  const saveTrait = useSaveTrait();
  const deleteNode = useDeleteNode();

  const [form, setForm] = useState<Record<string, string>>({});
  const [traitForm, setTraitForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [traitSaved, setTraitSaved] = useState(false);

  useEffect(() => {
    if (node) {
      setForm({
        name: node.name,
        english_name: node.english_name || "",
        latin_name: node.latin_name || "",
        rank: node.rank,
        page: node.page?.toString() || "",
        parent_id: node.parent_id || "",
      });
      if (node.trait) {
        setTraitForm({
          temp_min: node.trait.temp_min?.toString() || "",
          temp_max: node.trait.temp_max?.toString() || "",
          diet_type: node.trait.diet_type || "",
          base_feed_interval_hours: node.trait.base_feed_interval_hours?.toString() || "",
          mature_age_months: node.trait.mature_age_months?.toString() || "",
          accepts_color_enhance: node.trait.accepts_color_enhance?.toString() || "",
          allow_rapid_growth: node.trait.allow_rapid_growth?.toString() || "",
          can_hibernate: node.trait.can_hibernate?.toString() || "",
          hibernation_temp_min: node.trait.hibernation_temp_min?.toString() || "",
          hibernation_temp_max: node.trait.hibernation_temp_max?.toString() || "",
          hibernation_duration_weeks: node.trait.hibernation_duration_weeks?.toString() || "",
          prep_fasting_weeks: node.trait.prep_fasting_weeks?.toString() || "",
          basking_need: node.trait.basking_need || "",
          basking_hours_per_day: node.trait.basking_hours_per_day?.toString() || "",
          basking_uvb_min: node.trait.basking_uvb_min || "",
        });
      }
    }
  }, [node]);

  async function handleSaveNode() {
    await updateNode.mutateAsync({
      id,
      name: form.name,
      english_name: form.english_name || undefined,
      latin_name: form.latin_name || undefined,
      rank: form.rank,
      page: form.page ? Number(form.page) : undefined,
      parent_id: form.parent_id || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSaveTrait() {
    const toNum = (v: string) => (v === "" ? null : Number(v));
    const toBool = (v: string) => (v === "" ? null : v === "true");
    await saveTrait.mutateAsync({
      nodeId: id,
      temp_min: toNum(traitForm.temp_min),
      temp_max: toNum(traitForm.temp_max),
      diet_type: traitForm.diet_type || null,
      base_feed_interval_hours: toNum(traitForm.base_feed_interval_hours),
      mature_age_months: traitForm.mature_age_months ? Number(traitForm.mature_age_months) : null,
      accepts_color_enhance: toBool(traitForm.accepts_color_enhance),
      allow_rapid_growth: toBool(traitForm.allow_rapid_growth),
      can_hibernate: toBool(traitForm.can_hibernate),
      hibernation_temp_min: toNum(traitForm.hibernation_temp_min),
      hibernation_temp_max: toNum(traitForm.hibernation_temp_max),
      hibernation_duration_weeks: traitForm.hibernation_duration_weeks
        ? Number(traitForm.hibernation_duration_weeks)
        : null,
      prep_fasting_weeks: traitForm.prep_fasting_weeks
        ? Number(traitForm.prep_fasting_weeks)
        : null,
      basking_need: traitForm.basking_need || null,
      basking_hours_per_day: toNum(traitForm.basking_hours_per_day),
      basking_uvb_min: traitForm.basking_uvb_min || null,
    });
    setTraitSaved(true);
    setTimeout(() => setTraitSaved(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("确定删除此节点吗？")) return;
    await deleteNode.mutateAsync(id);
    router.push("/admin/taxonomy");
  }

  function setF(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setTF(key: string, value: string) {
    setTraitForm((prev) => ({ ...prev, [key]: value }));
    setTraitSaved(false);
  }

  if (isLoading) return <div className="text-sm text-gray-500 p-4">加载中...</div>;
  if (error || !node) {
    return <div className="text-sm text-red-600 p-4">加载失败: {error?.message || "未找到"}</div>;
  }

  const input = (label: string, key: string, type = "text", extra: Record<string, unknown> = {}) => (
    <div key={key}>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={(e) => setF(key, e.target.value)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
        {...extra}
      />
    </div>
  );

  const traitInput = (label: string, key: string, type = "text") => (
    <div key={key}>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <input
        type={type}
        value={traitForm[key] || ""}
        onChange={(e) => setTF(key, e.target.value)}
        step={type === "number" ? "0.1" : undefined}
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
      />
    </div>
  );

  const traitSelect = (label: string, key: string, options: string[]) => (
    <div key={key}>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <select
        value={traitForm[key] || ""}
        onChange={(e) => setTF(key, e.target.value)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "-"}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-bold text-gray-800 mb-4">
        编辑物种: {node.name}
      </h1>

      {/* Node info */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">基本信息</h2>
        <div className="grid grid-cols-2 gap-3">
          {input("中文名", "name")}
          {input("英文名", "english_name")}
          {input("拉丁名", "latin_name")}
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Rank</label>
            <select
              value={form.rank || ""}
              onChange={(e) => setF("rank", e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
            >
              {["order", "family", "genus", "species", "subspecies"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {input("页码", "page", "number")}
          {input("父节点 ID", "parent_id")}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSaveNode}
            disabled={updateNode.isPending}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {updateNode.isPending ? "保存中..." : "保存基本信息"}
          </button>
          {saved && <span className="text-sm text-emerald-600 self-center">已保存</span>}
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded ml-auto"
          >
            删除节点
          </button>
        </div>
      </section>

      {/* Trait editor */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">饲养特征</h2>

        <h3 className="text-xs font-medium text-gray-500 mb-2">通用温区</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {traitInput("最低温度 (°C)", "temp_min", "number")}
          {traitInput("最高温度 (°C)", "temp_max", "number")}
        </div>

        <h3 className="text-xs font-medium text-gray-500 mb-2">喂食参数</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {traitSelect("食性", "diet_type", DIET_OPTIONS)}
          {traitInput("基础喂食间隔 (h)", "base_feed_interval_hours", "number")}
          {traitInput("成体月龄", "mature_age_months", "number")}
          {traitSelect("支持发色", "accepts_color_enhance", ["", "true", "false"])}
          {traitSelect("允许快速生长", "allow_rapid_growth", ["", "true", "false"])}
        </div>

        <h3 className="text-xs font-medium text-gray-500 mb-2">冬眠参数</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {traitSelect("可冬眠", "can_hibernate", ["", "true", "false"])}
          {traitInput("冬眠最低温度 (°C)", "hibernation_temp_min", "number")}
          {traitInput("冬眠最高温度 (°C)", "hibernation_temp_max", "number")}
          {traitInput("冬眠持续周数", "hibernation_duration_weeks", "number")}
          {traitInput("清肠周数", "prep_fasting_weeks", "number")}
        </div>

        <h3 className="text-xs font-medium text-gray-500 mb-2">晒背参数</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {traitSelect("晒背需求", "basking_need", BASKING_OPTIONS)}
          {traitInput("每日晒背时长 (h)", "basking_hours_per_day", "number")}
          {traitSelect("最低 UVB", "basking_uvb_min", UVB_OPTIONS)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveTrait}
            disabled={saveTrait.isPending}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {saveTrait.isPending ? "保存中..." : "保存特征"}
          </button>
          {traitSaved && (
            <span className="text-sm text-emerald-600 self-center">已保存</span>
          )}
        </div>
      </section>
    </div>
  );
}
