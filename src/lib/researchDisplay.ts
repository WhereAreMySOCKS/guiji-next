import type { Lang } from "./taxonomySlug";

type PublicDomain = {
  key: string;
  zh: string;
  en: string;
  zhDesc: string;
  enDesc: string;
  patterns: string[];
};

const domains: PublicDomain[] = [
  {
    key: "temperature",
    zh: "温度与季节",
    en: "Temperature and season",
    zhDesc: "涉及活动温度、季节变化或低温期判断，可用于把建议调得更保守。",
    enDesc: "Covers activity temperature, seasonal changes, or cool-period signals for conservative care decisions.",
    patterns: ["temp", "temperature", "thermal", "season", "month", "brumation", "hibernation", "winter", "cool"],
  },
  {
    key: "feeding",
    zh: "食性与喂食",
    en: "Diet and feeding",
    zhDesc: "涉及食性、喂食节奏或营养结构，用于判断建议是否贴近物种习性。",
    enDesc: "Covers diet, feeding rhythm, or nutrition structure for species-aligned recommendations.",
    patterns: ["diet", "food", "feeding", "feed", "protein", "plant", "animal", "prey", "nutrition"],
  },
  {
    key: "growth",
    zh: "体型与生长",
    en: "Body size and growth",
    zhDesc: "涉及体重、体长或生长阶段，用于避免把幼体和成体按同一节奏处理。",
    enDesc: "Covers body mass, size, or growth stage so juveniles and adults are not treated alike.",
    patterns: ["weight", "length", "size", "growth", "mass", "juvenile", "adult", "age"],
  },
  {
    key: "reproduction",
    zh: "繁殖与筑巢",
    en: "Reproduction and nesting",
    zhDesc: "涉及繁殖季、产卵、巢址或卵的观测，主要作为生命周期背景参考。",
    enDesc: "Covers breeding season, eggs, nest sites, or nesting observations as lifecycle context.",
    patterns: ["egg", "clutch", "nest", "nesting", "reproduction", "breed", "breeding", "incubation", "hatch"],
  },
  {
    key: "habitat",
    zh: "栖息环境",
    en: "Habitat context",
    zhDesc: "涉及水域、陆地、晒背、湿度或环境选择，用于校准饲养场景。",
    enDesc: "Covers aquatic, terrestrial, basking, humidity, or habitat-use context for captive setup decisions.",
    patterns: ["habitat", "water", "aquatic", "terrestrial", "basking", "uv", "humidity", "depth", "substrate", "nest_depth"],
  },
  {
    key: "taxonomy",
    zh: "分类与分布",
    en: "Taxonomy and range",
    zhDesc: "涉及学名、同物异名、分布或保护状态，用于确认物种身份和背景。",
    enDesc: "Covers names, synonyms, distribution, or conservation context for species identity checks.",
    patterns: ["taxonomy", "taxon", "synonym", "distribution", "range", "iucn", "cites", "conservation"],
  },
  {
    key: "health",
    zh: "健康与风险",
    en: "Health and risk",
    zhDesc: "涉及疾病、应激或安全边界，用于提示风险而不是给出诊疗结论。",
    enDesc: "Covers disease, stress, or safety margins for risk prompts rather than clinical conclusions.",
    patterns: ["health", "disease", "risk", "stress", "mortality", "clinical", "vet"],
  },
];

export function publicResearchDomains(values: Array<string | null | undefined>, lang: Lang) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  const matched = domains.filter((domain) => domain.patterns.some((pattern) => text.includes(pattern)));
  const selected = matched.length > 0 ? matched : [fallbackDomain];

  return selected.map((domain) => ({
    key: domain.key,
    label: lang === "zh" ? domain.zh : domain.en,
    desc: lang === "zh" ? domain.zhDesc : domain.enDesc,
  }));
}

export function publicEvidenceSummary(values: Array<string | null | undefined>, lang: Lang) {
  const [primary] = publicResearchDomains(values, lang);
  return primary.desc;
}

const fallbackDomain: PublicDomain = {
  key: "care-context",
  zh: "饲养背景",
  en: "Care context",
  zhDesc: "涉及物种饲养背景或自然史信息，用于辅助判断而非直接公开内部参数。",
  enDesc: "Covers species care context or natural-history information without exposing internal parameters.",
  patterns: [],
};
