import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  EyeOff,
  IdCard,
  Sparkles,
  Wand2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DIMENSIONS, ENGINE_TUNING } from "@/lib/matchmaking/config";
import { getMatchDemoMode, isMatchDemoMode } from "@/lib/matchmaking/matchDemoMode";
import { topMatches } from "@/lib/matchmaking/engine";
import { mockCandidates } from "@/lib/matchmaking/mockProfiles";
import { buildScoringProfile } from "@/lib/matchmaking/searchPresets";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { useEmiratesIdVerification } from "@/lib/matchmaking/useEmiratesIdVerification";
import { useAuth } from "@/lib/auth";
import { MatchCard } from "@/components/match/MatchCard";
import { MatchSearchSidebar } from "@/components/match/MatchSearchSidebar";
import { ProfileVisibilityToggle } from "@/components/match/ProfileVisibilityToggle";

function MatchVerifyGate() {
  const { user } = useAuth();

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-radial-fade" aria-hidden />
      <section className="container pt-10 pb-20 sm:pt-16">
        <Link
          to="/match"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Match Me
        </Link>

        <div className="mx-auto mt-8 max-w-2xl text-center">
          <Badge tone="brand" className="bg-brand-50/60">
            <IdCard className="h-3 w-3" />
            ID verification required
          </Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Verify your Emirates ID to see matches
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600">
            Your profile is ready. Match Me only shows verified users — verify your Emirates ID
            once to browse matches and appear in search
            {user ? "" : " (sign in first)"}.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link to="/match/verify">
                <Button size="lg">
                  <IdCard className="h-5 w-5" />
                  Verify Emirates ID
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth/login" state={{ from: "/match/verify" }}>
                <Button size="lg">
                  Sign in to verify
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/match/profile">
              <Button variant="outline" size="lg">
                Edit my profile
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MatchBrowseLanding() {
  const { profileCompleteness } = useMatchProfile();
  const c = profileCompleteness();

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-radial-fade" aria-hidden />
      <section className="container pt-10 pb-20 sm:pt-16">
        <Link
          to="/match"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Match Me
        </Link>

        <div className="mx-auto mt-8 max-w-3xl text-center">
          <Badge tone="brand" className="bg-brand-50/60">
            <Sparkles className="h-3 w-3" />
            Looking for a roommate
          </Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Complete your profile to see matches
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600">
            Finish your lifestyle profile from the dashboard or below — then verify your Emirates
            ID to unlock matches with search filters on the side.
          </p>

          <div className="mx-auto mt-6 max-w-sm">
            <div className="text-xs font-medium text-slate-500">
              Profile {Math.round(c * 100)}% complete
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                style={{ width: `${Math.round(c * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/match/profile">
              <Button size="lg">
                <Wand2 className="h-5 w-5" />
                Set up my profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MatchBrowseResults() {
  const { profile, activeSearchPreset, setDiscoverable } = useMatchProfile();
  const demoMode = getMatchDemoMode();
  const isMaleDemo = demoMode === "male-seeker";
  const isFemaleLaylaDemo = demoMode === "female-layla";
  const [minScore, setMinScore] = useState(
    activeSearchPreset.minScore ?? ENGINE_TUNING.minDisplayScore
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const discoverableCandidates = useMemo(
    () => mockCandidates.filter((c) => c.isDiscoverable !== false),
    []
  );

  const scoringProfile = useMemo(
    () => buildScoringProfile(profile, { ...activeSearchPreset, minScore }),
    [profile, activeSearchPreset, minScore]
  );

  const results = useMemo(
    () => topMatches(scoringProfile, discoverableCandidates, { minScore }),
    [scoringProfile, discoverableCandidates, minScore]
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-20 pt-6">
      <div className="container max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/match"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Match Me
          </Link>
          <Badge tone="brand" className="bg-brand-50/60">
            <Sparkles className="h-3 w-3" />
            {activeSearchPreset.name}
          </Badge>
        </div>

        <header className="mt-4">
          {isFemaleLaylaDemo && (
            <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <strong>Layla demo:</strong> You are a female seeker looking for female roommates.
              Layla Khaleej should appear near the top with ~90% compatibility.
            </p>
          )}
          {isMaleDemo && (
            <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Demo mode:</strong> You are a male seeker looking for female roommates.
              Layla Khaleej (~90% lifestyle match, prefers female roommates only) should{" "}
              <strong>not</strong> appear — gender preference is a hard filter.
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your roommate matches
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            <strong className="text-slate-900">{results.length}</strong> matches above {minScore}%
            · switch filters on the left to explore different searches
          </p>
          {(scoringProfile.dealbreakers?.length ?? 0) > 0 && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800">
              <ShieldAlert className="h-3.5 w-3.5" />
              {scoringProfile.dealbreakers!.length} deal-breaker
              {scoringProfile.dealbreakers!.length !== 1 ? "s" : ""} in &ldquo;
              {activeSearchPreset.name}&rdquo;
            </p>
          )}
          {!profile.isDiscoverable && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
              <EyeOff className="h-3.5 w-3.5" />
              Your profile is hidden from others
            </p>
          )}
        </header>

        <div className="mt-4 lg:hidden">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            {mobileFiltersOpen ? "Hide filters" : "Show search filters"}
          </Button>
          {mobileFiltersOpen && (
            <MatchSearchSidebar
              className="mt-3 max-h-[70vh]"
              minScore={minScore}
              onMinScoreChange={setMinScore}
            />
          )}
        </div>

        <div className="mt-6 flex gap-6 lg:mt-8">
          <MatchSearchSidebar
            className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-[320px] shrink-0 lg:flex xl:w-[360px]"
            minScore={minScore}
            onMinScoreChange={setMinScore}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-5">
              <ProfileVisibilityToggle
                visible={profile.isDiscoverable ?? false}
                onChange={setDiscoverable}
              />
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="font-semibold text-slate-700">
                  No matches above {minScore}% with &ldquo;{activeSearchPreset.name}&rdquo;
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another filter preset, lower the compatibility bar, or relax deal-breakers.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setMinScore(Math.max(0, minScore - 15))}
                >
                  Lower threshold
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {results.map((m) => (
                  <MatchCard key={m.candidate.userId} match={m} dense />
                ))}
              </div>
            )}

            <p className="mt-8 text-center text-xs text-slate-500">
              Scoring uses &ldquo;{activeSearchPreset.name}&rdquo; filters ({DIMENSIONS.length}{" "}
              dimensions) against each candidate&apos;s lifestyle profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchSeeker() {
  const { loading, isMatchProfileReady } = useMatchProfile();
  const { isVerified, loading: verifyLoading } = useEmiratesIdVerification();
  const demoMode = isMatchDemoMode();

  if (loading || (!demoMode && verifyLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!demoMode && !isMatchProfileReady()) {
    return <MatchBrowseLanding />;
  }

  if (!demoMode && !isVerified) {
    return <MatchVerifyGate />;
  }

  return <MatchBrowseResults />;
}
