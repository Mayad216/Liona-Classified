import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Filter, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, DIMENSIONS } from "@/lib/matchmaking/config";
import type { Category } from "@/lib/matchmaking/types";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { DimensionField } from "@/components/match/DimensionField";
import { DealbreakerToggle } from "@/components/match/DealbreakerToggle";
import { ProfileBasicsFields } from "@/components/match/ProfileBasicsFields";
import { cn } from "@/lib/utils";

interface Props {
  minScore: number;
  onMinScoreChange: (value: number) => void;
  className?: string;
}

export function MatchSearchSidebar({ minScore, onMinScoreChange, className }: Props) {
  const {
    profile,
    activeSearchPreset,
    setActiveSearchPreset,
    updateActiveSearchPreset,
    setActivePresetLookingFor,
    toggleActivePresetDealbreaker,
    isActivePresetDealbreaker,
  } = useMatchProfile();

  const presets = profile.searchPresets ?? [];
  const criteria = activeSearchPreset.lookingFor ?? {};
  const [openCategory, setOpenCategory] = useState<Category | null>("logistics");
  const dealbreakerCount = (activeSearchPreset.dealbreakers ?? []).length;

  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
            <Filter className="h-4 w-4 text-brand-600" />
            Search filters
          </h2>
          <Link
            to="/match/search"
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Full editor
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const active = preset.id === profile.activeSearchPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setActiveSearchPreset(preset.id);
                  if (preset.minScore != null) onMinScoreChange(preset.minScore);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  active
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                )}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
        {dealbreakerCount > 0 && (
          <p className="mt-2 text-[11px] font-medium text-red-700">
            {dealbreakerCount} deal-breaker{dealbreakerCount !== 1 ? "s" : ""} active in this
            preset
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <label className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Min compatibility</span>
            <span className="font-bold tabular-nums text-slate-900">{minScore}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(e) => {
              const value = Number(e.target.value);
              onMinScoreChange(value);
              updateActiveSearchPreset({ minScore: value });
            }}
            className="w-full accent-brand-600"
          />
        </div>

        <ProfileBasicsFields
          compact
          profile={{
            ...profile,
            monthlyBudgetAed: activeSearchPreset.monthlyBudgetAed ?? profile.monthlyBudgetAed,
            moveInDate: activeSearchPreset.moveInDate ?? profile.moveInDate,
            leaseDuration: activeSearchPreset.leaseDuration ?? profile.leaseDuration,
          }}
          onChange={(patch) => updateActiveSearchPreset(patch)}
        />

        <div className="mt-4 space-y-2">
          {(Object.keys(CATEGORIES) as Category[]).map((cat) => {
            const dims = DIMENSIONS.filter((d) => d.category === cat);
            if (dims.length === 0) return null;
            const isOpen = openCategory === cat;

            return (
              <div key={cat} className="rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : cat)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-slate-800"
                >
                  <span>
                    {CATEGORIES[cat].icon} {CATEGORIES[cat].label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-slate-100 px-3 py-3">
                    {dims.map((dim) => {
                      const breaker = isActivePresetDealbreaker(dim.key);
                      return (
                        <div
                          key={dim.key}
                          className={cn(
                            "rounded-lg p-2 transition",
                            breaker && "border border-red-100 bg-red-50/40",
                            dim.key === "preferred_locations" && "relative z-10"
                          )}
                        >
                          <div className="mb-1.5 flex items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 text-xs font-medium text-slate-600">
                              {dim.icon && <span className="mr-1">{dim.icon}</span>}
                              {dim.label}
                            </p>
                            <DealbreakerToggle
                              active={breaker}
                              onChange={() => toggleActivePresetDealbreaker(dim.key)}
                              compact
                            />
                          </div>
                          <DimensionField
                            compact
                            dimension={dim}
                            value={criteria[dim.key]}
                            onChange={(value) => setActivePresetLookingFor(dim.key, value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        <Link
          to="/match/profile"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Edit my profile
        </Link>
      </div>
    </aside>
  );
}
