import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
};

export function StarScoreField({ label, value, onChange, compact = false }: Props) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label}: ${n} stars`}
            onClick={() => onChange(n)}
            className={cn(
              compact ? "h-8 flex-1 text-xs" : "h-9 flex-1 text-sm",
              "rounded-lg border font-semibold transition",
              value === n
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
            )}
          >
            {n}★
          </button>
        ))}
      </div>
    </div>
  );
}
