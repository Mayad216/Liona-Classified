import type { Emirate, ServiceCategory } from "@/types";

export const SERVICE_RESPONSE_TIMES = [
  { value: "< 1 hour", label: "Within 1 hour" },
  { value: "< 2 hours", label: "Within 2 hours" },
  { value: "< 4 hours", label: "Within 4 hours" },
  { value: "Same day", label: "Same day" },
  { value: "< 24 hours", label: "Within 24 hours" },
  { value: "Within 48 hours", label: "Within 48 hours" },
  { value: "By appointment", label: "By appointment only" },
] as const;

export const SERVICE_YEARS_EXPERIENCE = [
  { value: "1-2", label: "1–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+", label: "10+ years" },
  { value: "15+", label: "15+ years" },
] as const;

export const SERVICE_TRADE_LICENCE_OPTIONS = [
  { value: "registered", label: "Registered — trade licence on file" },
  { value: "in_progress", label: "Licence application in progress" },
  { value: "not_applicable", label: "Not applicable (individual provider)" },
] as const;

export const SERVICE_SAME_DAY_OPTIONS = [
  { value: "yes", label: "Same-day slots available" },
  { value: "limited", label: "Limited same-day (call first)" },
  { value: "no", label: "Advance booking only" },
] as const;

export const SERVICE_COVERAGE_OPTIONS = [
  { value: "single_area", label: "Single neighborhood" },
  { value: "multi_area", label: "Multiple areas in emirate" },
  { value: "full_emirate", label: "Full emirate" },
  { value: "multi_emirate", label: "Multiple emirates" },
  { value: "uae_wide", label: "UAE-wide" },
  { value: "online_only", label: "Online only (no travel)" },
] as const;

export const SERVICE_PROVIDER_NAME_MODES = [
  { value: "profile", label: "Use my Khaleej profile name" },
  { value: "custom", label: "Custom display name" },
] as const;

const UNITS_BY_CATEGORY: Record<ServiceCategory, string[]> = {
  Electricians: ["visit", "hour", "job", "inspection"],
  Painting: ["sqft", "room", "project", "hour"],
  Plumbing: ["visit", "hour", "job", "emergency call-out"],
  "AC Services": ["unit", "visit", "service", "hour"],
  Cleaning: ["hour", "visit", "session", "sqft"],
  Handyman: ["hour", "job", "visit"],
  Maintenance: ["visit", "month", "contract", "job"],
  Movers: ["hour", "move", "truck load", "room"],
  "Language Tutoring": ["hour", "session", "month", "package"],
  "Homemade Meals": ["meal", "portion", "week", "monthly plan"],
  "Pest Control": ["visit", "treatment", "year", "contract"],
};

const PRICES_BY_CATEGORY: Record<ServiceCategory, { value: string; label: string }[]> = {
  Electricians: [
    { value: "99", label: "From AED 99" },
    { value: "149", label: "From AED 149" },
    { value: "199", label: "From AED 199" },
    { value: "249", label: "From AED 249" },
    { value: "350", label: "From AED 350" },
  ],
  Painting: [
    { value: "15", label: "From AED 15 / sqft" },
    { value: "25", label: "From AED 25 / sqft" },
    { value: "500", label: "From AED 500 / room" },
    { value: "1500", label: "From AED 1,500 / project" },
  ],
  Plumbing: [
    { value: "99", label: "From AED 99" },
    { value: "149", label: "From AED 149" },
    { value: "199", label: "From AED 199" },
    { value: "299", label: "From AED 299" },
  ],
  "AC Services": [
    { value: "79", label: "From AED 79 / unit" },
    { value: "99", label: "From AED 99 / unit" },
    { value: "149", label: "From AED 149 / visit" },
    { value: "199", label: "From AED 199 / service" },
  ],
  Cleaning: [
    { value: "35", label: "From AED 35 / hour" },
    { value: "149", label: "From AED 149 / visit" },
    { value: "199", label: "From AED 199 / deep clean" },
    { value: "299", label: "From AED 299 / villa" },
  ],
  Handyman: [
    { value: "75", label: "From AED 75 / hour" },
    { value: "99", label: "From AED 99 / hour" },
    { value: "149", label: "From AED 149 / job" },
  ],
  Maintenance: [
    { value: "149", label: "From AED 149 / visit" },
    { value: "199", label: "From AED 199 / month" },
    { value: "399", label: "From AED 399 / contract" },
  ],
  Movers: [
    { value: "199", label: "From AED 199 / hour" },
    { value: "299", label: "From AED 299 / move" },
    { value: "499", label: "From AED 499 / truck" },
    { value: "899", label: "From AED 899 / villa move" },
  ],
  "Language Tutoring": [
    { value: "75", label: "From AED 75 / hour" },
    { value: "89", label: "From AED 89 / hour" },
    { value: "120", label: "From AED 120 / hour" },
    { value: "350", label: "From AED 350 / month" },
  ],
  "Homemade Meals": [
    { value: "18", label: "From AED 18 / meal" },
    { value: "22", label: "From AED 22 / meal" },
    { value: "35", label: "From AED 35 / portion" },
    { value: "199", label: "From AED 199 / week" },
  ],
  "Pest Control": [
    { value: "149", label: "From AED 149 / visit" },
    { value: "199", label: "From AED 199 / treatment" },
    { value: "499", label: "From AED 499 / year" },
    { value: "899", label: "From AED 899 / contract" },
  ],
};

const TITLES_BY_CATEGORY: Record<ServiceCategory, string[]> = {
  Electricians: [
    "Licensed electrician — wiring, DB faults & 24h call-out",
    "Home electrical repairs — lights, sockets & tripping issues",
    "Commercial electrician — fit-outs & maintenance",
    "Emergency electrician — same-day response",
  ],
  Painting: [
    "Interior & exterior painting — villas & apartments",
    "Wall preparation, painting & touch-ups",
    "Office & shop repaint — minimal downtime",
    "Premium finish painting — bedrooms, living areas & kitchens",
  ],
  Plumbing: [
    "Emergency plumber — leaks, blockages & burst pipes",
    "Bathroom & kitchen plumbing installations",
    "Water heater repair & replacement",
    "Full villa plumbing maintenance",
  ],
  "AC Services": [
    "AC service & repair — split, duct & window units",
    "Same-day AC gas top-up & deep cleaning",
    "Annual AC maintenance contracts",
    "Commercial AC servicing — offices & retail",
  ],
  Cleaning: [
    "Deep cleaning — studios to villas",
    "Move-in / move-out cleaning",
    "Regular home cleaning — weekly or bi-weekly",
    "Eco-friendly cleaning with own supplies",
  ],
  Handyman: [
    "Handyman — mounting, shelves, fixtures & small repairs",
    "Furniture assembly & TV wall mounting",
    "Curtain, blind & picture hanging",
    "General home fixes — doors, hinges & silicone",
  ],
  Maintenance: [
    "Home maintenance — annual contracts & one-off repairs",
    "Property upkeep for landlords & tenants",
    "AMC — air conditioning, plumbing & electrical",
    "Facility maintenance — offices & shops",
  ],
  Movers: [
    "Movers & packers — local relocations",
    "Inter-emirate moving — Dubai, Abu Dhabi & Sharjah",
    "Furniture delivery & single-item moves",
    "Office relocation — packing included",
  ],
  "Language Tutoring": [
    "IELTS & exam prep — English & Arabic",
    "Business English tutor — online & in-person",
    "Kids language tutoring — after-school sessions",
    "Conversational Arabic for professionals",
  ],
  "Homemade Meals": [
    "Homemade daily lunch boxes — pickup & delivery",
    "Weekly meal plan — healthy home cooking",
    "Regional cuisine — single orders & subscriptions",
    "Party catering — small batches from home kitchen",
  ],
  "Pest Control": [
    "Licensed pest control — cockroaches, ants & rodents",
    "Bed bug treatment — inspection & follow-up",
    "Annual pest control contracts — villas & apartments",
    "Commercial pest management — F&B & retail",
  ],
};

export function serviceTitleOptions(category: ServiceCategory) {
  return TITLES_BY_CATEGORY[category].map((title) => ({ value: title, label: title }));
}

export function servicePriceOptions(category: ServiceCategory) {
  return PRICES_BY_CATEGORY[category];
}

export function serviceUnitOptions(category: ServiceCategory) {
  return UNITS_BY_CATEGORY[category].map((unit) => ({ value: unit, label: `Per ${unit}` }));
}

export function serviceEmirateOptions() {
  const emirates: Emirate[] = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
  ];
  return emirates.map((e) => ({ value: e, label: e }));
}

export function serviceAreaOptions(emirate: Emirate, areas: readonly string[]) {
  return areas.map((area) => ({ value: area, label: area }));
}

export type ServiceListingFormContext = {
  category: ServiceCategory;
  title: string;
  emirate: Emirate;
  area: string;
  accountType: "individual" | "business";
  providerName: string;
  priceFrom: string;
  unit: string;
  responseTime: string;
  yearsExperience: string;
  coverage: string;
  sameDay: string;
  tradeLicence: string;
  tutoringLanguages?: string[];
  teachesLevels?: string[];
  sessionFormat?: string;
  mealCuisines?: string[];
  dietaryTags?: string[];
  mealOfferingType?: string;
  mealFulfillment?: string;
  pestTypes?: string[];
};
