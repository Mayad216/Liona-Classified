import type { ServiceReview } from "@/types/serviceReviews";

const STORAGE_KEY = "khaleej_service_reviews_v1";
export const SERVICE_REVIEWS_CHANGED = "khaleej:service-reviews";

type ReviewStore = Record<string, ServiceReview[]>;

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
  window.dispatchEvent(new CustomEvent(SERVICE_REVIEWS_CHANGED));
}

export function getStoredServiceReviews(serviceId: string): ServiceReview[] {
  const raw = readStore()[serviceId];
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (review): review is ServiceReview =>
      Boolean(review && typeof review === "object" && typeof review.id === "string")
  );
}

export function userHasReviewedService(serviceId: string, userId: string): boolean {
  return getStoredServiceReviews(serviceId).some((r) => r.reviewerUserId === userId);
}

export function addStoredServiceReview(review: ServiceReview): ServiceReview[] {
  const store = readStore();
  const existing = store[review.serviceId] ?? [];
  const next = [
    review,
    ...existing.filter((r) => r.reviewerUserId !== review.reviewerUserId),
  ];
  store[review.serviceId] = next;
  writeStore(store);
  return next;
}
