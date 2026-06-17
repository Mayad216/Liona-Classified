import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = {
  label: string;
  hint?: string;
  options: readonly Option[] | Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({
  label,
  hint,
  options,
  value,
  onChange,
  placeholder = "Select options…",
}: Props) {
  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  }

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {hint ? <p className="mb-2 text-xs text-slate-500">{hint}</p> : null}
      <details className="group relative">
        <summary
          className={cn(
            "flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm",
            "transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          )}
        >
          <span className={selectedLabels.length ? "text-slate-900" : "text-slate-400"}>
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          <span className="text-slate-400 group-open:rotate-180">▾</span>
        </summary>
        <div className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
                checked={value.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
