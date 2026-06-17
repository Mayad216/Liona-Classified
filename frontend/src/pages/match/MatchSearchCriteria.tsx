import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Filter, ShieldAlert, Sparkles } from "lucide-react";
import { CATEGORIES, DIMENSIONS } from "@/lib/matchmaking/config";
import type { Category } from "@/lib/matchmaking/types";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { DimensionField } from "@/components/match/DimensionField";
import { DealbreakerToggle } from "@/components/match/DealbreakerToggle";
import { ProfileBasicsFields } from "@/components/match/ProfileBasicsFields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Search filters for "looking for a roommate" — separate from the user's own profile. */
export function MatchSearchCriteria() {
  const {
    profile,
    activeSearchPreset,
    updateActiveSearchPreset,
    setActivePresetLookingFor,
    toggleActivePresetDealbreaker,
    isActivePresetDealbreaker,
    applySuggestedDealbreakers,
    clearDealbreakers,
    searchCompleteness,
    basicsComplete,
  } = useMatchProfile();
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const order = Object.keys(CATEGORIES) as Category[];
    return order
      .map((cat) => ({
        category: cat,
        meta: CATEGORIES[cat],
        dims: DIMENSIONS.filter((d) => d.category === cat),
      }))
      .filter((g) => g.dims.length > 0);
  }, []);

  const [activeIdx, setActiveIdx] = useState(0);
  const [showDealbreakers, setShowDealbreakers] = useState(false);
  const active = groups[activeIdx];
  const dealbreakerCount = (activeSearchPreset.dealbreakers ?? []).length;
  const criteria = activeSearchPreset.lookingFor ?? {};

  const c = searchCompleteness();
  const groupComplete = (cat: Category) => {
    const dims = DIMENSIONS.filter((d) => d.category === cat && !d.optional);
    if (dims.length === 0) return 1;
    const answered = dims.filter((d) => {
      const v = criteria[d.key];
      return v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true);
    }).length;
    return answered / dims.length;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-20 pt-8">
      <div className="container max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <Link
            to="/match/seeker"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Search filters {Math.round(c * 100)}% set
          </span>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-700">
              <Filter className="h-3.5 w-3.5" />
              Roommate search
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What you&apos;re looking for
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              These are your <strong>search filters</strong> — they decide who shows up in your
              matches. Your own lifestyle profile is edited separately and only shared if you opt
              in.
            </p>
          </div>

          <div className="mt-6">
            <ProfileBasicsFields
              profile={{
                ...profile,
                monthlyBudgetAed:
                  activeSearchPreset.monthlyBudgetAed ?? profile.monthlyBudgetAed,
                moveInDate: activeSearchPreset.moveInDate ?? profile.moveInDate,
                leaseDuration: activeSearchPreset.leaseDuration ?? profile.leaseDuration,
              }}
              onChange={(patch) => updateActiveSearchPreset(patch)}
            />
            {!basicsComplete() && (
              <p className="mt-3 text-xs font-medium text-amber-700">
                Add your monthly budget and move-in date for relevant matches.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/80 to-white p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setShowDealbreakers(!showDealbreakers)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    Deal-breakers ({dealbreakerCount})
                  </p>
                  <p className="text-xs text-slate-600">
                    Non-negotiable filters — mismatches are hidden unless compatibility is 85%+
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-brand-700">
                {showDealbreakers ? "Hide" : "Manage all"}
              </span>
            </button>

            {showDealbreakers && (
              <div className="mt-4 border-t border-red-100 pt-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={applySuggestedDealbreakers}>
                    Suggested defaults
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearDealbreakers}>
                    Clear all
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DIMENSIONS.map((dim) => (
                    <label
                      key={dim.key}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition",
                        isActivePresetDealbreaker(dim.key)
                          ? "border-red-200 bg-red-50/60"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {dim.icon && <span className="mr-1">{dim.icon}</span>}
                        {dim.label}
                      </span>
                      <DealbreakerToggle
                        active={isActivePresetDealbreaker(dim.key)}
                        onChange={() => toggleActivePresetDealbreaker(dim.key)}
                        compact
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 -mx-1 flex gap-1 overflow-x-auto scrollbar-none">
            {groups.map((g, i) => {
              const done = groupComplete(g.category);
              const isActive = i === activeIdx;
              return (
                <button
                  key={g.category}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                    isActive
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  )}
                >
                  <span aria-hidden>{g.meta.icon}</span>
                  {g.meta.label}
                  {done === 1 && (
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5",
                        isActive ? "text-white" : "text-emerald-500"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-7">
            {active.dims.map((dim) => {
              const v = criteria[dim.key];
              const breaker = isActivePresetDealbreaker(dim.key);
              return (
                <div
                  key={dim.key}
                  className={cn(
                    "rounded-xl border p-4 transition",
                    breaker ? "border-red-100 bg-red-50/30" : "border-transparent"
                  )}
                >
                  <div className="mb-2.5 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <label className="inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                        {dim.icon && <span aria-hidden>{dim.icon}</span>}
                        {dim.label}
                        {dim.optional && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Optional
                          </span>
                        )}
                      </label>
                      {dim.description && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          What you want in a roommate — {dim.description.toLowerCase()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <DealbreakerToggle
                        active={breaker}
                        onChange={() => toggleActivePresetDealbreaker(dim.key)}
                      />
                      {v != null && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                  </div>
                  <DimensionField
                    dimension={dim}
                    value={v}
                    onChange={(value) => setActivePresetLookingFor(dim.key, value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button
              variant="ghost"
              onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
              disabled={activeIdx === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            {activeIdx < groups.length - 1 ? (
              <Button onClick={() => setActiveIdx(activeIdx + 1)}>
                Next category
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/match/seeker")}>
                <Sparkles className="h-4 w-4" />
                See my matches
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
