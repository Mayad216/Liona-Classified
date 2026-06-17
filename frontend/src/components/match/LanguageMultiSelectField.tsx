import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { filterWorldLanguages, WORLD_LANGUAGES } from "@/lib/matchmaking/worldLanguages";
import { cn } from "@/lib/utils";

interface Props {
  value: unknown;
  onChange: (value: unknown) => void;
  maxSelectable?: number;
}

export function LanguageMultiSelectField({ value, onChange, maxSelectable }: Props) {
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState("");

  const atLimit = maxSelectable != null && selected.length >= maxSelectable;

  const options = useMemo(
    () => filterWorldLanguages(query, selected),
    [query, selected]
  );

  function addLanguage(lang: string) {
    if (!lang || selected.includes(lang) || atLimit) return;
    onChange([...selected, lang]);
    setPick("");
    setQuery("");
  }

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800"
            >
              {lang}
              <button
                type="button"
                onClick={() => onChange(selected.filter((l) => l !== lang))}
                className="rounded-full p-0.5 text-brand-600 hover:bg-brand-100 hover:text-brand-800"
                aria-label={`Remove ${lang}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search languages…"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          disabled={atLimit}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          disabled={atLimit || options.length === 0}
          className={cn(
            "h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none",
            "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
            (atLimit || options.length === 0) && "cursor-not-allowed opacity-60"
          )}
        >
          <option value="">
            {atLimit
              ? "Maximum languages selected"
              : options.length === 0
                ? "No languages match your search"
                : "Choose a language…"}
          </option>
          {options.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          className="sm:px-5"
          disabled={!pick || atLimit}
          onClick={() => addLanguage(pick)}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        {maxSelectable != null
          ? `Selected ${selected.length}/${maxSelectable} languages.`
          : `${WORLD_LANGUAGES.length} languages available — search, then add from the dropdown.`}
      </p>
    </div>
  );
}
