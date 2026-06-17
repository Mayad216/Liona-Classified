import type { Preferences, RoommateProfile } from "./types";
import {
  normalizeLocationPreferences,
  type LocationPreference,
} from "./uaeLocations";

export const RESIDENCE_PREF_KEYS = {
  currentNeighborhood: "residence_current_neighborhood",
  previousNeighborhoods: "residence_previous_neighborhoods",
  currentBuilding: "residence_current_building",
  previousBuildings: "residence_previous_buildings",
} as const;

export function normalizeSingleLocation(value: unknown): LocationPreference | undefined {
  if (value && typeof value === "object" && "emirate" in value) {
    return normalizeLocationPreferences([value])[0];
  }
  if (typeof value === "string" && value.trim()) {
    return normalizeLocationPreferences([value.trim()])[0];
  }
  return undefined;
}

export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
}

/** Lift residence fields from the preferences blob onto the profile object. */
export function hydrateResidenceFields(profile: RoommateProfile): RoommateProfile {
  const prefs = profile.preferences ?? {};

  return {
    ...profile,
    currentNeighborhood:
      profile.currentNeighborhood ??
      normalizeSingleLocation(prefs[RESIDENCE_PREF_KEYS.currentNeighborhood]),
    previousNeighborhoods:
      profile.previousNeighborhoods ??
      normalizeLocationPreferences(prefs[RESIDENCE_PREF_KEYS.previousNeighborhoods]),
    currentBuilding:
      profile.currentBuilding ??
      (typeof prefs[RESIDENCE_PREF_KEYS.currentBuilding] === "string"
        ? prefs[RESIDENCE_PREF_KEYS.currentBuilding].trim() || undefined
        : undefined),
    previousBuildings:
      profile.previousBuildings ??
      normalizeStringList(prefs[RESIDENCE_PREF_KEYS.previousBuildings]),
  };
}

/** Persist residence fields inside preferences for API/local storage compatibility. */
export function syncResidenceToPreferences(profile: RoommateProfile): Preferences {
  const prefs = { ...(profile.preferences ?? {}) };

  if (profile.currentNeighborhood) {
    prefs[RESIDENCE_PREF_KEYS.currentNeighborhood] = profile.currentNeighborhood;
  } else {
    delete prefs[RESIDENCE_PREF_KEYS.currentNeighborhood];
  }

  if (profile.previousNeighborhoods?.length) {
    prefs[RESIDENCE_PREF_KEYS.previousNeighborhoods] = profile.previousNeighborhoods;
  } else {
    delete prefs[RESIDENCE_PREF_KEYS.previousNeighborhoods];
  }

  const currentBuilding = profile.currentBuilding?.trim();
  if (currentBuilding) {
    prefs[RESIDENCE_PREF_KEYS.currentBuilding] = currentBuilding;
  } else {
    delete prefs[RESIDENCE_PREF_KEYS.currentBuilding];
  }

  if (profile.previousBuildings?.length) {
    prefs[RESIDENCE_PREF_KEYS.previousBuildings] = profile.previousBuildings;
  } else {
    delete prefs[RESIDENCE_PREF_KEYS.previousBuildings];
  }

  return prefs;
}

export function hasResidenceHistory(profile: RoommateProfile): boolean {
  const hydrated = hydrateResidenceFields(profile);
  return Boolean(
    hydrated.currentNeighborhood ||
      (hydrated.previousNeighborhoods?.length ?? 0) > 0 ||
      hydrated.currentBuilding ||
      (hydrated.previousBuildings?.length ?? 0) > 0
  );
}
