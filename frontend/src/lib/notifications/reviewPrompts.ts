import { areaInsights } from "@/data/areaInsights";
import type { RoommateProfile } from "@/lib/matchmaking/types";
import { hydrateResidenceFields } from "@/lib/matchmaking/residenceHistory";
import { checkAreaReviewEligibility } from "@/lib/areaReviews/eligibility";
import { userHasReviewedArea } from "@/lib/areaReviews/store";
import { getStoredAuthToken } from "@/lib/api";
import {
  emitNotificationsChanged,
  notificationExistsLocal,
  reviewPromptNotificationId,
  upsertNotificationLocal,
} from "./store";

export function residenceFingerprint(profile: RoommateProfile): string {
  const h = hydrateResidenceFields(profile);
  return JSON.stringify({
    currentNeighborhood: h.currentNeighborhood ?? null,
    previousNeighborhoods: h.previousNeighborhoods ?? [],
    currentBuilding: h.currentBuilding ?? null,
    previousBuildings: h.previousBuildings ?? [],
  });
}

export function reviewPromptBody(
  placeName: string,
  residenceStatus: "current" | "past"
): string {
  if (residenceStatus === "current") {
    return `How is it at ${placeName}? Leave a review for the community.`;
  }
  return `How was it during your time at ${placeName}? Leave a review for the community.`;
}

/** Create review-prompt notifications for eligible, unreviewed places on the user's profile. */
export function syncReviewPromptNotifications(profile: RoommateProfile): void {
  if (!profile.userId) return;

  if (getStoredAuthToken()) {
    emitNotificationsChanged();
    return;
  }

  for (const insight of areaInsights) {
    const eligibility = checkAreaReviewEligibility(profile, insight);
    if (!eligibility.eligible) continue;
    if (userHasReviewedArea(insight.id, profile.userId)) continue;

    const id = reviewPromptNotificationId(profile.userId, insight.id);
    if (notificationExistsLocal(id)) continue;

    upsertNotificationLocal({
      id,
      userId: profile.userId,
      kind: "review_prompt",
      title: "Share your experience?",
      body: reviewPromptBody(insight.name, eligibility.residenceStatus),
      href: `/community/areas/${insight.id}`,
      createdAt: new Date().toISOString(),
      unread: true,
      areaId: insight.id,
    });
  }
}
