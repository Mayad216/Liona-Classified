import type { AreaInsight } from "@/types/areaInsights";
import type { RoommateProfile } from "@/lib/matchmaking/types";
import { hydrateResidenceFields } from "@/lib/matchmaking/residenceHistory";
import {
  listingMatchesLocation,
  type LocationPreference,
} from "@/lib/matchmaking/uaeLocations";

export type AreaReviewEligibility =
  | {
      eligible: true;
      residenceStatus: "current" | "past";
      matchedAs: string;
    }
  | {
      eligible: false;
      reason: "no_residence_history" | "no_match";
    };

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildingNamesMatch(userBuilding: string, placeName: string): boolean {
  const a = normalizeName(userBuilding);
  const b = normalizeName(placeName);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function neighborhoodMatches(
  userLoc: LocationPreference,
  insight: Pick<AreaInsight, "name" | "emirate">
): boolean {
  if (userLoc.emirate !== insight.emirate) return false;
  if (!userLoc.area) return false;

  return listingMatchesLocation(
    { emirate: insight.emirate, area: insight.name },
    { emirate: userLoc.emirate, area: userLoc.area }
  );
}

function hasAnyResidenceHistory(profile: RoommateProfile): boolean {
  const hydrated = hydrateResidenceFields(profile);
  return Boolean(
    hydrated.currentNeighborhood ||
      (hydrated.previousNeighborhoods?.length ?? 0) > 0 ||
      hydrated.currentBuilding ||
      (hydrated.previousBuildings?.length ?? 0) > 0
  );
}

export function checkAreaReviewEligibility(
  profile: RoommateProfile,
  insight: Pick<AreaInsight, "name" | "type" | "emirate">
): AreaReviewEligibility {
  const hydrated = hydrateResidenceFields(profile);

  if (insight.type === "building") {
    if (
      hydrated.currentBuilding &&
      buildingNamesMatch(hydrated.currentBuilding, insight.name)
    ) {
      return {
        eligible: true,
        residenceStatus: "current",
        matchedAs: hydrated.currentBuilding,
      };
    }

    const pastBuilding = hydrated.previousBuildings?.find((name) =>
      buildingNamesMatch(name, insight.name)
    );
    if (pastBuilding) {
      return {
        eligible: true,
        residenceStatus: "past",
        matchedAs: pastBuilding,
      };
    }

    return {
      eligible: false,
      reason: hasAnyResidenceHistory(hydrated) ? "no_match" : "no_residence_history",
    };
  }

  if (
    hydrated.currentNeighborhood &&
    neighborhoodMatches(hydrated.currentNeighborhood, insight)
  ) {
    const label = hydrated.currentNeighborhood.area
      ? `${hydrated.currentNeighborhood.emirate} · ${hydrated.currentNeighborhood.area}`
      : hydrated.currentNeighborhood.emirate;
    return {
      eligible: true,
      residenceStatus: "current",
      matchedAs: label,
    };
  }

  const pastNeighborhood = hydrated.previousNeighborhoods?.find((loc) =>
    neighborhoodMatches(loc, insight)
  );
  if (pastNeighborhood) {
    const label = pastNeighborhood.area
      ? `${pastNeighborhood.emirate} · ${pastNeighborhood.area}`
      : pastNeighborhood.emirate;
    return {
      eligible: true,
      residenceStatus: "past",
      matchedAs: label,
    };
  }

  return {
    eligible: false,
    reason: hasAnyResidenceHistory(hydrated) ? "no_match" : "no_residence_history",
  };
}
