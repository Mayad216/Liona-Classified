import { useCallback, useEffect, useMemo, useState } from "react";
import {
  aggregateCompanyReviews,
  mergeCompanyReviewsForDisplay,
} from "@/lib/companyReviews/aggregate";
import { getEmployerProfile } from "@/lib/companyReviews/employers";
import { getSeedCompanyReviews } from "@/lib/companyReviews/seeds";
import {
  addStoredCompanyReview,
  COMPANY_REVIEWS_CHANGED,
  getStoredCompanyReviews,
  userHasReviewedCompany,
} from "@/lib/companyReviews/store";
import type { CompanyReview } from "@/types/companyReviews";

export function useCompanyReviews(employerId: string) {
  const employer = getEmployerProfile(employerId);
  const baselineRating = employer?.rating ?? 0;
  const baselineReviewCount = employer?.reviewCount ?? 0;
  const seedReviews = useMemo(() => getSeedCompanyReviews(employerId), [employerId]);

  const [userReviews, setUserReviews] = useState<CompanyReview[]>(() =>
    getStoredCompanyReviews(employerId)
  );

  const refresh = useCallback(() => {
    setUserReviews(getStoredCompanyReviews(employerId));
  }, [employerId]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(COMPANY_REVIEWS_CHANGED, onChange);
    return () => window.removeEventListener(COMPANY_REVIEWS_CHANGED, onChange);
  }, [refresh]);

  const stats = useMemo(
    () =>
      aggregateCompanyReviews(userReviews, {
        rating: baselineRating,
        reviewCount: baselineReviewCount,
      }),
    [userReviews, baselineRating, baselineReviewCount]
  );

  const reviews = useMemo(
    () => mergeCompanyReviewsForDisplay(userReviews, seedReviews),
    [userReviews, seedReviews]
  );

  return {
    employer,
    reviews,
    stats,
    hasUserReviewed: (userId: string) => userHasReviewedCompany(employerId, userId),
    submitReview: (review: CompanyReview) => {
      const next = addStoredCompanyReview(review);
      setUserReviews(next);
      return next;
    },
  };
}

/** Lightweight stats for list cards without subscribing to review events. */
export function getCompanyReviewSnapshot(employerId: string) {
  const employer = getEmployerProfile(employerId);
  const userReviews = getStoredCompanyReviews(employerId);
  return aggregateCompanyReviews(userReviews, {
    rating: employer?.rating ?? 0,
    reviewCount: employer?.reviewCount ?? 0,
  });
}
