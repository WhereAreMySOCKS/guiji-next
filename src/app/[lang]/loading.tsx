export default function LangLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined animate-spin text-4xl text-emerald-500">autorenew</span>
        <span className="text-sm font-medium text-slate-500">Loading...</span>
      </div>
    </div>
  );
}
