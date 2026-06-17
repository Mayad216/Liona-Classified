export type CompanyReviewEmploymentStatus = "current" | "former" | "applicant";

export type CompanyReviewDimensionId = string;

export interface CompanyReviewDimension {
  id: CompanyReviewDimensionId;
  label: string;
  /** Short Indeed-style survey prompt shown under the label */
  prompt: string;
}

export interface CompanyReview {
  id: string;
  employerId: string;
  companyName: string;
  reviewerUserId: string;
  /** Display label — e.g. "Former employee · Product Designer" */
  authorLabel: string;
  employmentStatus: CompanyReviewEmploymentStatus;
  jobTitle?: string;
  emirate?: string;
  createdAt: string;
  body: string;
  /** Professional criteria scores (1–5 each) */
  scores: Record<CompanyReviewDimensionId, number>;
  overallRating: number;
  /** Seed/demo reviews are read-only */
  isSeed?: boolean;
}

export interface CompanyReviewStats {
  averageRating: number;
  reviewCount: number;
  userReviewCount: number;
  dimensionAverages: Record<CompanyReviewDimensionId, number>;
}

export interface EmployerProfileSummary {
  id: string;
  companyName: string;
  industry: string;
  emirate: string;
  description: string;
  rating: number;
  reviewCount: number;
  openRolesEstimate?: number;
}
