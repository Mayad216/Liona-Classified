import {
  BadgeCheck,
  BookOpen,
  Bug,
  ChefHat,
  Clock,
  Droplets,
  Hammer,
  PaintBucket,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import type { Emirate, Service, ServiceCategory, ServiceProviderAccountType } from "@/types";

export type ServiceFilterCategory = ServiceCategory | "All";

export const SERVICE_EMIRATES: (Emirate | "All UAE")[] = [
  "All UAE",
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

export const SERVICE_CATEGORIES: {
  key: ServiceCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
}[] = [
  {
    key: "Electricians",
    label: "Electricians",
    description: "Wiring, lights & power faults",
    icon: Zap,
    popular: true,
  },
  {
    key: "Painting",
    label: "Painting",
    description: "Interior & exterior repaint",
    icon: PaintBucket,
    popular: true,
  },
  {
    key: "Plumbing",
    label: "Plumbing",
    description: "Leaks, heaters & bathrooms",
    icon: Droplets,
    popular: true,
  },
  {
    key: "AC Services",
    label: "AC Services",
    description: "Service, repair & gas top-up",
    icon: Snowflake,
    popular: true,
  },
  {
    key: "Cleaning",
    label: "Cleaning",
    description: "Home, deep & move-in/out",
    icon: Sparkles,
    popular: true,
  },
  {
    key: "Handyman",
    label: "Handyman",
    description: "Mounting, fixtures & small jobs",
    icon: Hammer,
    popular: true,
  },
  {
    key: "Maintenance",
    label: "Maintenance",
    description: "General home upkeep & repairs",
    icon: Wrench,
    popular: true,
  },
  {
    key: "Movers",
    label: "Movers",
    description: "Movers, packers & delivery",
    icon: Truck,
    popular: true,
  },
  {
    key: "Language Tutoring",
    label: "Language Tutoring",
    description: "Private tutors — online & in-person",
    icon: BookOpen,
    popular: true,
  },
  {
    key: "Homemade Meals",
    label: "Homemade Meals",
    description: "Home cooks & small meal plans",
    icon: ChefHat,
    popular: true,
  },
  {
    key: "Pest Control",
    label: "Pest Control",
    description: "Cockroaches, bed bugs, rodents & more",
    icon: Bug,
    popular: true,
  },
];

export const PEST_TYPES = [
  "Cockroaches",
  "Bed bugs",
  "Ants",
  "Rodents",
  "Termites",
  "Mosquitoes",
  "Flies",
  "Wasps",
  "Silverfish",
  "General spray",
] as const;

export const TUTORING_LANGUAGES = [
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "French",
  "Spanish",
  "German",
  "Mandarin",
  "Russian",
  "Tagalog",
  "Malayalam",
  "Tamil",
  "Bengali",
  "Persian",
  "Turkish",
  "Japanese",
  "Korean",
  "Portuguese",
  "Italian",
] as const;

export const TUTORING_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Kids",
  "Business",
  "Exam prep",
] as const;

export const MEAL_CUISINES = [
  "Indian",
  "Pakistani",
  "Filipino",
  "Arabic",
  "Lebanese",
  "Chinese",
  "Italian",
  "Kerala",
  "South Indian",
  "Continental",
  "Healthy / Fitness",
  "Emirati",
] as const;

export const MEAL_DIETARY_TAGS = [
  "Halal",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Low-carb",
  "Diabetic-friendly",
  "Kids meals",
] as const;

export const MEAL_OFFERING_TYPES = ["Single meals", "Weekly meal plan", "Both"] as const;

export const MEAL_FULFILLMENT_OPTIONS = ["Pickup", "Delivery", "Both"] as const;

export function providerAccountLabel(type: ServiceProviderAccountType): string {
  return type === "business" ? "Business account" : "Individual";
}

/** Canonical detail URL for any home-service listing. */
export function serviceDetailPath(serviceId: string): string {
  return `/services/${encodeURIComponent(serviceId)}`;
}

export const SERVICE_TRUST_PILLARS = [
  {
    icon: Star,
    title: "4.8+ rated listings",
    sub: "Reviews from real bookings across the UAE",
  },
  {
    icon: Clock,
    title: "Same-day slots",
    sub: "Book in under 60 seconds, often today",
  },
  {
    icon: ShieldCheck,
    title: "Money-back guarantee",
    sub: "Re-do or refund if you're not satisfied",
  },
  {
    icon: BadgeCheck,
    title: "Individuals & businesses",
    sub: "Every listing is posted by a verified personal or business account",
  },
];

export const SERVICE_BOOKING_SLOTS = [
  { id: "today_4pm", label: "Today · 4:00 PM", sameDay: true },
  { id: "today_6pm", label: "Today · 6:00 PM", sameDay: true },
  { id: "tomorrow_10am", label: "Tomorrow · 10:00 AM", sameDay: false },
  { id: "tomorrow_2pm", label: "Tomorrow · 2:00 PM", sameDay: false },
  { id: "tomorrow_6pm", label: "Tomorrow · 6:00 PM", sameDay: false },
  { id: "thu_9am", label: "Thu · 9:00 AM", sameDay: false },
] as const;

export const SERVICE_HIGHLIGHTS = [
  "All tools & supplies included",
  "Eco-friendly products available",
  "Re-do guarantee within 48h",
  "Verified Khaleej account",
  "Insured for accidental damage",
  "Clear upfront pricing",
];

export function filterServices(
  services: Service[],
  opts: {
    category?: ServiceFilterCategory;
    emirate?: Emirate | "All UAE";
    query?: string;
    language?: string;
    cuisine?: string;
  }
): Service[] {
  const q = opts.query?.trim().toLowerCase() ?? "";
  const language = opts.language?.trim().toLowerCase() ?? "";
  const cuisine = opts.cuisine?.trim().toLowerCase() ?? "";

  return services.filter((s) => {
    if (opts.category && opts.category !== "All" && s.category !== opts.category) {
      return false;
    }
    if (opts.emirate && opts.emirate !== "All UAE" && s.emirate !== opts.emirate) {
      return false;
    }
    if (language && language !== "all") {
      const langs = s.tutoringLanguages ?? [];
      if (!langs.some((l) => l.toLowerCase() === language)) return false;
    }
    if (cuisine && cuisine !== "all") {
      const cuisines = s.mealCuisines ?? [];
      if (!cuisines.some((c) => c.toLowerCase() === cuisine)) return false;
    }
    if (q) {
      const haystack = [
        s.title,
        s.provider,
        s.category,
        s.emirate,
        ...(s.tutoringLanguages ?? []),
        ...(s.teachesLevels ?? []),
        s.sessionFormat ?? "",
        ...(s.mealCuisines ?? []),
        ...(s.dietaryTags ?? []),
        s.mealOfferingType ?? "",
        s.mealFulfillment ?? "",
        ...(s.pestTypes ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function minPriceForCategory(
  services: Service[],
  category: ServiceCategory
): number | null {
  const prices = services.filter((s) => s.category === category).map((s) => s.priceFrom);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/** Lowest `priceFrom` per category, derived only from live listings. */
export function categoryStartingPrices(
  services: Service[]
): Partial<Record<ServiceCategory, number>> {
  const prices: Partial<Record<ServiceCategory, number>> = {};
  for (const { key } of SERVICE_CATEGORIES) {
    const min = minPriceForCategory(services, key);
    if (min !== null) prices[key] = min;
  }
  return prices;
}

export function featuredServices(services: Service[], limit = 4): Service[] {
  return [...services]
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}
