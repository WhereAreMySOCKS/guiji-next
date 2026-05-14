"use client";

import { useState } from "react";
import {
  useStrategyConfigs,
  useUpdateConfigs,
  type StrategyConfigField,
} from "@/lib/admin/hooks/useStrategyConfigs";

const GROUP_LABELS: Record<string, string> = {
  feeding: "喂食策略",
  hibernation: "冬眠策略",
  basking: "晒背策略",
  fallback: "兜底特征",
};

function FieldRow({
  field,
  onChange,
}: {
  field: StrategyConfigField;
  onChange: (key: string, value: unknown) => void;
}) {
  const [dirty, setDirty] = useState(false);
  const isBool = field.type === "bool";
  const isNumber = field.type === "int" || field.type === "float";

  function handleChange(val: string) {
    setDirty(true);
    if (isBool) {
      onChange(field.key, val === "true");
    } else if (isNumber) {
      onChange(field.key, val === "" ? null : Number(val));
    } else {
      onChange(field.key, val);
    }
  }

  const currentVal =
    field.current_value !== null && field.current_value !== undefined
      ? String(field.current_value)
      : "";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 text-sm">
      <div className="w-48 flex-shrink-0">
        <div className="font-medium text-gray-700 text-xs">{field.key}</div>
      </div>
      <div className="w-24 flex-shrink-0">
        {isBool ? (
          <select
            value={currentVal}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-2 py-1 border rounded text-xs"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type={isNumber ? "number" : "text"}
            value={currentVal}
            onChange={(e) => handleChange(e.target.value)}
            step={field.type === "float" ? "0.1" : "1"}
            className="w-full px-2 py-1 border rounded text-xs font-mono"
          />
        )}
      </div>
      <div className="w-20 flex-shrink-0 text-xs text-gray-400">
        {String(field.default_value)}
      </div>
      {dirty && (
        <span className="text-amber-600 text-xs">已修改</span>
      )}
      {field.is_overridden && !dirty && (
        <span className="text-emerald-600 text-xs">已覆盖</span>
      )}
    </div>
  );
}

export default function ConfigPage() {
  const { data, isLoading, error } = useStrategyConfigs();
  const updateConfigs = useUpdateConfigs();
  const [overrides, setOverrides] = useState<Map<string, unknown>>(new Map());
  const [saved, setSaved] = useState(false);

  function handleFieldChange(key: string, value: unknown) {
    setOverrides((prev) => {
      const next = new Map(prev);
      const field = data?.fields.find((f) => f.key === key);
      if (field && value === field.default_value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    const items = Array.from(overrides.entries()).map(([key, value]) => ({
      key,
      value,
    }));
    await updateConfigs.mutateAsync(items);
    setSaved(true);
    setOverrides(new Map());
  }

  async function handleResetAll() {
    if (!confirm("确定要清除所有配置覆盖，恢复默认值吗？")) return;
    await updateConfigs.mutateAsync([]);
    setOverrides(new Map());
    setSaved(true);
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500 p-4">加载中...</div>;
  }
  if (error) {
    return (
      <div className="text-sm text-red-600 p-4">
        加载失败: {error.message}
      </div>
    );
  }

  const groups = new Map<string, StrategyConfigField[]>();
  data?.fields.forEach((f) => {
    const g = groups.get(f.group) || [];
    g.push(f);
    groups.set(f.group, g);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">策略配置</h1>
        <div className="flex gap-2">
          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            disabled={updateConfigs.isPending}
          >
            恢复全部默认
          </button>
          <button
            onClick={handleSave}
            disabled={overrides.size === 0 || updateConfigs.isPending}
            className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {updateConfigs.isPending ? "保存中..." : "保存配置"}
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
          配置已保存并生效
        </div>
      )}

      {Array.from(groups.entries()).map(([group, fields]) => (
        <div key={group} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">
            {GROUP_LABELS[group] || group}
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3 py-1 border-b border-gray-200 text-xs text-gray-400 font-medium">
              <div className="w-48">字段</div>
              <div className="w-24">当前值</div>
              <div className="w-20">默认值</div>
              <div>状态</div>
            </div>
            {fields.map((f) => (
              <FieldRow key={f.key} field={f} onChange={handleFieldChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
