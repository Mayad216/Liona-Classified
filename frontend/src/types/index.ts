export type Emirate =
  | "Dubai"
  | "Abu Dhabi"
  | "Sharjah"
  | "Ajman"
  | "Ras Al Khaimah"
  | "Fujairah"
  | "Umm Al Quwain";

export type RoomType = "Bedspace" | "Partition" | "Private Room" | "Studio" | "Full Apartment";

export type GenderPreference = "Male" | "Female" | "Any" | "Family";

export type ListedBy = "Agent" | "Landlord" | "Developer" | "Tenant";

export interface User {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
  joinedAt: string;
  role: "seeker" | "lister" | "broker" | "service_provider" | "employer" | "admin";
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  emirate: Emirate;
  area: string;
  price: number;
  roomType: RoomType;
  photos: string[];
  amenities: string[];
  tenants: number;
  deposit: number;
  attachedBathroom: boolean;
  balcony: boolean;
  nationalityPreference: string;
  genderPreference: GenderPreference;
  distanceToMetro: number; // km
  size: number; // sqft
  listedBy: ListedBy;
  featured: boolean;
  postedAt: string;
  host: User;
  matchScore?: number; // AI-computed
}

export type EmploymentType = "Full-time" | "Part-time" | "Freelance" | "Contract" | "Internship";
export type ExperienceLevel = "Entry" | "Mid" | "Senior" | "Lead" | "Executive";

export type {
  JobApplicationMethod,
  JobApplicationQuestion,
  JobApplicationAnswers,
} from "./jobApplication";

import type {
  JobApplicationMethod,
  JobApplicationQuestion,
} from "./jobApplication";

export interface Job {
  id: string;
  title: string;
  company: string;
  /** Business profile / employer account that posted this job */
  employerId: string;
  companyLogo: string;
  emirate: Emirate;
  area: string;
  industry: string;
  employmentType: EmploymentType;
  experience: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  postedAt: string;
  featured: boolean;
  remote: boolean;
  /** Where applicants should apply — defaults to platform. */
  applicationMethod?: JobApplicationMethod;
  /** Email or URL when applying externally. */
  applicationContact?: string;
  /** Employer’s expected hire start date (ISO date). */
  startDate?: string;
  /** Screening questions for platform applications. */
  applicationQuestions?: JobApplicationQuestion[];
}

export type ServiceCategory =
  | "Electricians"
  | "Painting"
  | "Plumbing"
  | "AC Services"
  | "Cleaning"
  | "Handyman"
  | "Maintenance"
  | "Movers"
  | "Language Tutoring"
  | "Homemade Meals"
  | "Pest Control";

export type TutoringSessionFormat = "Online" | "In-person" | "Both";

export type MealOfferingType = "Single meals" | "Weekly meal plan" | "Both";
export type MealFulfillment = "Pickup" | "Delivery" | "Both";

export type ServiceProviderAccountType = "individual" | "business";

export interface Service {
  id: string;
  title: string;
  /** Display name — the verified user's name or registered business name. */
  provider: string;
  providerAvatar: string;
  /** Whether this listing was posted from a personal or business Khaleej account. */
  providerAccountType: ServiceProviderAccountType;
  /** Optional subtitle under the provider name on cards and detail pages. */
  providerHeadline?: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  unit: string;
  description: string;
  emirate: Emirate;
  photos: string[];
  verified: boolean;
  responseTime: string;
  completedJobs: number;
  sameDayAvailable?: boolean;
  durationMinutes?: number;
  featured?: boolean;
  /** Languages offered — used for Language Tutoring listings. */
  tutoringLanguages?: string[];
  /** Levels taught, e.g. Beginner, Business English. */
  teachesLevels?: string[];
  sessionFormat?: TutoringSessionFormat;
  /** Cuisines offered — used for Homemade Meals listings. */
  mealCuisines?: string[];
  /** Single orders, subscription-style plans, or both. */
  mealOfferingType?: MealOfferingType;
  mealFulfillment?: MealFulfillment;
  /** e.g. Halal, Vegetarian, Vegan. */
  dietaryTags?: string[];
  /** Pests covered — used for Pest Control listings. */
  pestTypes?: string[];
}
