import type { ServiceCategory } from "@/types";
import type { ServiceReviewDimension } from "@/types/serviceReviews";

/** Category-specific review dimensions (1–5 each). */
export const SERVICE_REVIEW_DIMENSIONS: Record<ServiceCategory, ServiceReviewDimension[]> = {
  Electricians: [
    { id: "work_quality", label: "Work quality" },
    { id: "safety", label: "Safety & tidiness" },
    { id: "value", label: "Value for money" },
  ],
  Painting: [
    { id: "finish", label: "Finish quality" },
    { id: "punctuality", label: "Punctuality" },
    { id: "cleanup", label: "Clean-up after job" },
  ],
  Plumbing: [
    { id: "fix_quality", label: "Problem fixed properly" },
    { id: "punctuality", label: "Punctuality" },
    { id: "value", label: "Value for money" },
  ],
  "AC Services": [
    { id: "performance", label: "Cooling / performance" },
    { id: "technical", label: "Technical skill" },
    { id: "punctuality", label: "Punctuality" },
  ],
  Cleaning: [
    { id: "thoroughness", label: "Thoroughness" },
    { id: "punctuality", label: "Punctuality" },
    { id: "value", label: "Value for money" },
  ],
  Handyman: [
    { id: "work_quality", label: "Work quality" },
    { id: "reliability", label: "Reliability" },
    { id: "value", label: "Value for money" },
  ],
  Maintenance: [
    { id: "resolution", label: "Problem resolution" },
    { id: "response", label: "Response time" },
    { id: "value", label: "Value for money" },
  ],
  Movers: [
    { id: "care", label: "Care with belongings" },
    { id: "punctuality", label: "Punctuality" },
    { id: "value", label: "Value for money" },
  ],
  "Language Tutoring": [
    { id: "clarity", label: "Teaching clarity" },
    { id: "progress", label: "Progress made" },
    { id: "value", label: "Value for money" },
  ],
  "Homemade Meals": [
    { id: "taste", label: "Taste & quality" },
    { id: "freshness", label: "Portion & freshness" },
    { id: "hygiene", label: "Hygiene & packaging" },
  ],
  "Pest Control": [
    { id: "effectiveness", label: "Effectiveness" },
    { id: "follow_up", label: "Follow-up & advice" },
    { id: "value", label: "Value for money" },
  ],
};

export function getReviewDimensions(category: ServiceCategory): ServiceReviewDimension[] {
  return SERVICE_REVIEW_DIMENSIONS[category] ?? SERVICE_REVIEW_DIMENSIONS.Cleaning;
}

export function defaultReviewScores(category: ServiceCategory): Record<string, number> {
  const dims = getReviewDimensions(category);
  return Object.fromEntries(dims.map((d) => [d.id, 4]));
}

export function computeOverallRating(scores: Record<string, number>): number {
  const values = Object.values(scores).filter((n) => n >= 1 && n <= 5);
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 10) / 10;
}
