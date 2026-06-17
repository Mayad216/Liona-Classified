import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Briefcase,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { mockCandidates } from "@/lib/matchmaking/mockProfiles";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { scorePair, badgeForScore } from "@/lib/matchmaking/engine";
import { MatchScoreBreakdown } from "@/components/match/MatchScoreBreakdown";
import { MatchProfileOverview, ProfileBasicsPanel } from "@/components/match/ProfileBasicsFields";
import { CompatibilityRadar } from "@/components/match/CompatibilityRadar";

export function MatchDetail() {
  const { id } = useParams();
  const { profile } = useMatchProfile();
  const candidate = mockCandidates.find(
    (c) => c.userId === id && c.isDiscoverable !== false
  );

  const result = useMemo(
    () => (candidate ? scorePair(profile, candidate) : null),
    [profile, candidate]
  );

  if (!candidate || !result) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Match not found</h1>
        <Link
          to="/match/seeker"
          className="mt-4 inline-block text-brand-600 underline"
        >
          Back to matches
        </Link>
      </div>
    );
  }

  const tone = badgeForScore(result.score);
  const toneStyles = {
    great: { bg: "from-emerald-50 to-emerald-100/40", text: "text-emerald-600", label: "Great match" },
    good: { bg: "from-amber-50 to-amber-100/40", text: "text-amber-600", label: "Good match" },
    fair: { bg: "from-slate-50 to-slate-100/40", text: "text-slate-600", label: "Fair match" },
    poor: { bg: "from-red-50 to-red-100/40", text: "text-red-600", label: "Low match" },
  }[tone];

  return (
    <div className="bg-slate-50/40 pb-20 pt-8">
      <div className="container">
        <Link
          to="/match/seeker"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> All matches
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Hero */}
            <div
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${toneStyles.bg} p-6 sm:p-8`}
            >
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={candidate.avatar}
                    name={candidate.name}
                    size="xl"
                    ring
                  />
                  <div>
                    <Badge tone="success" className="bg-white">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                      {candidate.name}
                    </h1>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${toneStyles.text}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {toneStyles.label}
                  </div>
                  <div className="mt-1 flex items-baseline gap-0.5">
                    <span className="text-6xl font-black tracking-tight tabular-nums text-slate-900">
                      {result.score}
                    </span>
                    <span className="text-2xl font-bold text-slate-400">%</span>
                  </div>
                  <p className="text-xs text-slate-500">AI compatibility</p>
                </div>
              </div>

              {result.dealbreakerClash && result.dealbreakerWarnings && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-bold text-amber-900">
                    <ShieldAlert className="h-4 w-4" />
                    Deal-breaker clash — shown because match is {result.score}%+
                  </p>
                  <p className="mt-1 text-sm text-amber-800/90">
                    You marked these as non-negotiable, but overall compatibility is
                    high enough that we still surface this person with a warning.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-amber-900">
                    {result.dealbreakerWarnings.map((w) => (
                      <li key={w} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Highlights / Concerns summary */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                  Where you'll click
                </h3>
                {result.highlights.length === 0 ? (
                  <p className="mt-2 text-sm text-emerald-900/70">
                    No standout alignments yet — answer a few more questions.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                    {result.highlights.map((h) => (
                      <li key={h.key}>
                        <strong>{h.label}</strong> — {h.explanation}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold text-amber-800">
                  <Heart className="h-4 w-4" />
                  Worth discussing
                </h3>
                {result.concerns.length === 0 ? (
                  <p className="mt-2 text-sm text-amber-900/70">
                    No major frictions detected.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-amber-900">
                    {result.concerns.map((c) => (
                      <li key={c.key}>
                        <strong>{c.label}</strong> — {c.explanation}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Radar */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight">
                Compatibility across categories
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Each axis shows how well you align on that dimension family.
              </p>
              <div className="mt-4 flex justify-center">
                <CompatibilityRadar categoryScores={result.categoryScores} size={320} />
              </div>
            </div>

            {/* Full breakdown */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight">
                Full compatibility breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Every dimension we scored, transparently.
              </p>
              <div className="mt-6">
                <MatchScoreBreakdown
                  breakdown={result.breakdown}
                  categoryScores={result.categoryScores}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="self-start lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <Button size="lg" className="w-full">
                <MessageCircle className="h-4 w-4" /> Send a message
              </Button>
              <Button variant="outline" size="lg" className="mt-2 w-full">
                <Heart className="h-4 w-4" /> Save for later
              </Button>
              {candidate.listingId && (
                <Link to={`/accommodation/${candidate.listingId}`}>
                  <Button variant="ghost" size="md" className="mt-2 w-full">
                    <Briefcase className="h-4 w-4" /> View their listing
                  </Button>
                </Link>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <MatchProfileOverview profile={candidate} title="Profile" />
            </div>

            <ProfileBasicsPanel profile={profile} title="Your search" editTo="/match/profile" />
          </aside>
        </div>
      </div>
    </div>
  );
}
