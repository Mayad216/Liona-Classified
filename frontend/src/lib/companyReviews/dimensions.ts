import type { CompanyReview } from "@/types/companyReviews";
import type { CompanyReviewDimension } from "@/types/companyReviews";

/**
 * Professional employer review criteria inspired by Indeed company reviews
 * and Work Wellbeing drivers (culture, compensation, balance, growth, management).
 */
export const COMPANY_REVIEW_DIMENSIONS: CompanyReviewDimension[] = [
  {
    id: "culture",
    label: "Culture & values",
    prompt: "The workplace feels inclusive, respectful, and aligned with its values.",
  },
  {
    id: "compensation",
    label: "Compensation & benefits",
    prompt: "Pay, benefits, and perks are fair for the role and market.",
  },
  {
    id: "work_life",
    label: "Work-life balance",
    prompt: "Hours, flexibility, and workload are manageable.",
  },
  {
    id: "career",
    label: "Career development",
    prompt: "There are opportunities to learn, grow, and advance.",
  },
  {
    id: "management",
    label: "Management & leadership",
    prompt: "Leaders communicate clearly and support your success.",
  },
  {
    id: "hiring",
    label: "Interview & hiring",
    prompt: "The application and interview process was professional and transparent.",
  },
];

export function defaultCompanyReviewScores(): Record<string, number> {
  return Object.fromEntries(COMPANY_REVIEW_DIMENSIONS.map((d) => [d.id, 4]));
}

export function computeCompanyOverallRating(scores: Record<string, number>): number {
  const values = Object.values(scores).filter((n) => n >= 1 && n <= 5);
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 10) / 10;
}

export function employmentStatusLabel(status: CompanyReview["employmentStatus"]): string {
  switch (status) {
    case "current":
      return "Current employee";
    case "former":
      return "Former employee";
    case "applicant":
      return "Interview experience";
  }
}

export function buildAuthorLabel(
  status: CompanyReview["employmentStatus"],
  jobTitle?: string,
  emirate?: string
): string {
  const parts = [employmentStatusLabel(status)];
  if (jobTitle?.trim()) parts.push(jobTitle.trim());
  if (emirate?.trim()) parts.push(emirate.trim());
  return parts.join(" · ");
}
