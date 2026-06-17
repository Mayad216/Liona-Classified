import { getReviewDimensions } from "@/lib/serviceReviews/dimensions";
import type { ServiceCategory } from "@/types";
import type { ServiceReview, ServiceReviewStats } from "@/types/serviceReviews";

export function aggregateServiceReviews(
  userReviews: ServiceReview[],
  baseline: { rating: number; reviewCount: number },
  category: ServiceCategory
): ServiceReviewStats {
  const userReviewCount = userReviews.length;
  const dimensions = getReviewDimensions(category);

  const dimensionAverages: Record<string, number> = {};
  for (const dim of dimensions) {
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
