import type { RoommateProfile } from "./types";
import {
  formatLocationPreferences,
  locationPairMatches,
  locationsOverlap,
  normalizeLocationPreferences,
  type LocationPreference,
} from "./uaeLocations";

export type { LocationPreference };

export function normalizeLocations(value: unknown): LocationPreference[] {
  return normalizeLocationPreferences(value);
}

/** Locations the user is searching in (seeker filters). */
export function resolveSearchLocations(profile: RoommateProfile): LocationPreference[] {
  return normalizeLocationPreferences(profile.lookingFor?.preferred_locations);
}

/** Locations the user wants to live in (lifestyle profile). */
export function resolveDesiredLocations(profile: RoommateProfile): LocationPreference[] {
  return normalizeLocationPreferences(profile.preferences?.preferred_locations);
}

export function hasSpecificLocations(locations: LocationPreference[]): boolean {
  return locations.length > 0;
}

export function isOpenLocationPreference(locations: LocationPreference[]): boolean {
  return locations.length === 0;
}

/** Hard filter — both search and desired locations must overlap when specified. */
export function passesLocationFilter(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): boolean {
  const seekerSearch = resolveSearchLocations(seeker);
  const seekerDesired = resolveDesiredLocations(seeker);
  const candidateSearch = resolveSearchLocations(candidate);
  const candidateDesired = resolveDesiredLocations(candidate);

  if (
    hasSpecificLocations(seekerSearch) &&
    hasSpecificLocations(candidateDesired) &&
    !locationsOverlap(seekerSearch, candidateDesired)
  ) {
    return false;
  }

  if (
    hasSpecificLocations(candidateSearch) &&
    hasSpecificLocations(seekerDesired) &&
    !locationsOverlap(candidateSearch, seekerDesired)
  ) {
    return false;
  }

  return true;
}

export function scoreLocationCompatibility(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): { score: number; explanation: string; contributed: boolean } {
  const seekerSearch = resolveSearchLocations(seeker);
  const seekerDesired = resolveDesiredLocations(seeker);
  const candidateSearch = resolveSearchLocations(candidate);
  const candidateDesired = resolveDesiredLocations(candidate);

  const seekerToCandidate = scoreLocationPair(seekerSearch, candidateDesired, "You search");
  const candidateToSeeker = scoreLocationPair(candidateSearch, seekerDesired, "They search");

  if (!seekerToCandidate.contributed && !candidateToSeeker.contributed) {
    return {
      score: 0.5,
      explanation: "No location preferences set on either side",
      contributed: false,
    };
  }

  if (
    hasSpecificLocations(seekerSearch) &&
    hasSpecificLocations(candidateDesired) &&
    seekerToCandidate.score === 0
  ) {
    return { score: 0, explanation: seekerToCandidate.explanation, contributed: true };
  }

  if (
    hasSpecificLocations(candidateSearch) &&
    hasSpecificLocations(seekerDesired) &&
    candidateToSeeker.score === 0
  ) {
    return { score: 0, explanation: candidateToSeeker.explanation, contributed: true };
  }

  const parts = [seekerToCandidate, candidateToSeeker].filter((p) => p.contributed);
  const score = Math.min(...parts.map((p) => p.score));
  const shared = findSharedLocations(
    seekerSearch,
    candidateDesired,
    candidateSearch,
    seekerDesired
  );

  if (score >= 1 || shared.length > 0) {
    return {
      score: Math.max(score, shared.length > 0 ? 1 : score),
      explanation:
        shared.length > 0
          ? `Shared locations: ${formatLocationPreferences(shared)}`
          : "Open to any location on one or both sides",
      contributed: true,
    };
  }

  return {
    score,
    explanation: `${seekerToCandidate.explanation} · ${candidateToSeeker.explanation}`,
    contributed: true,
  };
}

function findSharedLocations(
  seekerSearch: LocationPreference[],
  candidateDesired: LocationPreference[],
  candidateSearch: LocationPreference[],
  seekerDesired: LocationPreference[]
): LocationPreference[] {
  const shared: LocationPreference[] = [];
  const seen = new Set<string>();

  for (const a of seekerSearch) {
    for (const b of candidateDesired) {
      if (!locationPairMatches(a, b)) continue;
      const key = `${a.emirate}::${a.area ?? b.area ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      shared.push({
        emirate: a.emirate,
        area: a.area && b.area ? (a.area === b.area ? a.area : undefined) : a.area ?? b.area,
      });
    }
  }

  for (const a of candidateSearch) {
    for (const b of seekerDesired) {
      if (!locationPairMatches(a, b)) continue;
      const key = `${a.emirate}::${a.area ?? b.area ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      shared.push({
        emirate: a.emirate,
        area: a.area && b.area ? (a.area === b.area ? a.area : undefined) : a.area ?? b.area,
      });
    }
  }

  return shared;
}

function scoreLocationPair(
  search: LocationPreference[],
  desired: LocationPreference[],
  label: string
): { score: number; explanation: string; contributed: boolean } {
  if (!hasSpecificLocations(search) && !hasSpecificLocations(desired)) {
    return { score: 0.5, explanation: `${label}: not set`, contributed: false };
  }

  if (!hasSpecificLocations(search) || !hasSpecificLocations(desired)) {
    return {
      score: 1,
      explanation: `${label}: ${formatLocationPreferences(search)} · Them: ${formatLocationPreferences(desired)} — open`,
      contributed: true,
    };
  }

  const shared = search.filter((x) => desired.some((y) => locationPairMatches(x, y)));
  if (shared.length === 0) {
    return {
      score: 0,
      explanation: `${label}: ${formatLocationPreferences(search)} · Them: ${formatLocationPreferences(desired)} — no overlap`,
      contributed: true,
    };
  }

  const score = shared.length / Math.max(search.length, desired.length, 1);
  return {
    score: Math.max(score, 0.75),
    explanation: `${label}: ${formatLocationPreferences(search)} · Them: ${formatLocationPreferences(desired)} · Shared: ${formatLocationPreferences(shared)}`,
    contributed: true,
  };
}

export function locationFilterFailureReason(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): string | null {
  if (passesLocationFilter(seeker, candidate)) return null;

  const seekerSearch = resolveSearchLocations(seeker);
  const seekerDesired = resolveDesiredLocations(seeker);
  const candidateSearch = resolveSearchLocations(candidate);
  const candidateDesired = resolveDesiredLocations(candidate);

  if (
    hasSpecificLocations(seekerSearch) &&
    hasSpecificLocations(candidateDesired) &&
    !locationsOverlap(seekerSearch, candidateDesired)
  ) {
    return `You're searching in ${formatLocationPreferences(seekerSearch)} — ${candidate.name} prefers ${formatLocationPreferences(candidateDesired)}`;
  }

  if (
    hasSpecificLocations(candidateSearch) &&
    hasSpecificLocations(seekerDesired) &&
    !locationsOverlap(candidateSearch, seekerDesired)
  ) {
    return `${candidate.name} is searching in ${formatLocationPreferences(candidateSearch)} — you prefer ${formatLocationPreferences(seekerDesired)}`;
  }

  return "Location preference mismatch";
}
