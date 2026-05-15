"use client";

import { useState, useEffect } from "react";
import {
  useStrategyConfigs,
  useUpdateConfigs,
  type StrategyConfigField,
} from "@/lib/admin/hooks/useStrategyConfigs";

const TABS = [
  { key: "feeding", label: "喂食策略" },
  { key: "hibernation", label: "冬眠策略" },
  { key: "basking", label: "晒背策略" },
  { key: "fallback", label: "兜底特征" },
] as const;

// 字段分组（按注释分组让页面更有条理）
const FIELD_GROUPS: Record<string, { label: string; keys: string[] }[]> = {
  feeding: [
    { label: "生存边界", keys: ["absolute_min_temp", "weather_drop_threshold", "cold_snap_single_drop_threshold", "cold_snap_2day_drop_threshold"] },
    { label: "气温波动", keys: ["temp_fluctuation_warn_threshold"] },
    { label: "年龄阶段", keys: ["juvenile_max_age_months", "adult_min_age_months", "juvenile_interval_multiplier", "adult_interval_multiplier"] },
    { label: "基础间隔", keys: ["default_base_interval_hours"] },
    { label: "温差调节", keys: ["temp_range_warn_threshold", "temp_range_high_threshold", "temp_range_interval_multiplier"] },
    { label: "目标微调", keys: ["color_enhance_supplement", "growth_boost_protein_tip"] },
    { label: "行为自适应", keys: ["adaptive_min_records", "adaptive_bias_weight", "adaptive_consistency_threshold", "adaptive_min_safe_multiplier", "adaptive_max_safe_multiplier", "adaptive_hour_confidence"] },
    { label: "状态判定", keys: ["grace_period_hours"] },
    { label: "食谱结构", keys: ["diet_ratio_carnivore", "diet_ratio_herbivore", "diet_ratio_omnivore", "diet_ratio_default"] },
  ],
  hibernation: [
    { label: "温度边界", keys: ["max_entry_temp", "min_safe_temp", "max_safe_temp", "cool_down_weeks"] },
    { label: "身体条件", keys: ["min_weight_grams", "min_age_months"] },
    { label: "清肠与时长", keys: ["prep_fasting_weeks", "max_hibernation_weeks"] },
  ],
  basking: [
    { label: "时长", keys: ["min_hours_per_day", "optimal_hours_per_day", "max_hours_per_day"] },
    { label: "UVB", keys: ["default_uvb_level", "uvb_replacement_months"] },
    { label: "温度", keys: ["basking_spot_temp_min", "basking_spot_temp_max", "ambient_gradient"] },
  ],
  fallback: [
    { label: "温度", keys: ["temp_min", "temp_max"] },
    { label: "食性", keys: ["diet_type"] },
    { label: "喂食", keys: ["base_feed_interval_hours", "mature_age_months"] },
    { label: "特征标记", keys: ["accepts_color_enhance", "allow_rapid_growth", "can_hibernate"] },
    { label: "晒背", keys: ["basking_need", "basking_hours_per_day", "basking_uvb_min"] },
    { label: "冬眠", keys: ["hibernation_temp_min", "hibernation_temp_max", "hibernation_duration_weeks", "prep_fasting_weeks"] },
  ],
};

function FieldCard({
  field,
  onChange,
}: {
  field: StrategyConfigField;
  onChange: (key: string, value: unknown) => void;
}) {
  const initVal =
    field.current_value !== null && field.current_value !== undefined
      ? String(field.current_value)
      : "";
  const [localValue, setLocalValue] = useState(initVal);
  const [dirty, setDirty] = useState(false);
  const isBool = field.type === "bool";
  const isNumber = field.type === "int" || field.type === "float";

  useEffect(() => {
    const v =
      field.current_value !== null && field.current_value !== undefined
        ? String(field.current_value)
        : "";
    setLocalValue(v);
    setDirty(false);
  }, [field.key]);

  function handleChange(val: string) {
    setLocalValue(val);
    setDirty(true);
    if (isBool) {
      onChange(field.key, val === "true");
    } else if (isNumber) {
      onChange(field.key, val === "" ? null : Number(val));
    } else {
      onChange(field.key, val);
    }
  }

  const hasStatus = dirty || field.is_overridden;

  return (
    <div className="flex items-start gap-4 py-3 px-4 rounded-lg hover:bg-gray-50/50 transition-colors group">
      {/* 左侧：中文含义（主） + key（副） */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 leading-snug">
          {field.description || field.key}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-gray-400 select-all">
          {field.key}
        </div>
      </div>

      {/* 右侧：控件 + 信息 */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* 默认值提示 */}
        <span className="text-[11px] text-gray-400 hidden sm:inline-block w-16 text-right tabular-nums">
          默认 {String(field.default_value)}
        </span>

        {/* 编辑控件 */}
        <div className="w-36">
          {isBool ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localValue === "true"}
                onChange={(e) => handleChange(e.target.checked ? "true" : "false")}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f6821f]" />
            </label>
          ) : (
            <input
              type={isNumber ? "number" : "text"}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              step={field.type === "float" ? "0.1" : "1"}
              className={`w-full px-2.5 py-1.5 text-sm border rounded-md font-mono transition-colors
                ${hasStatus
                  ? "border-orange-300 bg-orange-50/30 focus:ring-orange-300"
                  : "border-gray-200 bg-white focus:ring-gray-300"
                }
                focus:outline-none focus:ring-2 focus:border-transparent
              `}
            />
          )}
        </div>

        {/* 状态标记 */}
        {dirty && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            已修改
          </span>
        )}
        {field.is_overridden && !dirty && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            已覆盖
          </span>
        )}
      </div>
    </div>
  );
}

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState("feeding");
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f6821f]" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        加载失败: {error.message}
      </div>
    );
  }

  // 构建 field map
  const fieldMap = new Map<string, StrategyConfigField>();
  data?.fields.forEach((f) => fieldMap.set(f.key, f));

  const overrideCount = Array.from(overrides.keys()).length;
  const tabOverrideCount = Array.from(overrides.keys()).filter((k) =>
    k.startsWith(activeTab + ".")
  ).length;
  const tabDBOverrides = (data?.fields || []).filter(
    (f) => f.group === activeTab && f.is_overridden
  ).length;

  return (
    <div className="max-w-4xl">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">策略配置</h1>
          <p className="mt-1 text-sm text-gray-500">
            调整策略引擎参数，修改后即时生效无需重启
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            disabled={updateConfigs.isPending}
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            恢复全部默认
          </button>
          <button
            onClick={handleSave}
            disabled={overrideCount === 0 || updateConfigs.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#f6821f] rounded-lg hover:bg-[#e57317] disabled:opacity-40 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-base">save</span>
            {updateConfigs.isPending
              ? "保存中..."
              : `保存${tabOverrideCount > 0 ? ` (${tabOverrideCount} 项)` : ""}`}
          </button>
        </div>
      </div>

      {/* 保存成功提示 */}
      {saved && (
        <div className="mb-5 flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          <span className="material-symbols-outlined text-base">check_circle</span>
          配置已保存并即时生效
        </div>
      )}

      {/* Tab 导航 */}
      <div className="flex gap-0.5 mb-6 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => {
          const count =
            fieldMap.get(tab.key + ".absolute_min_temp") !== undefined ||
            fieldMap.get(tab.key + ".temp_min") !== undefined
              ? (() => {
                  const fields = data?.fields.filter((f) => f.group === tab.key) || [];
                  const dbOverridden = fields.filter((f) => f.is_overridden).length;
                  const localOverridden = Array.from(overrides.keys()).filter((k) =>
                    k.startsWith(tab.key + ".")
                  ).length;
                  return dbOverridden + localOverridden;
                })()
              : 0;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSaved(false); }}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[11px] font-semibold rounded-full ${
                    activeTab === tab.key
                      ? "bg-[#f6821f] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 字段列表 */}
      <div className="space-y-4">
        {(FIELD_GROUPS[activeTab] || []).map((group) => {
          const groupFields = group.keys
            .map((k) => fieldMap.get(`${activeTab}.${k}`))
            .filter(Boolean) as StrategyConfigField[];

          if (groupFields.length === 0) return null;

          return (
            <div
              key={group.label}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* 分组标题 */}
              <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.label}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {groupFields.map((f) => (
                  <FieldCard key={f.key} field={f} onChange={handleFieldChange} />
                ))}
              </div>
            </div>
          );
        })}

        {/* 如果某 tab 没有预定义分组，显示所有字段 */}
        {(!FIELD_GROUPS[activeTab] || FIELD_GROUPS[activeTab].length === 0) &&
          (() => {
            const allFields = (data?.fields || []).filter(
              (f) => f.group === activeTab
            );
            if (allFields.length === 0) {
              return (
                <div className="py-16 text-center text-sm text-gray-400">
                  该分组暂无字段
                </div>
              );
            }
            return (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100">
                  {allFields.map((f) => (
                    <FieldCard key={f.key} field={f} onChange={handleFieldChange} />
                  ))}
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
