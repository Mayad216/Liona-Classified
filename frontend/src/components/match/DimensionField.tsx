import { cn } from "@/lib/utils";
import type { Dimension } from "@/lib/matchmaking/types";
import { LanguageMultiSelectField } from "@/components/match/LanguageMultiSelectField";
import { LocationSelectField } from "@/components/match/LocationSelectField";

interface Props {
  dimension: Dimension;
  value: unknown;
  onChange: (value: unknown) => void;
  compact?: boolean;
}

/**
 * Renders the correct input for any dimension type defined in config.ts.
 * Adding a new dimension type? Add a `case` here.
 */
export function DimensionField({ dimension, value, onChange, compact = false }: Props) {
  const { type } = dimension;

  switch (type.kind) {
    case "enum":
      return (
        <div className="flex flex-wrap gap-2">
          {type.options.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(active ? null : opt)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/20"
                    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    case "multi-select": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      const max = type.maxSelectable;
      return (
        <div>
          <div className="flex flex-wrap gap-2">
            {type.options.map((opt) => {
              const active = selected.includes(opt);
              const disabled = !active && max != null && selected.length >= max;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const next = active
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    onChange(next);
                  }}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                    active
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/20"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {max && (
            <p className="mt-2 text-xs text-slate-500">
              Pick up to {max}. Selected {selected.length}/{max}.
            </p>
          )}
        </div>
      );
    }

    case "language-multi-select":
      return (
        <LanguageMultiSelectField
          value={value}
          onChange={onChange}
          maxSelectable={type.maxSelectable}
        />
      );

    case "location-select":
      return (
        <LocationSelectField
          compact={compact}
          value={value}
          onChange={onChange}
          hint={
            compact
              ? undefined
              : "Leave empty to include all emirates. Pick an emirate and optionally a neighborhood."
          }
        />
      );

    case "scale": {
      const v = typeof value === "number" ? value : Math.round((type.min + type.max) / 2);
      const range = type.max - type.min;
      return (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{type.labelLow}</span>
            <span className="font-semibold text-slate-900">{v}</span>
            <span>{type.labelHigh}</span>
          </div>
          <input
            type="range"
            min={type.min}
            max={type.max}
            step={1}
            value={v}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${range + 1}, 1fr)` }}>
            {Array.from({ length: range + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(type.min + i)}
                className={cn(
                  "h-1.5 rounded-full transition",
                  type.min + i <= v ? "bg-brand-500" : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>
      );
    }

    case "boolean":
      return (
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {[true, false].map((b) => {
            const active = value === b;
            return (
              <button
                key={String(b)}
                type="button"
                onClick={() => onChange(b)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition",
                  active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                )}
              >
                {b
                  ? (type.labelTrue ?? "Yes")
                  : (type.labelFalse ?? "No")}
              </button>
            );
          })}
        </div>
      );

    case "range": {
      const v =
        Array.isArray(value) && value.length === 2
          ? (value as [number, number])
          : [type.min, type.max];
      const step = type.step ?? 1;
      return (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Min</span>
            <span className="font-semibold text-slate-900">
              {v[0]} – {v[1]}
              {type.unit ? ` ${type.unit}` : ""}
            </span>
            <span>Max</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={type.min}
              max={v[1]}
              step={step}
              value={v[0]}
              onChange={(e) => onChange([Number(e.target.value), v[1]])}
              className="h-10 w-20 rounded-lg border border-slate-200 px-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <div className="flex-1 h-1 rounded-full bg-slate-200" />
            <input
              type="number"
              min={v[0]}
              max={type.max}
              step={step}
              value={v[1]}
              onChange={(e) => onChange([v[0], Number(e.target.value)])}
              className="h-10 w-20 rounded-lg border border-slate-200 px-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      );
    }
  }
}
