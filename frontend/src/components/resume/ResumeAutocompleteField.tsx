import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldSuggestions } from "@/lib/resume/useFieldSuggestions";
import type { ResumeAutocompleteField } from "@/lib/resume/suggestions";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fieldType: ResumeAutocompleteField;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ResumeAutocompleteField({
  label,
  value,
  onChange,
  fieldType,
  placeholder,
  disabled = false,
  className,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { suggestions, aiSuggestions, loading } = useFieldSuggestions(fieldType, value, open);

  const showDropdown = open && !disabled && (suggestions.length > 0 || loading);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, suggestions.length]);

  const aiSet = useMemo(
    () => new Set(aiSuggestions.map((s) => s.toLowerCase())),
    [aiSuggestions]
  );

  function pick(suggestion: string) {
    onChange(suggestion);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") setOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label htmlFor={listId} className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={listId}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={`${listId}-listbox`}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/15 disabled:cursor-not-allowed disabled:bg-slate-50"
      />

      {showDropdown && (
        <div
          id={`${listId}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {loading && suggestions.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00a67e]" />
              Finding suggestions…
            </div>
          )}

          {suggestions.map((item, index) => {
            const fromAi = aiSet.has(item.toLowerCase());
            const active = index === activeIndex;
            return (
              <button
                key={`${item}-${index}`}
                type="button"
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pick(item)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
                  active ? "bg-[#00a67e]/10 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item}</span>
                {fromAi && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-[#00a67e]">
                    <Sparkles className="h-3 w-3" />
                    AI
                  </span>
                )}
              </button>
            );
          })}

          <p className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400">
            Pick a suggestion or keep typing your own
          </p>
        </div>
      )}
    </div>
  );
}
