import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle2, Sparkles, UserRound } from "lucide-react";
import { CATEGORIES, DIMENSIONS, GENDER_OPTIONS } from "@/lib/matchmaking/config";
import type { Category, Gender } from "@/lib/matchmaking/types";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { DimensionField } from "@/components/match/DimensionField";
import { ResidenceHistoryFields } from "@/components/match/ResidenceHistoryFields";
import { ProfileVisibilityToggle } from "@/components/match/ProfileVisibilityToggle";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ProfileBuilder() {
  const {
    profile,
    updateProfile,
    setPreference,
    setDiscoverable,
    profileCompleteness,
    saving,
  } = useMatchProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get("onboarding") === "1";

  const groups = useMemo(() => {
    const order = Object.keys(CATEGORIES) as Category[];
    return order
      .map((cat) => ({
        category: cat,
        meta: CATEGORIES[cat],
        dims: DIMENSIONS.filter((d) => d.category === cat && !d.searchOnly),
      }))
      .filter((g) => g.dims.length > 0);
  }, []);

  const [activeIdx, setActiveIdx] = useState(0);
  const active = groups[activeIdx];

  const c = profileCompleteness();
  const groupComplete = (cat: Category) => {
    const dims = DIMENSIONS.filter((d) => d.category === cat && !d.optional);
    if (dims.length === 0) return 1;
    const answered = dims.filter((d) => {
      const v = profile.preferences[d.key];
      return v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true);
    }).length;
    return answered / dims.length;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-20 pt-8">
      <div className="container max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <Link
            to={onboarding ? "/dashboard" : "/match/seeker"}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Profile {Math.round(c * 100)}% complete
            {saving ? " · saving…" : ""}
          </span>
        </header>

        {onboarding && (
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
            <p className="text-sm font-semibold text-brand-900">Welcome — set up your roommate profile</p>
            <p className="mt-1 text-sm text-brand-800">
              Tell us how you live. You can set search filters and visibility anytime from Match Me.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              My roommate profile
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Tell us how you live
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              This describes <strong>you</strong> — not what you&apos;re looking for. Search filters
              are edited separately. Only people who opt in can be found by others.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Input
              type="number"
              name="age"
              label="Age"
              min={18}
              max={90}
              placeholder="e.g. 27"
              value={profile.age ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                updateProfile({ age: raw === "" ? undefined : Number(raw) });
              }}
              icon={<UserRound className="h-4 w-4" />}
            />
            <Select
              name="gender"
              label="Your gender"
              value={profile.gender ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                updateProfile({ gender: value ? (value as Gender) : undefined });
              }}
              options={[
                { value: "", label: "Select…" },
                ...GENDER_OPTIONS.map((g) => ({ value: g, label: g })),
              ]}
            />
            <Input
              type="text"
              name="occupation"
              label="Occupation"
              placeholder="e.g. Product Designer"
              value={profile.occupation ?? ""}
              onChange={(e) => updateProfile({ occupation: e.target.value || undefined })}
              icon={<Briefcase className="h-4 w-4" />}
            />
            <div className="sm:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">About me</label>
              <textarea
                rows={3}
                placeholder="A short intro for potential roommates…"
                value={profile.bio ?? ""}
                onChange={(e) => updateProfile({ bio: e.target.value || undefined })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div className="mt-6">
            <ResidenceHistoryFields profile={profile} onChange={updateProfile} />
          </div>

          <div className="mt-6">
            <ProfileVisibilityToggle
              visible={profile.isDiscoverable ?? false}
              onChange={setDiscoverable}
            />
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
              const v = profile.preferences[dim.key];
              return (
                <div key={dim.key} className="rounded-xl border border-transparent p-4">
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
                        <p className="mt-0.5 text-xs text-slate-500">{dim.description}</p>
                      )}
                    </div>
                    {v != null && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <DimensionField
                    dimension={dim}
                    value={v}
                    onChange={(value) => setPreference(dim.key, value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <Button
              variant="ghost"
              onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
              disabled={activeIdx === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex flex-wrap gap-2">
              <Link to="/match/search">
                <Button variant="outline">Edit search filters</Button>
              </Link>
              {activeIdx < groups.length - 1 ? (
                <Button onClick={() => setActiveIdx(activeIdx + 1)}>
                  Next category
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    navigate(onboarding ? "/match/search?onboarding=1" : "/match/seeker")
                  }
                >
                  {onboarding ? "Set search filters" : "Done"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
