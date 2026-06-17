import { StarRatingDisplay } from "@/components/services/StarRatingDisplay";
import { ServiceReviewForm } from "@/components/services/ServiceReviewForm";
import { useAuth } from "@/lib/auth";
import { getReviewDimensions } from "@/lib/serviceReviews/dimensions";
import { useServiceReviews } from "@/lib/serviceReviews/useServiceReviews";
import type { Service } from "@/types";
import type { ServiceReview } from "@/types/serviceReviews";

type Props = {
  service: Service;
};

function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ServiceReviewsSection({ service }: Props) {
  const { user } = useAuth();
  const { reviews, stats, hasUserReviewed, submitReview } = useServiceReviews(
    service.id,
    service.category,
    service.rating,
    service.reviewCount
  );
  const dimensions = getReviewDimensions(service.category);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <div className="text-4xl font-black">{stats.averageRating.toFixed(1)}</div>
            <StarRatingDisplay rating={stats.averageRating} size="md" className="mt-1" />
            <div className="mt-2 text-xs text-slate-500">
              {stats.reviewCount.toLocaleString()} reviews
              {stats.userReviewCount > 0 && (
                <span> · {stats.userReviewCount} from the community</span>
              )}
            </div>
          </div>

          {stats.userReviewCount > 0 && (
            <div className="min-w-[220px] flex-1 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {service.category} breakdown
              </p>
              {dimensions.map((dim) => {
                const avg = stats.dimensionAverages[dim.id] ?? 0;
                if (avg <= 0) return null;
                return (
                  <div key={dim.id} className="flex items-center gap-3 text-sm">
                    <span className="w-36 shrink-0 text-slate-600">{dim.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-accent-500"
                        style={{ width: `${(avg / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold text-slate-900">
                      {avg.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ServiceReviewForm
        serviceId={service.id}
        category={service.category}
        hasReviewed={user ? hasUserReviewed(String(user.id)) : false}
        onSubmit={submitReview}
      />

      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Community reviews
          </h3>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ServiceReview }) {
  const dimensions = getReviewDimensions(review.category);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{review.author}</p>
          <p className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">
            {review.overallRating.toFixed(1)}
          </div>
          <StarRatingDisplay rating={review.overallRating} size="sm" />
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {dimensions.map((dim) => (
          <span
            key={dim.id}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
          >
            {dim.label}: {review.scores[dim.id] ?? "—"}/5
          </span>
        ))}
      </div>
    </article>
  );
}
