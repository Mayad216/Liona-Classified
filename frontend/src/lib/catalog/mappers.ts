import type {
  Emirate,
  EmploymentType,
  ExperienceLevel,
  GenderPreference,
  Job,
  ListedBy,
  Listing,
  RoomType,
  Service,
  ServiceCategory,
  User,
} from "@/types";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80";
const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

const SERVICE_CATEGORY_MAP: Record<string, ServiceCategory> = {
  "AC Repair": "AC Services",
  Moving: "Movers",
  Cleaning: "Cleaning",
  Plumbing: "Plumbing",
  Painting: "Painting",
  "Pest Control": "Pest Control",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return Boolean(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function extractRows<T = unknown>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const row = asRecord(payload);
  if (Array.isArray(row.data)) return row.data as T[];
  return [];
}

function mapHost(raw: unknown): User {
  const h = asRecord(raw);
  return {
    id: asString(h.id, "0"),
    name: asString(h.name, "Host"),
    avatar: asString(h.avatar, DEFAULT_AVATAR),
    verified: asBool(h.is_verified ?? h.verified),
    rating: asNumber(h.rating),
    joinedAt: asString(h.created_at ?? h.joinedAt, new Date().toISOString()),
    role: (asString(h.role, "lister") as User["role"]) || "lister",
  };
}

export function mapListing(raw: unknown): Listing {
  const row = asRecord(raw);
  const photos = asStringArray(row.photos);
  return {
    id: asString(row.id),
    title: asString(row.title, "Listing"),
    description: asString(row.description),
    emirate: asString(row.emirate, "Dubai") as Emirate,
    area: asString(row.area, "Dubai"),
    price: asNumber(row.price),
    roomType: asString(row.room_type ?? row.roomType, "Private Room") as RoomType,
    photos: photos.length ? photos : [DEFAULT_PHOTO],
    amenities: asStringArray(row.amenities),
    tenants: asNumber(row.tenants_count ?? row.tenants, 1),
    deposit: asNumber(row.deposit),
    attachedBathroom: asBool(row.attached_bathroom ?? row.attachedBathroom),
    balcony: asBool(row.balcony),
    nationalityPreference: asString(row.nationality_preference ?? row.nationalityPreference, "Any"),
    genderPreference: asString(
      row.gender_preference ?? row.genderPreference,
      "Any"
    ) as GenderPreference,
    distanceToMetro: asNumber(row.distance_to_metro_km ?? row.distanceToMetro),
    size: asNumber(row.size_sqft ?? row.size, 500),
    listedBy: asString(row.listed_by ?? row.listedBy, "Tenant") as ListedBy,
    featured: asBool(row.is_featured ?? row.featured),
    postedAt: asString(row.created_at ?? row.postedAt, new Date().toISOString()),
    host: mapHost(row.host),
  };
}

export function mapJob(raw: unknown): Job {
  const row = asRecord(raw);
  const employer = asRecord(row.employer);
  return {
    id: asString(row.id),
    title: asString(row.title, "Role"),
    company: asString(row.company, "Company"),
    employerId: asString(row.employer_id ?? row.employerId ?? employer.id),
    companyLogo: asString(
      row.company_logo ?? row.companyLogo ?? employer.avatar,
      DEFAULT_AVATAR
    ),
    emirate: asString(row.emirate, "Dubai") as Emirate,
    area: asString(row.area, ""),
    industry: asString(row.industry, "General"),
    employmentType: asString(
      row.employment_type ?? row.employmentType,
      "Full-time"
    ) as EmploymentType,
    experience: asString(row.experience_level ?? row.experience, "Mid") as ExperienceLevel,
    salaryMin: asNumber(row.salary_min ?? row.salaryMin),
    salaryMax: asNumber(row.salary_max ?? row.salaryMax),
    description: asString(row.description),
    responsibilities: asStringArray(row.responsibilities),
    requirements: asStringArray(row.requirements),
    benefits: asStringArray(row.benefits),
    postedAt: asString(row.created_at ?? row.postedAt, new Date().toISOString()),
    featured: asBool(row.is_featured ?? row.featured),
    remote: asBool(row.remote),
    applicationMethod: (row.application_method ?? row.applicationMethod) as Job["applicationMethod"],
    applicationContact: asString(row.application_contact ?? row.applicationContact) || undefined,
    startDate: asString(row.start_date ?? row.startDate) || undefined,
    applicationQuestions: Array.isArray(row.application_questions)
      ? (row.application_questions as Job["applicationQuestions"])
      : undefined,
  };
}

export function mapService(raw: unknown): Service {
  const row = asRecord(raw);
  const provider = asRecord(row.provider);
  const categoryRaw = asString(row.category, "Cleaning");
  return {
    id: asString(row.id),
    title: asString(row.title, "Service"),
    provider: asString(provider.name ?? row.provider_name, "Provider"),
    providerAvatar: asString(provider.avatar ?? row.provider_avatar, DEFAULT_AVATAR),
    providerAccountType: "individual",
    category: (SERVICE_CATEGORY_MAP[categoryRaw] ?? categoryRaw) as ServiceCategory,
    rating: asNumber(row.rating, 4.5),
    reviewCount: asNumber(row.review_count ?? row.reviewCount),
    priceFrom: asNumber(row.price_from ?? row.priceFrom),
    unit: asString(row.unit, "visit"),
    description: asString(row.description),
    emirate: asString(row.emirate, "Dubai") as Emirate,
    photos: asStringArray(row.photos).length
      ? asStringArray(row.photos)
      : [DEFAULT_PHOTO],
    verified: asBool(row.is_verified ?? row.verified ?? provider.is_verified),
    responseTime: asString(row.response_time ?? row.responseTime, "< 1 hour"),
    completedJobs: asNumber(row.completed_jobs ?? row.completedJobs),
    featured: asBool(row.is_featured ?? row.featured),
  };
}
