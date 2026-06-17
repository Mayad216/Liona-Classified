import { useCallback, useEffect, useMemo, useState } from "react";
import { aggregateServiceReviews } from "@/lib/serviceReviews/aggregate";
import {
  addStoredServiceReview,
  getStoredServiceReviews,
  SERVICE_REVIEWS_CHANGED,
  userHasReviewedService,
} from "@/lib/serviceReviews/store";
import type { ServiceCategory } from "@/types";
import type { ServiceReview } from "@/types/serviceReviews";

export function useServiceReviews(
  serviceId: string,
  category: ServiceCategory,
  baselineRating: number,
  baselineReviewCount: number
) {
  const [reviews, setReviews] = useState<ServiceReview[]>(() =>
    getStoredServiceReviews(serviceId)
  );

  const refresh = useCallback(() => {
    setReviews(getStoredServiceReviews(serviceId));
  }, [serviceId]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(SERVICE_REVIEWS_CHANGED, onChange);
    return () => window.removeEventListener(SERVICE_REVIEWS_CHANGED, onChange);
  }, [refresh]);

  const stats = useMemo(
    () =>
      aggregateServiceReviews(
        reviews,
        { rating: baselineRating, reviewCount: baselineReviewCount },
        category
      ),
    [reviews, baselineRating, baselineReviewCount, category]
  );

  return {
    reviews,
    stats,
    hasUserReviewed: (userId: string) => userHasReviewedService(serviceId, userId),
    submitReview: (review: ServiceReview) => {
      const next = addStoredServiceReview(review);
      setReviews(next);
      return next;
    },
  };
}
