import { StarRatingDisplay } from "@/components/services/StarRatingDisplay";
import { CompanyReviewForm } from "@/components/business/CompanyReviewForm";
import { useAuth } from "@/lib/auth";
import { COMPANY_REVIEW_DIMENSIONS } from "@/lib/companyReviews/dimensions";
import { useCompanyReviews } from "@/lib/companyReviews/useCompanyReviews";
import type { CompanyReview } from "@/types/companyReviews";
import type { Job } from "@/types";

type Props = {
  job: Job;
  compact?: boolean;
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

export function CompanyReviewsSection({ job, compact = false }: Props) {
  const { user } = useAuth();
  const { employer, reviews, stats, hasUserReviewed, submitReview } = useCompanyReviews(
    job.employerId
  );

  const showBreakdown = stats.userReviewCount > 0 || reviews.some((r) => r.isSeed);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Company rating
            </p>
            <div className="mt-1 text-4xl font-black">{stats.averageRating.toFixed(1)}</div>
            <StarRatingDisplay rating={stats.averageRating} size="md" className="mt-1" />
            <div className="mt-2 text-xs text-slate-500">
              {stats.reviewCount.toLocaleString()} reviews
              {stats.userReviewCount > 0 && (
                <span> · {stats.userReviewCount} from you & the community</span>
              )}
            </div>
          </div>

          {showBreakdown && (
            <div className="min-w-[240px] flex-1 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Professional criteria
              </p>
              {COMPANY_REVIEW_DIMENSIONS.map((dim) => {
                const seedAvg =
                  reviews.filter((r) => r.isSeed).length > 0
                    ? reviews
                        .filter((r) => r.scores[dim.id] >= 1)
                        .map((r) => r.scores[dim.id])
                    : [];
                const userAvg = stats.dimensionAverages[dim.id] ?? 0;
                const avg =
                  userAvg > 0
                    ? userAvg
                    : seedAvg.length > 0
                      ? Math.round(
                          (seedAvg.reduce((a, b) => a + b, 0) / seedAvg.length) * 10
                        ) / 10
                      : 0;
                if (avg <= 0) return null;
                return (
                  <div key={dim.id} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0 text-slate-600">{dim.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
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

        {employer && !compact && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">
            {employer.description}
          </p>
        )}
      </div>

      {!compact && (
        <CompanyReviewForm
          employerId={job.employerId}
          companyName={job.company}
          jobId={job.id}
          defaultJobTitle={job.title}
          defaultEmirate={job.emirate}
          hasReviewed={user ? hasUserReviewed(String(user.id)) : false}
          onSubmit={submitReview}
        />
      )}

      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            {compact ? "Recent reviews" : "Company reviews"}
          </h3>
          {(compact ? reviews.slice(0, 2) : reviews).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: CompanyReview }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{review.authorLabel}</p>
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
        {COMPANY_REVIEW_DIMENSIONS.map((dim) => (
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

/** Compact rating block for job detail sidebar */
export function CompanyRatingSummary({ job }: { job: Job }) {
  const { stats } = useCompanyReviews(job.employerId);

  if (stats.reviewCount <= 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-lg font-bold text-slate-900">{stats.averageRating.toFixed(1)}</span>
      <StarRatingDisplay rating={stats.averageRating} size="sm" />
      <span className="text-xs text-slate-500">
        ({stats.reviewCount.toLocaleString()} reviews)
      </span>
    </div>
  );
}
