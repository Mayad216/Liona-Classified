import { COMPANY_REVIEW_DIMENSIONS } from "@/lib/companyReviews/dimensions";
import type { CompanyReview, CompanyReviewStats } from "@/types/companyReviews";

export function aggregateCompanyReviews(
  userReviews: CompanyReview[],
  baseline: { rating: number; reviewCount: number }
): CompanyReviewStats {
  const userReviewCount = userReviews.length;

  const dimensionAverages: Record<string, number> = {};
  for (const dim of COMPANY_REVIEW_DIMENSIONS) {
    const values = userReviews.map((r) => r.scores[dim.id]).filter((n) => n >= 1 && n <= 5);
    dimensionAverages[dim.id] =
      values.length > 0
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;
  }

  if (userReviewCount === 0) {
    return {
      averageRating: baseline.rating,
      reviewCount: baseline.reviewCount,
      userReviewCount: 0,
      dimensionAverages,
    };
  }

  const userSum = userReviews.reduce((sum, r) => sum + r.overallRating, 0);
  const baselineSum = baseline.rating * baseline.reviewCount;
  const totalCount = baseline.reviewCount + userReviewCount;
  const averageRating =
    totalCount > 0
      ? Math.round(((baselineSum + userSum) / totalCount) * 10) / 10
      : baseline.rating;

  return {
    averageRating,
    reviewCount: totalCount,
    userReviewCount,
    dimensionAverages,
  };
}

export function mergeCompanyReviewsForDisplay(
  userReviews: CompanyReview[],
  seedReviews: CompanyReview[]
): CompanyReview[] {
  const userIds = new Set(userReviews.map((r) => r.reviewerUserId));
  const seeds = seedReviews.filter((s) => !userIds.has(s.reviewerUserId));
  return [...userReviews, ...seeds].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
