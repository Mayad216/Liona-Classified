import type { ServiceCategory } from "@/types";

export type ServiceReviewDimensionId = string;

export interface ServiceReviewDimension {
  id: ServiceReviewDimensionId;
  label: string;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  category: ServiceCategory;
  reviewerUserId: string;
  author: string;
  createdAt: string;
  body: string;
  /** Category-specific 1–5 scores */
  scores: Record<ServiceReviewDimensionId, number>;
  /** Average of dimension scores */
  overallRating: number;
}

export interface ServiceReviewStats {
  averageRating: number;
  reviewCount: number;
  userReviewCount: number;
  dimensionAverages: Record<ServiceReviewDimensionId, number>;
}
