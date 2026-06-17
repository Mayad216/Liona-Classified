export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        accent ? "border-brand-200 bg-brand-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${accent ? "text-brand-600" : "text-slate-400"}`} />
      </div>
      <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-emerald-600">{change}</div>
    </div>
  );
}
