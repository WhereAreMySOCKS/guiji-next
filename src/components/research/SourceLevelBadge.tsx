export default function SourceLevelBadge({ level }: { level?: string | null }) {
  const key = level || "unknown";
  const style = styles[key] || styles.unknown;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>
      {labels[key] || key}
    </span>
  );
}

const labels: Record<string, string> = {
  L1: "L1 权威库",
  L2: "L2 论文",
  L3: "L3 指南",
  research_extra: "扩展来源",
  unknown: "未知",
};

const styles: Record<string, string> = {
  L1: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  L2: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  L3: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  research_extra: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  unknown: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};
