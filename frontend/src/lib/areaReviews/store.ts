import type { AreaCommunityReview } from "@/types/areaInsights";

const STORAGE_KEY = "khaleej_area_reviews_v1";

export type StoredAreaCommunityReview = AreaCommunityReview & {
  reviewerUserId: string;
  residenceStatus: "current" | "past";
};

type ReviewStore = Record<string, StoredAreaCommunityReview[]>;

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
}

export function getStoredAreaReviews(areaId: string): StoredAreaCommunityReview[] {
  return readStore()[areaId] ?? [];
}

export function userHasReviewedArea(areaId: string, userId: string): boolean {
  return getStoredAreaReviews(areaId).some((r) => r.reviewerUserId === userId);
}

export function addStoredAreaReview(
  areaId: string,
  review: StoredAreaCommunityReview
): StoredAreaCommunityReview[] {
  const store = readStore();
  const existing = store[areaId] ?? [];
  const next = [review, ...existing.filter((r) => r.reviewerUserId !== review.reviewerUserId)];
  store[areaId] = next;
  writeStore(store);
  return next;
}
