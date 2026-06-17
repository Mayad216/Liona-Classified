import type { ServiceCategory } from "@/types";

export type PostMode = "accommodation" | "job" | "service";

export type PostStepKey = "category" | "basics" | "details" | "photos" | "pricing" | "review";

export function getPostSteps(mode: PostMode): PostStepKey[] {
  const steps: PostStepKey[] = ["category", "basics", "details"];
  if (mode !== "job") steps.push("photos");
  steps.push("pricing", "review");
  return steps;
}

export function postStepLabel(key: PostStepKey): string {
  const labels: Record<PostStepKey, string> = {
    category: "Category",
    basics: "Basics",
    details: "Details",
    photos: "Photos",
    pricing: "Pricing",
    review: "Review",
  };
  return labels[key];
}

export type JobDetailsCopy = {
  headingTitle: string;
  headingSub: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  responsibilitiesLabel: string;
  responsibilitiesPlaceholder: string;
  qualificationsLabel: string;
  qualificationsPlaceholder: string;
  benefitsLabel: string;
  benefitsPlaceholder: string;
};

export const JOB_DETAILS_COPY: JobDetailsCopy = {
  headingTitle: "Role details",
  headingSub:
    "Select role, industry, and experience level — AI will draft a professional listing with detailed bullet points you can refine.",
  descriptionLabel: "Job description",
  descriptionPlaceholder:
    "Describe the role, team, and day-to-day work. Explain what success looks like in the first 90 days.",
  responsibilitiesLabel: "Key responsibilities",
  responsibilitiesPlaceholder:
    "One bullet per line — e.g.\n• Own the mobile product roadmap end-to-end\n• Run weekly stakeholder reviews with engineering and design\n• Define KPIs and report on adoption, retention, and revenue impact",
  qualificationsLabel: "Qualifications & requirements",
  qualificationsPlaceholder:
    "One requirement per line — e.g.\n• 5+ years in product management within B2B SaaS\n• Proven track record shipping user-facing products at scale\n• MBA or equivalent experience preferred; fluent English required",
  benefitsLabel: "Benefits & perks",
  benefitsPlaceholder:
    "One benefit per line — e.g.\n• Competitive tax-free salary + annual performance bonus\n• Comprehensive medical insurance for employee and dependents\n• Visa sponsorship, annual ticket, and 25 days leave",
};

export type PostBasicsCopy = {
  headingTitle: string;
  headingSub: string;
  titleLabel: string;
  titlePlaceholder: string;
  areaLabel: string;
  areaPlaceholder: string;
  descriptionPlaceholder: string;
};

export type PostPhotosCopy = {
  headingSub: string;
  coverPhotoLabel: string;
  photoHint: string;
  aiHint: string;
};

export type ServicePostCopy = {
  headingTitle: string;
  headingSub: string;
  pricePlaceholder: string;
  unitPlaceholder: string;
  responseTimePlaceholder: string;
  individualNamePlaceholder: string;
  businessNamePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
};

const MODE_BASICS: Record<PostMode, PostBasicsCopy> = {
  accommodation: {
    headingTitle: "The basics",
    headingSub: "Give your listing a clear title and choose the right area.",
    titleLabel: "Title",
    titlePlaceholder: "e.g. Modern Bedspace in Dubai Marina",
    areaLabel: "Area / neighborhood",
    areaPlaceholder: "e.g. Dubai Marina",
    descriptionPlaceholder:
      "Tell tenants about the space, the vibe, house rules, and what's nearby.",
  },
  job: {
    headingTitle: "The basics",
    headingSub: "Pick the role and location — you'll add full details on the next step.",
    titleLabel: "Role",
    titlePlaceholder: "e.g. Senior Product Manager — Fintech",
    areaLabel: "Work location",
    areaPlaceholder: "e.g. DIFC, Dubai or Remote",
    descriptionPlaceholder:
      "Describe the role, day-to-day work, team culture, benefits, and who you're looking for.",
  },
  service: {
    headingTitle: "The basics",
    headingSub:
      "Choose a title, emirate, and primary area from the lists — you'll set pricing and generate your description on the next step.",
    titleLabel: "Listing title",
    titlePlaceholder: "e.g. Same-day AC repair — all brands serviced",
    areaLabel: "Areas you cover",
    areaPlaceholder: "e.g. Marina, JLT, Business Bay",
    descriptionPlaceholder:
      "Describe your service, what's included, your experience, availability, and coverage areas.",
  },
};

const SERVICE_BASICS_OVERRIDES: Partial<Record<ServiceCategory, Partial<PostBasicsCopy>>> = {
  Electricians: {
    titlePlaceholder: "e.g. Licensed electrician — wiring, DB faults & 24h call-out",
    descriptionPlaceholder:
      "List electrical work you handle, brands you service, emergency availability, and areas covered.",
  },
  Painting: {
    titlePlaceholder: "e.g. Interior & exterior painting — villas & apartments",
    descriptionPlaceholder:
      "Mention paint types, prep work included, typical project sizes, and neighborhoods you serve.",
  },
  Plumbing: {
    titlePlaceholder: "e.g. Emergency plumber — leaks, heaters & bathroom fit-outs",
    descriptionPlaceholder:
      "Describe plumbing jobs you take, response times, parts policy, and emirates or areas covered.",
  },
  "AC Services": {
    titlePlaceholder: "e.g. AC service & repair — duct, split & window units",
    descriptionPlaceholder:
      "Include brands serviced, gas top-ups, maintenance plans, and same-day slots if available.",
  },
  Cleaning: {
    titlePlaceholder: "e.g. Deep cleaning — studios to villas, eco products",
    descriptionPlaceholder:
      "Explain cleaning types, supplies included, team size, and move-in/out or recurring options.",
  },
  Handyman: {
    titlePlaceholder: "e.g. Handyman — mounting, shelves, fixtures & small repairs",
    descriptionPlaceholder:
      "List typical jobs, tools you bring, hourly or fixed pricing, and areas you can reach.",
  },
  Maintenance: {
    titlePlaceholder: "e.g. Home maintenance — annual contracts & one-off repairs",
    descriptionPlaceholder:
      "Describe upkeep services, contract options, response SLAs, and property types you support.",
  },
  Movers: {
    titlePlaceholder: "e.g. Movers & packers — local & inter-emirate relocations",
    descriptionPlaceholder:
      "Include truck sizes, packing materials, insurance, and typical routes or emirates served.",
  },
  "Language Tutoring": {
    titlePlaceholder: "e.g. IELTS & business English tutor — online & in-person",
    areaPlaceholder: "e.g. Marina, JLT or Online only",
    descriptionPlaceholder:
      "Introduce your teaching style, certifications, languages, levels, and session formats.",
  },
  "Homemade Meals": {
    titlePlaceholder: "e.g. Homemade Kerala meals — daily lunch boxes & weekly plans",
    areaPlaceholder: "e.g. Discovery Gardens, JVC — pickup & delivery",
    descriptionPlaceholder:
      "Describe your menu, cuisines, dietary options, portion sizes, and pickup or delivery areas.",
  },
  "Pest Control": {
    titlePlaceholder: "e.g. Licensed pest control — cockroaches, bed bugs & annual contracts",
    descriptionPlaceholder:
      "List pests treated, treatment methods, warranty period, and residential or commercial coverage.",
  },
};

const MODE_PHOTOS: Record<PostMode, PostPhotosCopy> = {
  accommodation: {
    headingSub: "Listings with 5+ photos get 3× more views — show the room, building, and area.",
    coverPhotoLabel: "Cover photo",
    photoHint: "Photo",
    aiHint:
      "Our AI will automatically remove blurry shots and suggest a cover photo for maximum engagement.",
  },
  job: {
    headingSub: "Add your office, workspace, or logo — job posts with photos get more applicants.",
    coverPhotoLabel: "Cover image",
    photoHint: "Photo",
    aiHint: "Use a clear logo or workplace photo as your cover — we'll optimize it for listings.",
  },
  service: {
    headingSub: "Show your work — before/after shots and clear photos build trust fast.",
    coverPhotoLabel: "Cover photo",
    photoHint: "Photo",
    aiHint:
      "Our AI will flag blurry shots and suggest your strongest photo as the cover image.",
  },
};

const SERVICE_PHOTOS_OVERRIDES: Partial<Record<ServiceCategory, Partial<PostPhotosCopy>>> = {
  Cleaning: {
    headingSub: "Before/after photos and your kit help clients book with confidence.",
  },
  Painting: {
    headingSub: "Show finished rooms and colour work — visual proof wins painting jobs.",
  },
  "Homemade Meals": {
    headingSub: "Appetizing dish photos drive orders — show portions and packaging.",
    coverPhotoLabel: "Signature dish",
  },
  "Language Tutoring": {
    headingSub: "A friendly headshot or online-teaching setup helps learners choose you.",
    coverPhotoLabel: "Profile photo",
  },
  Movers: {
    headingSub: "Photos of your truck, team, and packing materials reassure customers.",
  },
  "Pest Control": {
    headingSub: "Optional — equipment, certification, or treatment photos add credibility.",
  },
};

export const SERVICE_POST_COPY: Record<ServiceCategory, ServicePostCopy> = {
  Electricians: {
    headingTitle: "Electrician listing",
    headingSub: "Licensed sparkies and freelancers — list wiring, faults, and call-out coverage.",
    pricePlaceholder: "120",
    unitPlaceholder: "visit, hour, job",
    responseTimePlaceholder: "< 1 hour",
    individualNamePlaceholder: "Ahmed Hassan",
    businessNamePlaceholder: "BrightSpark Electrical LLC",
  },
  Painting: {
    headingTitle: "Painting listing",
    headingSub: "Interior, exterior, and touch-ups — say what's included in your quote.",
    pricePlaceholder: "350",
    unitPlaceholder: "room, sqft, job",
    responseTimePlaceholder: "< 2 hours",
    individualNamePlaceholder: "Carlos Mendez",
    businessNamePlaceholder: "ProCoat Painting UAE",
  },
  Plumbing: {
    headingTitle: "Plumbing listing",
    headingSub: "Leaks, heaters, blockages — mention emergency slots and areas you reach.",
    pricePlaceholder: "99",
    unitPlaceholder: "visit, hour, job",
    responseTimePlaceholder: "< 45 min",
    individualNamePlaceholder: "Ravi Patel",
    businessNamePlaceholder: "FlowFix Plumbing",
  },
  "AC Services": {
    headingTitle: "AC service listing",
    headingSub: "Service, repair, and gas — list brands, unit types, and contract options.",
    pricePlaceholder: "149",
    unitPlaceholder: "unit, visit, year",
    responseTimePlaceholder: "< 2 hours",
    individualNamePlaceholder: "Mohammed Ali",
    businessNamePlaceholder: "CoolAir Technical Services",
  },
  Cleaning: {
    headingTitle: "Cleaning listing",
    headingSub: "Home, deep, and move-in/out — note supplies, team size, and recurring slots.",
    pricePlaceholder: "79",
    unitPlaceholder: "hour, visit, 1BR",
    responseTimePlaceholder: "< 1 hour",
    individualNamePlaceholder: "Maria Santos",
    businessNamePlaceholder: "SparkleHome Cleaning",
  },
  Handyman: {
    headingTitle: "Handyman listing",
    headingSub: "Mounting, fixtures, and small jobs — be clear on what's in scope.",
    pricePlaceholder: "75",
    unitPlaceholder: "hour, job, visit",
    responseTimePlaceholder: "< 2 hours",
    individualNamePlaceholder: "James Okonkwo",
    businessNamePlaceholder: "FixIt Handyman Dubai",
  },
  Maintenance: {
    headingTitle: "Maintenance listing",
    headingSub: "General upkeep and repairs — mention contracts, SLAs, and property types.",
    pricePlaceholder: "199",
    unitPlaceholder: "visit, month, job",
    responseTimePlaceholder: "< 4 hours",
    individualNamePlaceholder: "Sanjay Verma",
    businessNamePlaceholder: "HomeCare Maintenance LLC",
  },
  Movers: {
    headingTitle: "Movers listing",
    headingSub: "Local moves, packing, and delivery — include truck size and routes covered.",
    pricePlaceholder: "299",
    unitPlaceholder: "move, hour, truck",
    responseTimePlaceholder: "< 24 hours",
    individualNamePlaceholder: "Hassan Ibrahim",
    businessNamePlaceholder: "SwiftMove Packers UAE",
  },
  "Language Tutoring": {
    headingTitle: "Tutoring profile",
    headingSub: "Tell learners which languages you teach, your levels, and how you deliver lessons.",
    pricePlaceholder: "89",
    unitPlaceholder: "hour",
    responseTimePlaceholder: "< 2 hours",
    individualNamePlaceholder: "Sarah Chen",
    businessNamePlaceholder: "Lingua Academy Dubai",
  },
  "Homemade Meals": {
    headingTitle: "Homemade meals listing",
    headingSub: "Home cooks and small kitchens welcome — list single meals, weekly plans, or both.",
    pricePlaceholder: "22",
    unitPlaceholder: "meal, week, portion",
    responseTimePlaceholder: "< 1 hour",
    individualNamePlaceholder: "Priya Nair",
    businessNamePlaceholder: "Kitchen of Kerala",
  },
  "Pest Control": {
    headingTitle: "Pest control listing",
    headingSub: "List treatments you offer — cockroaches, bed bugs, rodents, annual contracts, and more.",
    pricePlaceholder: "149",
    unitPlaceholder: "visit, year",
    responseTimePlaceholder: "< 4 hours",
    individualNamePlaceholder: "Omar Farouk",
    businessNamePlaceholder: "SafeGuard Pest Control",
  },
};

export function getBasicsCopy(
  mode: PostMode,
  serviceCategory?: ServiceCategory | null
): PostBasicsCopy {
  const base = MODE_BASICS[mode];
  if (mode !== "service" || !serviceCategory) return base;

  const override = SERVICE_BASICS_OVERRIDES[serviceCategory];
  return override ? { ...base, ...override } : base;
}

export function getPhotosCopy(
  mode: PostMode,
  serviceCategory?: ServiceCategory | null
): PostPhotosCopy {
  const base = MODE_PHOTOS[mode];
  if (mode !== "service" || !serviceCategory) return base;

  const override = SERVICE_PHOTOS_OVERRIDES[serviceCategory];
  return override ? { ...base, ...override } : base;
}

export function getServicePostCopy(category: ServiceCategory): ServicePostCopy {
  return {
    descriptionLabel: "Service description",
    descriptionPlaceholder:
      "Describe what's included, your experience, availability, and areas you serve. Generate a draft with AI after filling the fields above.",
    ...SERVICE_POST_COPY[category],
  };
}
