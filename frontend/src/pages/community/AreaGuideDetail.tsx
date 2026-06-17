import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AreaCategoryBadges } from "@/components/area/AreaCategoryBadges";
import { AreaReviewForm } from "@/components/area/AreaReviewForm";
import { getAreaInsightById } from "@/data/areaInsights";
import { aggregateReviews } from "@/lib/areaInsights/aggregate";
import { getStoredAreaReviews, type StoredAreaCommunityReview } from "@/lib/areaReviews/store";
import { useMatchProfile } from "@/lib/matchmaking/useMatchProfile";
import { relativeTime } from "@/lib/utils";
import { mockListings } from "@/data/mock";
import { ListingCard } from "@/components/ListingCard";
import type { AreaCommunityReview, AreaInsight } from "@/types/areaInsights";

function mergeInsightReviews(
  base: AreaInsight,
  userReviews: StoredAreaCommunityReview[]
): AreaInsight {
  const reviews: AreaCommunityReview[] = [...userReviews, ...base.reviews];
  const { communityRating, reviewCount, tags } = aggregateReviews(reviews);
  return {
    ...base,
    reviews,
    communityRating,
    reviewCount,
    tags,
  };
}

export function AreaGuideDetail() {
  const { id } = useParams();
  const baseInsight = id ? getAreaInsightById(id) : undefined;
  const { profile } = useMatchProfile();
  const [userReviews, setUserReviews] = useState<StoredAreaCommunityReview[]>(() =>
    id ? getStoredAreaReviews(id) : []
  );

  const insight = useMemo(
    () => (baseInsight ? mergeInsightReviews(baseInsight, userReviews) : undefined),
    [baseInsight, userReviews]
  );

  if (!insight) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Area guide not found</h1>
        <Link to="/community/areas" className="mt-4 inline-block text-brand-600 hover:underline">
          Back to area guides
        </Link>
      </div>
    );
  }

  const listings = mockListings.filter(
    (l) => l.area.toLowerCase() === insight.name.toLowerCase()
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-20 pt-8">
      <div className="container max-w-4xl">
        <Link
          to="/community/areas"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> All area guides
        </Link>

        <header className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge tone={insight.type === "building" ? "brand" : "outline"}>
                {insight.type === "building" ? "Building" : "Neighborhood"}
              </Badge>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{insight.name}</h1>
              <p className="mt-1 text-slate-600">{insight.emirate}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 text-amber-600">
                <Star className="h-6 w-6 fill-current" />
                <span className="text-3xl font-black">{insight.communityRating}</span>
              </div>
              <p className="text-xs text-slate-500">
                {insight.reviewCount} community reviews
              </p>
            </div>
          </div>

          <p className="mt-6 text-base leading-relaxed text-slate-700">{insight.summary}</p>

          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Community tags
            </h2>
            <div className="mt-3">
              <AreaCategoryBadges tags={insight.tags} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Crowd score" value={`${insight.tags.crowdScore} / 5`} />
            <Stat label="Building age" value={`${insight.tags.buildingAgeScore} / 5`} />
            <Stat label="Value score" value={`${insight.tags.valueScore} / 5`} />
            <Stat label="Cleanliness" value={`${insight.tags.cleanlinessScore} / 5`} />
            <Stat label="Maintenance" value={`${insight.tags.maintenanceScore} / 5`} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Lower value score = better value. Higher crowd / age scores = busier or older per
            reviews. Higher cleanliness / maintenance scores = cleaner common areas and better
            building upkeep.
          </p>
        </header>

        {insight && (
          <AreaReviewForm
            insight={insight}
            profile={profile}
            onSubmitted={(reviews) => setUserReviews(reviews)}
          />
        )}

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MessageSquare className="h-5 w-5 text-brand-600" />
            Community reviews
          </h2>
          <ul className="mt-4 space-y-4">
            {insight.reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{r.author}</span>
                    {r.residenceStatus && (
                      <Badge tone={r.residenceStatus === "current" ? "success" : "outline"}>
                        {r.residenceStatus === "current" ? "Current resident" : "Lived here before"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {r.rating}
                    </span>
                    <span className="text-xs text-slate-400">{relativeTime(r.postedAt)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{r.text}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  <span>Crowd {r.crowdScore}/5</span>
                  <span>·</span>
                  <span>Age {r.buildingAgeScore}/5</span>
                  <span>·</span>
                  <span>Value {r.valueScore}/5</span>
                  <span>·</span>
                  <span>Clean {r.cleanlinessScore}/5</span>
                  <span>·</span>
                  <span>Upkeep {r.maintenanceScore}/5</span>
                  {r.nationalitiesMentioned.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{r.nationalitiesMentioned.join(", ")}</span>
                    </>
                  )}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {r.helpful} found helpful
                </div>
              </li>
            ))}
          </ul>
        </section>

        {listings.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold">Listings in {insight.name}</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {listings.slice(0, 4).map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
            <Link
              to={`/accommodation?area=${encodeURIComponent(insight.name)}`}
              className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
            >
              View all listings in {insight.name} →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}
