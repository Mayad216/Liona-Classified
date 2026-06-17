import { useState } from "react";
import { Building2, MapPin, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { LocationSelectField } from "@/components/match/LocationSelectField";
import type { RoommateProfile } from "@/lib/matchmaking/types";
import {
  formatLocationPreference,
  type LocationPreference,
} from "@/lib/matchmaking/uaeLocations";
import { cn } from "@/lib/utils";

interface Props {
  profile: RoommateProfile;
  onChange: (patch: Partial<RoommateProfile>) => void;
  compact?: boolean;
}

function TextTagList({
  label,
  hint,
  placeholder,
  values,
  onChange,
  compact,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  values: string[];
  onChange: (next: string[]) => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const next = draft.trim();
    if (!next) return;
    if (values.some((v) => v.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, next]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <label className={cn("block font-medium text-slate-700", compact ? "text-xs" : "text-sm")}>
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          icon={<Building2 className="h-4 w-4" />}
        />
        <button
          type="button"
          onClick={addValue}
          disabled={!draft.trim()}
          className={cn(
            "inline-flex flex-shrink-0 items-center gap-1 rounded-xl border px-3 text-sm font-semibold transition",
            draft.trim()
              ? "border-brand-200 bg-brand-50 text-brand-800 hover:border-brand-300"
              : "cursor-not-allowed border-slate-200 text-slate-400"
          )}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {values.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li key={value}>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                {value}
                <button
                  type="button"
                  onClick={() => onChange(values.filter((v) => v !== value))}
                  className="rounded-full p-0.5 hover:bg-slate-200"
                  aria-label={`Remove ${value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-slate-500">None added yet — optional.</p>
      )}
    </div>
  );
}

export function ResidenceHistoryFields({ profile, onChange, compact = false }: Props) {
  return (
    <div
      className={cn(
        "space-y-6",
        !compact && "rounded-2xl border border-slate-200 bg-slate-50/40 p-5 sm:p-6"
      )}
    >
      {!compact && (
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
            <MapPin className="h-5 w-5 text-brand-600" />
            Where you live &amp; have lived
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Optional — helps roommates understand your familiarity with different areas and
            buildings across the UAE. Required to post neighborhood or building reviews on
            area guides. We&apos;ll notify you to leave a review if you want.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <p className={cn("font-medium text-slate-800", compact ? "text-xs" : "text-sm")}>
          Current neighborhood
        </p>
        <LocationSelectField
          compact={compact}
          maxItems={1}
          addLabel="Set current neighborhood"
          emptyLabel="No current neighborhood selected — optional."
          hint="Pick the emirate and neighborhood where you live now."
          value={profile.currentNeighborhood ? [profile.currentNeighborhood] : null}
          onChange={(value) => {
            const next = value?.[0];
            onChange({ currentNeighborhood: next });
          }}
        />
        {profile.currentNeighborhood && !compact && (
          <p className="text-xs text-slate-500">
            Currently in {formatLocationPreference(profile.currentNeighborhood)}.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <p className={cn("font-medium text-slate-800", compact ? "text-xs" : "text-sm")}>
          Neighborhoods you&apos;ve lived in before
        </p>
        <LocationSelectField
          compact={compact}
          hint="Add every area you've lived in previously — emirate and neighborhood."
          value={profile.previousNeighborhoods ?? null}
          onChange={(value) => {
            onChange({
              previousNeighborhoods:
                value && value.length > 0 ? (value as LocationPreference[]) : undefined,
            });
          }}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Current building / tower"
          hint="Optional — e.g. Marina Pinnacle, Princess Tower"
          placeholder="Building or tower name"
          value={profile.currentBuilding ?? ""}
          onChange={(e) =>
            onChange({ currentBuilding: e.target.value.trim() || undefined })
          }
          icon={<Building2 className="h-4 w-4" />}
        />

        <TextTagList
          compact={compact}
          label="Buildings / towers you've lived in before"
          hint="Press Enter or Add after each name."
          placeholder="e.g. Torch Tower, Ocean Heights"
          values={profile.previousBuildings ?? []}
          onChange={(previousBuildings) =>
            onChange({ previousBuildings: previousBuildings.length ? previousBuildings : undefined })
          }
        />
      </div>
    </div>
  );
}
