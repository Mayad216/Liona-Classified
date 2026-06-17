import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import type { AreaInsight } from "@/types/areaInsights";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  checkAreaReviewEligibility,
} from "@/lib/areaReviews/eligibility";
import {
  addStoredAreaReview,
  userHasReviewedArea,
  type StoredAreaCommunityReview,
} from "@/lib/areaReviews/store";
import { dismissReviewPrompt } from "@/lib/notifications/store";
import type { RoommateProfile } from "@/lib/matchmaking/types";
import { cn } from "@/lib/utils";

interface Props {
  insight: AreaInsight;
  profile: RoommateProfile;
  onSubmitted: (reviews: StoredAreaCommunityReview[]) => void;
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-9 flex-1 rounded-lg border text-sm font-semibold transition",
              value === n
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AreaReviewForm({ insight, profile, onSubmitted }: Props) {
  const eligibility = checkAreaReviewEligibility(profile, insight);
  const alreadyReviewed = userHasReviewedArea(insight.id, profile.userId);

  const [rating, setRating] = useState(4);
  const [crowdScore, setCrowdScore] = useState(3);
  const [buildingAgeScore, setBuildingAgeScore] = useState(3);
  const [valueScore, setValueScore] = useState(3);
  const [cleanlinessScore, setCleanlinessScore] = useState(3);
  const [maintenanceScore, setMaintenanceScore] = useState(3);
  const [nationalities, setNationalities] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!eligibility.eligible) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5">
        <p className="text-sm font-semibold text-slate-900">
          Only residents can review this {insight.type}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {eligibility.reason === "no_residence_history"
            ? "Add where you live now or where you've lived before on your roommate profile, then come back to share a review."
            : `Your profile doesn't list ${insight.name} as a current or past ${
                insight.type === "building" ? "building" : "neighborhood"
              }. Update your residence history if you've lived here.`}
        </p>
        <Link to="/match/profile" className="mt-4 inline-block">
          <Button size="sm" variant="outline">
            Update residence on profile
          </Button>
        </Link>
      </div>
    );
  }

  if (alreadyReviewed || submitted) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Thanks — your review is live</p>
          <p className="mt-1 text-sm text-emerald-800">
            You can only submit one review per {insight.type} based on your verified residence
            history.
          </p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const review: StoredAreaCommunityReview = {
      id: `user-${profile.userId}-${Date.now()}`,
      reviewerUserId: profile.userId,
      residenceStatus: eligibility.residenceStatus,
      author: profile.name || "Community member",
      rating,
      crowdScore,
      buildingAgeScore,
      valueScore,
      cleanlinessScore,
      maintenanceScore,
      nationalitiesMentioned: nationalities
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      text: text.trim(),
      helpful: 0,
      postedAt: new Date().toISOString(),
    };

    const next = addStoredAreaReview(insight.id, review);
    void dismissReviewPrompt(profile.userId, insight.id);
    setSubmitted(true);
    onSubmitted(next);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-brand-200/70 bg-gradient-to-br from-brand-50/40 to-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            Write a review
          </p>
          <p className="mt-1 text-xs text-slate-600">
            You're eligible because{" "}
            <span className="font-medium text-slate-800">
              {eligibility.residenceStatus === "current" ? "you currently live" : "you lived"} at{" "}
              {eligibility.matchedAs}
            </span>
            .
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200">
          <MapPin className="h-3 w-3" />
          {eligibility.residenceStatus === "current" ? "Current resident" : "Past resident"}
        </span>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Overall rating</label>
        <ScoreField label="" value={rating} onChange={setRating} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ScoreField label="Crowd level (1 = quiet, 5 = packed)" value={crowdScore} onChange={setCrowdScore} />
        <ScoreField
          label="Building age (1 = new, 5 = older stock)"
          value={buildingAgeScore}
          onChange={setBuildingAgeScore}
        />
        <ScoreField label="Value (1 = great value, 5 = overpriced)" value={valueScore} onChange={setValueScore} />
        <ScoreField label="Cleanliness (1 = poor, 5 = spotless)" value={cleanlinessScore} onChange={setCleanlinessScore} />
        <ScoreField
          label="Maintenance (1 = poor, 5 = excellent)"
          value={maintenanceScore}
          onChange={setMaintenanceScore}
        />
      </div>

      <div className="mt-5 space-y-4">
        <Input
          label="Nationalities you noticed (optional)"
          placeholder="e.g. Indian, Filipino, British"
          value={nationalities}
          onChange={(e) => setNationalities(e.target.value)}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Your review</label>
          <textarea
            required
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What is it like living in ${insight.name}?`}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
      </div>

      <Button type="submit" className="mt-5" disabled={!text.trim()}>
        Post community review
      </Button>
    </form>
  );
}
