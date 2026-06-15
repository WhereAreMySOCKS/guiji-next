"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/taxonomySlug";
import {
  fetchResearchForSpecies,
  searchTaxonomySpecies,
  submitPublicFeedingPreview,
  type PublicFeedingPreviewResponse,
  type TaxonomySpeciesSuggestion,
} from "@/lib/publicTools";
import type { ResearchSpeciesDetail } from "@/lib/research";
import EvidenceList from "../research/EvidenceList";

export default function CalculatorPanel({
  lang,
  compact = false,
  initialSpecies = "",
  initialWaterTemp = "26",
  initialAgeMonths = "18",
  initialWeight = "300",
  initialGoal = "健康日常",
  initialCity = DEFAULT_CITY_ID,
  autoSubmit = false,
  redirectOnSubmit = false,
}: {
  lang: Lang;
  compact?: boolean;
  initialSpecies?: string;
  initialWaterTemp?: string;
  initialAgeMonths?: string;
  initialWeight?: string;
  initialGoal?: "健康日常" | "发色需求" | "快速生长";
  initialCity?: string;
  autoSubmit?: boolean;
  redirectOnSubmit?: boolean;
}) {
  const router = useRouter();
  const [speciesName, setSpeciesName] = useState(initialSpecies);
  const [waterTemp, setWaterTemp] = useState(initialWaterTemp);
  const [ageMonths, setAgeMonths] = useState(initialAgeMonths);
  const [weight, setWeight] = useState(initialWeight);
  const [goal, setGoal] = useState<"健康日常" | "发色需求" | "快速生长">(initialGoal);
  const [cityId, setCityId] = useState(normalizeCityId(initialCity));
  const [result, setResult] = useState<PublicFeedingPreviewResponse | null>(null);
  const [research, setResearch] = useState<ResearchSpeciesDetail | null>(null);
  const [suggestions, setSuggestions] = useState<TaxonomySpeciesSuggestion[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<TaxonomySpeciesSuggestion | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    const keyword = speciesName.trim();
    setSelectedSpecies((current) => {
      if (!current) return current;
      const canonical = current.latin_name || current.name_zh || current.name;
      return canonical === keyword ? current : null;
    });

    // Skip search when keyword already matches the selected species
    const selectedCanonical =
      selectedSpecies && (selectedSpecies.latin_name || selectedSpecies.name_zh || selectedSpecies.name);
    if (keyword.length < 2 || keyword === selectedCanonical) {
      setSuggestions([]);
      setSuggesting(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setSuggesting(true);
    const timer = window.setTimeout(async () => {
      const results = await searchTaxonomySpecies(keyword);
      if (requestId === requestIdRef.current) {
        setSuggesting(false);
        // Auto-select on exact match when nothing is selected yet
        if (!selectedSpecies && results.length > 0) {
          const exactMatch = results.find(
            (r) => r.latin_name === keyword || r.name_zh === keyword || r.name === keyword,
          );
          if (exactMatch) {
            setSelectedSpecies(exactMatch);
            setSuggestions([]);
            return;
          }
        }
        setSuggestions(results);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [speciesName]);

  const runPreview = useCallback(async () => {
    const canonicalSpecies = (selectedSpecies?.latin_name || selectedSpecies?.name_zh || speciesName).trim();
    if (!canonicalSpecies) return;

    const city = getCity(cityId);
    setStatus("loading");
    setError("");
    setResult(null);
    setResearch(null);

    try {
      const preview = await submitPublicFeedingPreview({
        species_name: canonicalSpecies,
        current_water_temp: Number(waterTemp),
        age_months: Number(ageMonths),
        weight_g: Number(weight),
        target_goal: goal,
        lat: city.lat,
        lon: city.lon,
        timezone_offset: city.timezoneOffset,
      });
      setResult(preview);
      setStatus("success");

      const detail = await fetchResearchForSpecies(canonicalSpecies);
      setResearch(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy[lang].error);
      setStatus("error");
    }
  }, [ageMonths, cityId, goal, lang, selectedSpecies, speciesName, waterTemp, weight]);

  useEffect(() => {
    if (!autoSubmit || autoSubmitRef.current || !speciesName.trim()) return;
    autoSubmitRef.current = true;
    void runPreview();
  }, [autoSubmit, runPreview, speciesName]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const canonicalSpecies = (selectedSpecies?.latin_name || selectedSpecies?.name_zh || speciesName).trim();
    if (redirectOnSubmit) {
      const params = new URLSearchParams({
        calculate: "1",
        species: canonicalSpecies,
        temp: waterTemp,
        age: ageMonths,
        weight,
        goal,
        city: cityId,
      });
      router.push(`/${lang}/tools/feeding-strategy?${params.toString()}`);
      return;
    }

    await runPreview();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase text-emerald-700">{copy[lang].eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{copy[lang].title}</h2>
          {!compact && copy[lang].desc && <p className="mt-2 text-sm leading-6 text-slate-600">{copy[lang].desc}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm">
            {copy[lang].limitedBadge}
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <label className="relative grid gap-2 text-sm font-semibold text-slate-700">
          {copy[lang].species}
          <input
            value={speciesName}
            onChange={(event) => setSpeciesName(event.target.value)}
            required
            className="h-12 rounded-lg border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            placeholder={copy[lang].speciesPlaceholder}
          />
          {(suggestions.length > 0 || suggesting) && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {suggesting ? (
                <div className="px-4 py-3 text-sm font-semibold text-slate-500">{copy[lang].searching}</div>
              ) : (
                suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedSpecies(item);
                      setSpeciesName(item.latin_name || item.name_zh || item.name);
                      setSuggestions([]);
                    }}
                    className="block w-full px-4 py-3 text-left transition-colors hover:bg-emerald-50"
                  >
                    <span className="block text-sm font-bold text-slate-950">{displaySpeciesName(item, lang)}</span>
                    <span className="block text-xs italic text-slate-500">{item.latin_name || item.slug || "-"}</span>
                  </button>
                ))
              )}
            </div>
          )}
          {selectedSpecies && (
            <p className="text-xs font-semibold text-emerald-700">
              {copy[lang].selected} {displaySpeciesName(selectedSpecies, lang)}
            </p>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label={copy[lang].temp} value={waterTemp} onChange={setWaterTemp} min={0} max={45} suffix="°C" />
          <NumberField label={copy[lang].age} value={ageMonths} onChange={setAgeMonths} min={0} max={300} suffix={copy[lang].months} />
          <NumberField label={copy[lang].weight} value={weight} onChange={setWeight} min={1} max={300000} suffix="g" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            {copy[lang].city}
            <select
              value={cityId}
              onChange={(event) => setCityId(event.target.value)}
              className="h-12 rounded-lg border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {CITY_OPTIONS.map((city) => (
                <option key={city.id} value={city.id}>
                  {lang === "zh" ? city.nameZh : city.nameEn}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            {copy[lang].goal}
            <select
              value={goal}
              onChange={(event) => setGoal(event.target.value as typeof goal)}
              className="h-12 rounded-lg border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="健康日常">{copy[lang].goalDaily}</option>
              <option value="发色需求">{copy[lang].goalColor}</option>
              <option value="快速生长">{copy[lang].goalGrowth}</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="h-12 rounded-lg bg-emerald-700 px-5 text-base font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {status === "loading" ? copy[lang].loading : redirectOnSubmit ? copy[lang].submitToTool : copy[lang].submit}
        </button>
      </form>

      {status === "error" && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      )}

      {result && (
        <section className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              {result.status === "due" ? copy[lang].due : copy[lang].pending}
            </span>
            {result.effective_current_water_temp != null && (
              <span className="text-xs font-semibold text-emerald-900">
                {copy[lang].effectiveTemp} {result.effective_current_water_temp.toFixed(1)}°C
              </span>
            )}
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-950">{result.action || copy[lang].noAction}</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultItem label={copy[lang].frequency} value={result.frequency || "-"} />
            <ResultItem label={copy[lang].portion} value={result.portion_grams ? `${result.portion_grams.toFixed(1)}g` : "-"} />
            <ResultItem label={copy[lang].next} value={formatDate(result.next_feeding_at, lang)} />
          </dl>
          {result.diet_ratio && <p className="mt-4 text-sm leading-6 text-slate-700">{result.diet_ratio}</p>}
          {result.risk_notes.length > 0 && (
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
              {result.risk_notes.map((note, index) => (
                <li key={`${note}-${index}`} className="flex gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-base text-amber-600">warning</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-500">{copy[lang].appNote}</p>
        </section>
      )}

      {research && (
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-950">{copy[lang].evidence}</h3>
            <Link href={`/${lang}/research/species?q=${encodeURIComponent(speciesName)}`} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
              {copy[lang].moreEvidence}
            </Link>
          </div>
          <EvidenceList evidence={research.evidence} lang={lang} limit={3} />
        </section>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <span className="flex h-12 overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className="min-w-0 flex-1 px-4 text-base outline-none"
        />
        <span className="flex min-w-14 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500">
          {suffix}
        </span>
      </span>
    </label>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-slate-950">{value}</dd>
    </div>
  );
}

function formatDate(value: string | null | undefined, lang: Lang) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const copy = {
  zh: {
    eyebrow: "策略定制",
    title: "今天该怎么喂？",
    limitedBadge: "限时使用",
    desc: "",
    species: "物种",
    speciesPlaceholder: "例如：中华草龟 / Mauremys reevesii",
    temp: "当前水温",
    age: "年龄",
    months: "月",
    weight: "体重",
    city: "城市",
    goal: "饲养目标",
    goalDaily: "健康日常",
    goalColor: "发色需求",
    goalGrowth: "快速生长",
    submit: "查看结果",
    submitToTool: "进入策略页查看结果",
    loading: "计算中...",
    error: "计算失败，请稍后再试。",
    due: "可以安排喂食",
    pending: "还不到时间",
    effectiveTemp: "参与计算的水温",
    noAction: "已生成建议",
    frequency: "喂食频次",
    portion: "单次量",
    next: "下次建议时间",
    appNote: "App 可保存档案、记录喂食、提醒下次投喂，并随体重和季节刷新策略。",
    evidence: "这条建议参考了哪些资料",
    moreEvidence: "查看完整依据",
    searching: "正在匹配物种...",
    selected: "已匹配到：",
  },
  en: {
    eyebrow: "Public estimate",
    title: "Turtle Feeding Strategy Calculator",
    limitedBadge: "Limited-time access",
    desc: "Enter species, water temperature, age, and weight for a one-off feeding estimate.",
    species: "Species",
    speciesPlaceholder: "Example: Mauremys reevesii",
    temp: "Water temp",
    age: "Age",
    months: "mo",
    weight: "Weight",
    city: "City",
    goal: "Goal",
    goalDaily: "Daily health",
    goalColor: "Color support",
    goalGrowth: "Growth",
    submit: "Calculate",
    submitToTool: "Open result page",
    loading: "Calculating...",
    error: "Calculation failed. Please try again.",
    due: "Feeding can be assessed",
    pending: "Pending",
    effectiveTemp: "Effective temp",
    noAction: "Recommendation ready",
    frequency: "Frequency",
    portion: "Portion",
    next: "Next time",
    appNote: "The app saves profiles, logs feeding, sends reminders, and refreshes strategies as weight and seasons change.",
    evidence: "Related evidence",
    moreEvidence: "More",
    searching: "Searching species...",
    selected: "Matched species:",
  },
};

const DEFAULT_CITY_ID = "shanghai";
const CITY_OPTIONS = [
  { id: "shanghai", nameZh: "上海", nameEn: "Shanghai", lat: 31.23, lon: 121.47, timezoneOffset: 480 },
  { id: "beijing", nameZh: "北京", nameEn: "Beijing", lat: 39.9, lon: 116.41, timezoneOffset: 480 },
  { id: "guangzhou", nameZh: "广州", nameEn: "Guangzhou", lat: 23.13, lon: 113.26, timezoneOffset: 480 },
  { id: "shenzhen", nameZh: "深圳", nameEn: "Shenzhen", lat: 22.54, lon: 114.06, timezoneOffset: 480 },
  { id: "hangzhou", nameZh: "杭州", nameEn: "Hangzhou", lat: 30.27, lon: 120.15, timezoneOffset: 480 },
  { id: "chengdu", nameZh: "成都", nameEn: "Chengdu", lat: 30.67, lon: 104.06, timezoneOffset: 480 },
  { id: "wuhan", nameZh: "武汉", nameEn: "Wuhan", lat: 30.59, lon: 114.3, timezoneOffset: 480 },
  { id: "nanjing", nameZh: "南京", nameEn: "Nanjing", lat: 32.06, lon: 118.8, timezoneOffset: 480 },
  { id: "xian", nameZh: "西安", nameEn: "Xi'an", lat: 34.34, lon: 108.94, timezoneOffset: 480 },
  { id: "chongqing", nameZh: "重庆", nameEn: "Chongqing", lat: 29.56, lon: 106.55, timezoneOffset: 480 },
] as const;

function normalizeCityId(value: string) {
  return CITY_OPTIONS.some((city) => city.id === value) ? value : DEFAULT_CITY_ID;
}

function getCity(value: string) {
  return CITY_OPTIONS.find((city) => city.id === value) || CITY_OPTIONS[0];
}

function displaySpeciesName(item: TaxonomySpeciesSuggestion, lang: Lang) {
  if (lang === "zh") {
    return item.name_zh || item.name || item.latin_name || "-";
  }
  return item.name_en || item.english_name || item.latin_name || item.name || "-";
}
