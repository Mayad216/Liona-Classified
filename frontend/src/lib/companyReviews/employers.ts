import type { EmployerProfileSummary } from "@/types/companyReviews";

export const EMPLOYER_PROFILES: Record<string, EmployerProfileSummary> = {
  "employer-careem": {
    id: "employer-careem",
    companyName: "Careem",
    industry: "Technology",
    emirate: "Dubai",
    description:
      "The everyday Super App for the region — mobility, delivery, and payments. Hybrid teams across Dubai Media City with visa sponsorship for eligible roles.",
    rating: 4.1,
    reviewCount: 312,
    openRolesEstimate: 24,
  },
  "employer-property-finder": {
    id: "employer-property-finder",
    companyName: "Property Finder",
    industry: "PropTech",
    emirate: "Dubai",
    description:
      "Leading property portal in MENA. Product-led culture, competitive packages, and clear growth paths for engineers and commercial teams.",
    rating: 3.9,
    reviewCount: 148,
    openRolesEstimate: 11,
  },
  "employer-talabat": {
    id: "employer-talabat",
    companyName: "Talabat",
    industry: "Food & Delivery",
    emirate: "Dubai",
    description:
      "Regional food delivery platform. Fast-paced operations with strong learning opportunities in logistics, product, and customer experience.",
    rating: 3.7,
    reviewCount: 526,
    openRolesEstimate: 38,
  },
  "employer-tarjama": {
    id: "employer-tarjama",
    companyName: "Tarjama",
    industry: "Language Services",
    emirate: "Abu Dhabi",
    description:
      "Arabic-first language technology and translation services. Smaller teams with hands-on leadership and flexible arrangements for specialists.",
    rating: 4.3,
    reviewCount: 67,
    openRolesEstimate: 6,
  },
  "employer-tabby": {
    id: "employer-tabby",
    companyName: "Tabby",
    industry: "Fintech",
    emirate: "Dubai",
    description:
      "Buy now, pay later fintech scaling across the Gulf. High-growth environment with transparent compensation bands and modern benefits.",
    rating: 4.0,
    reviewCount: 203,
    openRolesEstimate: 19,
  },
};

export function getEmployerProfile(employerId: string): EmployerProfileSummary | null {
  return EMPLOYER_PROFILES[employerId] ?? null;
}

export function slugEmployerId(companyName: string): string {
  return `employer-${companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}
