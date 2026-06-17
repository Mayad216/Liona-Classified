import type { CompanyReview } from "@/types/companyReviews";

const STORAGE_KEY = "khaleej_company_reviews_v1";
export const COMPANY_REVIEWS_CHANGED = "khaleej:company-reviews";

type ReviewStore = Record<string, CompanyReview[]>;

function readStore(): ReviewStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: ReviewStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(COMPANY_REVIEWS_CHANGED));
}

export function getStoredCompanyReviews(employerId: string): CompanyReview[] {
  const raw = readStore()[employerId];
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (review): review is CompanyReview =>
      Boolean(review && typeof review === "object" && typeof review.id === "string")
  );
}

export function userHasReviewedCompany(employerId: string, userId: string): boolean {
  return getStoredCompanyReviews(employerId).some((r) => r.reviewerUserId === userId);
}

export function addStoredCompanyReview(review: CompanyReview): CompanyReview[] {
  const store = readStore();
  const existing = store[review.employerId] ?? [];
  const next = [
    review,
    ...existing.filter((r) => r.reviewerUserId !== review.reviewerUserId),
  ];
  store[review.employerId] = next;
  writeStore(store);
  return next;
}
