import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import {
  UAE_EMIRATES,
  areasForEmirate,
  formatLocationPreference,
  loadUaeAreasByEmirate,
  locationKey,
  normalizeLocationPreferences,
  type LocationPreference,
} from "@/lib/matchmaking/uaeLocations";
import { cn } from "@/lib/utils";

interface Props {
  value: unknown;
  onChange: (value: LocationPreference[] | null) => void;
  compact?: boolean;
  hint?: string;
  /** When set to 1, only one location can be stored (e.g. current neighborhood). */
  maxItems?: number;
  addLabel?: string;
  emptyLabel?: string;
}

export function LocationSelectField({
  value,
  onChange,
  compact = false,
  hint,
  maxItems,
  addLabel = "Add location",
  emptyLabel = "No locations selected — searching all emirates.",
}: Props) {
  const selected = useMemo(() => normalizeLocationPreferences(value), [value]);
  const [emirate, setEmirate] = useState("");
  const [area, setArea] = useState("");
  const [areasVersion, setAreasVersion] = useState(0);

  useEffect(() => {
    void loadUaeAreasByEmirate().then(() => setAreasVersion((v) => v + 1));
  }, []);

  const areaOptions = useMemo(
    () => areasForEmirate(emirate),
    [emirate, areasVersion]
  );

  const areaSelectOptions = useMemo(
    () => [
      {
        value: "",
        label: emirate ? "Any area in emirate" : "Select emirate first",
      },
      ...areaOptions.map((a) => ({ value: a, label: a })),
    ],
    [areaOptions, emirate]
  );

  function commit(next: LocationPreference[]) {
    onChange(next.length > 0 ? next : null);
  }

  function addLocation() {
    if (!emirate) return;
    const next: LocationPreference = area ? { emirate, area } : { emirate };
    const key = locationKey(next);
    if (maxItems === 1) {
      commit([next]);
      setArea("");
      return;
    }
    if (selected.some((loc) => locationKey(loc) === key)) {
      setArea("");
      return;
    }
    if (maxItems != null && selected.length >= maxItems) return;
    commit([...selected, next]);
    setArea("");
  }

  function removeLocation(key: string) {
    commit(selected.filter((loc) => locationKey(loc) !== key));
  }

  const labelClass = compact
    ? "mb-1.5 block text-xs font-medium text-slate-600"
    : "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {!compact && hint && <p className="text-xs text-slate-500">{hint}</p>}

      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor="locationEmirate" className={labelClass}>
            Emirate
          </label>
          <Select
            id="locationEmirate"
            name="locationEmirate"
            value={emirate}
            onChange={(e) => {
              setEmirate(e.target.value);
              setArea("");
            }}
            options={[
              { value: "", label: "Select emirate" },
              ...UAE_EMIRATES.map((e) => ({ value: e, label: e })),
            ]}
          />
        </div>

        <div>
          <label htmlFor="locationArea" className={labelClass}>
            Area / neighborhood (optional)
          </label>
          {emirate ? (
            <Select
              key={emirate}
              id="locationArea"
              name="locationArea"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              options={areaSelectOptions}
            />
          ) : (
            <Select
              id="locationArea"
              name="locationArea"
              value=""
              disabled
              options={[{ value: "", label: "Select emirate first" }]}
            />
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!emirate}
        onClick={addLocation}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-semibold transition",
          compact
            ? "border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-100"
            : "border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm text-brand-800 hover:border-brand-300 hover:bg-brand-100",
          !emirate && "cursor-not-allowed opacity-40 hover:border-slate-200 hover:bg-slate-50"
        )}
      >
        <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {addLabel}
      </button>

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((loc) => {
            const key = locationKey(loc);
            return (
              <li key={key}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border font-medium",
                    compact
                      ? "border-brand-600 bg-brand-600 px-2.5 py-1 text-[11px] text-white shadow-sm"
                      : "border-brand-600 bg-brand-600 px-3 py-1 text-xs text-white shadow-sm shadow-brand-600/20"
                  )}
                >
                  {formatLocationPreference(loc)}
                  <button
                    type="button"
                    onClick={() => removeLocation(key)}
                    className="rounded-full p-0.5 hover:bg-white/20"
                    aria-label={`Remove ${formatLocationPreference(loc)}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[11px] text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}
