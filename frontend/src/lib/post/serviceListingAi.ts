import { api, getStoredAuthToken } from "@/lib/api";
import type { ServiceCategory } from "@/types";
import type { ServiceListingFormContext } from "@/lib/post/serviceListingCatalog";
import { SERVICE_YEARS_EXPERIENCE } from "@/lib/post/serviceListingCatalog";

export type ServiceListingDescriptionResult = {
  description: string;
  source: "ai" | "template";
};

function buildTemplateDescription(ctx: ServiceListingFormContext): string {
  const provider =
    ctx.accountType === "business"
      ? ctx.providerName || "Our registered team"
      : ctx.providerName || "An experienced provider";

  const categoryIntros: Record<ServiceCategory, string> = {
    Electricians: `${provider} offers reliable electrical work across ${ctx.area}, ${ctx.emirate}.`,
    Painting: `${provider} delivers neat interior and exterior painting across ${ctx.area} and nearby communities in ${ctx.emirate}.`,
    Plumbing: `${provider} handles plumbing repairs and installations with clear upfront pricing in ${ctx.area}, ${ctx.emirate}.`,
    "AC Services": `${provider} services and repairs air-conditioning units across ${ctx.area}, ${ctx.emirate}.`,
    Cleaning: `${provider} provides professional home cleaning with quality supplies in ${ctx.area}, ${ctx.emirate}.`,
    Handyman: `${provider} takes on mounting, fixtures, and small home repairs across ${ctx.area}, ${ctx.emirate}.`,
    Maintenance: `${provider} supports homes and small businesses with maintenance visits and contracts in ${ctx.emirate}.`,
    Movers: `${provider} helps with local moves and careful packing across ${ctx.emirate}.`,
    "Language Tutoring": `${provider} offers structured language lessons tailored to your goals in ${ctx.emirate}.`,
    "Homemade Meals": `${provider} prepares fresh homemade meals for ${ctx.area} and surrounding areas in ${ctx.emirate}.`,
    "Pest Control": `${provider} provides licensed pest treatments for homes and businesses in ${ctx.emirate}.`,
  };

  const bullets: string[] = [
    `Pricing from AED ${ctx.priceFrom} per ${ctx.unit}.`,
    `Typical response time: ${ctx.responseTime}.`,
    `${SERVICE_YEARS_EXPERIENCE.find((e) => e.value === ctx.yearsExperience)?.label ?? ctx.yearsExperience} of hands-on experience.`,
  ];

  if (ctx.sameDay === "yes") bullets.push("Same-day appointments available subject to slot availability.");
  if (ctx.sameDay === "limited") bullets.push("Limited same-day slots — contact us to confirm availability.");
  if (ctx.coverage === "multi_emirate" || ctx.coverage === "uae_wide") {
    bullets.push("Coverage across multiple emirates — confirm your location when booking.");
  } else if (ctx.coverage === "full_emirate") {
    bullets.push(`Serving customers across ${ctx.emirate}.`);
  } else {
    bullets.push(`Primary coverage: ${ctx.area} and nearby areas.`);
  }

  if (ctx.tutoringLanguages?.length) {
    bullets.push(`Languages: ${ctx.tutoringLanguages.join(", ")}.`);
  }
  if (ctx.teachesLevels?.length) {
    bullets.push(`Levels: ${ctx.teachesLevels.join(", ")}.`);
  }
  if (ctx.sessionFormat) {
    bullets.push(`Sessions: ${ctx.sessionFormat}.`);
  }
  if (ctx.mealCuisines?.length) {
    bullets.push(`Cuisines: ${ctx.mealCuisines.join(", ")}.`);
  }
  if (ctx.dietaryTags?.length) {
    bullets.push(`Dietary options: ${ctx.dietaryTags.join(", ")}.`);
  }
  if (ctx.mealOfferingType) {
    bullets.push(`Offering: ${ctx.mealOfferingType}.`);
  }
  if (ctx.mealFulfillment) {
    bullets.push(`Fulfillment: ${ctx.mealFulfillment}.`);
  }
  if (ctx.pestTypes?.length) {
    bullets.push(`Treats: ${ctx.pestTypes.join(", ")}.`);
  }

  return [categoryIntros[ctx.category], "", ...bullets.map((b) => `• ${b}`)].join("\n");
}

export async function fetchServiceListingDescription(
  ctx: ServiceListingFormContext
): Promise<ServiceListingDescriptionResult> {
  const token = getStoredAuthToken();

  if (token && ctx.title && ctx.area) {
    try {
      const res = await api.serviceListingDescription(
        {
          category: ctx.category,
          title: ctx.title,
          emirate: ctx.emirate,
          area: ctx.area,
          account_type: ctx.accountType,
          provider_name: ctx.providerName || undefined,
          price_from: Number(ctx.priceFrom) || undefined,
          unit: ctx.unit,
          response_time: ctx.responseTime,
          years_experience: ctx.yearsExperience,
          coverage: ctx.coverage,
          same_day: ctx.sameDay,
          trade_licence: ctx.tradeLicence,
          tutoring_languages: ctx.tutoringLanguages,
          teaches_levels: ctx.teachesLevels,
          session_format: ctx.sessionFormat,
          meal_cuisines: ctx.mealCuisines,
          dietary_tags: ctx.dietaryTags,
          meal_offering_type: ctx.mealOfferingType,
          meal_fulfillment: ctx.mealFulfillment,
          pest_types: ctx.pestTypes,
        },
        token
      );
      if (res.data?.description) {
        return { description: res.data.description, source: "ai" };
      }
    } catch {
      /* fall through to template */
    }
  }

  return { description: buildTemplateDescription(ctx), source: "template" };
}

export function canGenerateServiceDescription(ctx: Partial<ServiceListingFormContext>): boolean {
  return Boolean(
    ctx.category &&
      ctx.title &&
      ctx.emirate &&
      ctx.area &&
      ctx.priceFrom &&
      ctx.unit &&
      ctx.responseTime &&
      ctx.yearsExperience
  );
}
