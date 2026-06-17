/**
 * Roommate compatibility scoring engine.
 *
 * Pure-functional, deterministic. Given a seeker profile + a list of
 * candidate profiles + the dimension config, produces ranked
 * `MatchResult[]` with full per-dimension breakdowns and explanations.
 *
 * Works entirely client-side so the demo runs without a backend, but
 * the same algorithm is mirrored in `backend/app/Services/Matchmaking`.
 */

import { CATEGORIES, DEALBREAKER_THRESHOLD, DIMENSIONS, ENGINE_TUNING } from "./config";
import {
  genderFilterFailureReason,
  isOpenGenderPreference,
  passesGenderFilter,
  resolveGenderPreference,
  scoreGenderCompatibility,
} from "./genderMatching";
import {
  formatLocationPreferences,
  normalizeLocationPreferences,
} from "./uaeLocations";
import {
  isOpenLocationPreference,
  locationFilterFailureReason,
  passesLocationFilter,
  resolveSearchLocations,
  scoreLocationCompatibility,
} from "./locationMatching";
import type {
  Category,
  CategoryAggregateScore,
  Dimension,
  DimensionScore,
  DimensionType,
  MatchResult,
  MatchRule,
  Preferences,
  RoommateProfile,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
//  Rule resolution
// ─────────────────────────────────────────────────────────────────────────────

function defaultRuleForType(type: DimensionType): MatchRule {
  switch (type.kind) {
    case "enum":
      return "exact";
    case "multi-select":
      return "overlap";
    case "language-multi-select":
      return "overlap";
    case "location-select":
      return "overlap";
    case "scale":
      return "scale";
    case "boolean":
      return "boolean";
    case "range":
      return "range";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Per-rule comparators — each returns a 0..1 compatibility score
// ─────────────────────────────────────────────────────────────────────────────

/** Open-ended enum answers (e.g. "Any", "Any pets", diet "No restrictions") count as compatible with anyone. */
export function isOpenPreference(value: unknown, dim: Dimension): boolean {
  if (value == null || dim.type.kind !== "enum") return false;
  const str = String(value).trim();
  if (/^any$/i.test(str)) return true;
  if (/^any\s+/i.test(str)) return true;
  if (dim.key === "diet" && /^no restrictions?$/i.test(str)) return true;
  return false;
}

function formatPreferenceValue(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) {
    const locations = normalizeLocationPreferences(value);
    if (locations.length > 0) return formatLocationPreferences(locations);
    return (value as string[]).join(", ");
  }
  if (typeof value === "number") return String(value);
  return String(value);
}

function choiceExplanation(a: unknown, b: unknown): string {
  return `You: ${formatPreferenceValue(a)} · Them: ${formatPreferenceValue(b)}`;
}

function scoreExact(a: unknown, b: unknown, dim: Dimension): number {
  if (a == null || b == null) return 0.5; // neutral when missing
  if (a === b) return 1;
  if (isOpenPreference(a, dim) || isOpenPreference(b, dim)) return 1;
  // Compatibility matrix if provided
  if (dim.rule === "matrix" && dim.matrix) {
    const v = dim.matrix[String(a)]?.[String(b)];
    if (typeof v === "number") return clamp01(v);
  }
  return 0;
}

function scoreScale(a: unknown, b: unknown, dim: Dimension): number {
  if (typeof a !== "number" || typeof b !== "number") return 0.5;
  if (dim.type.kind !== "scale") return 0.5;
  const range = dim.type.max - dim.type.min || 1;
  return clamp01(1 - Math.abs(a - b) / range);
}

function scoreBoolean(a: unknown, b: unknown): number {
  if (typeof a !== "boolean" || typeof b !== "boolean") return 0.5;
  return a === b ? 1 : 0;
}

function scoreOverlap(a: unknown, b: unknown): number {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0.5;
  if (a.length === 0 || b.length === 0) return 0.5;
  const setA = new Set(a as string[]);
  const setB = new Set(b as string[]);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...(a as string[]), ...(b as string[])]).size;
  return union === 0 ? 0.5 : intersection / union;
}

function scoreRange(a: unknown, b: unknown, dim: Dimension): number {
  // "Range" can either mean a single number against an [min,max] preference,
  // or two ranges that should overlap. We handle both.
  if (dim.type.kind !== "range") return 0.5;
  const dimRange = dim.type.max - dim.type.min || 1;

  const asTuple = (v: unknown): [number, number] | null => {
    if (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === "number"))
      return v as [number, number];
    if (typeof v === "number") return [v, v];
    return null;
  };
  const A = asTuple(a);
  const B = asTuple(b);
  if (!A || !B) return 0.5;

  const overlap = Math.max(0, Math.min(A[1], B[1]) - Math.max(A[0], B[0]));
  const span = Math.max(A[1] - A[0], B[1] - B[0], 1);
  // Overlap proportional to the smaller span — generous when ranges align.
  let score = overlap / span;
  // Penalty when there's no overlap, scaled by gap-to-full-range distance.
  if (overlap === 0) {
    const gap = Math.max(0, Math.max(A[0], B[0]) - Math.min(A[1], B[1]));
    score = clamp01(1 - gap / dimRange) * 0.4; // partial credit
  }
  return clamp01(score);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

// ─────────────────────────────────────────────────────────────────────────────
//  Single-dimension scoring
// ─────────────────────────────────────────────────────────────────────────────

function isWithheldAnswer(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^prefer not to say$/i.test(value.trim());
}

function scoreDimensionForPair(
  dim: Dimension,
  seeker: RoommateProfile,
  candidate: RoommateProfile
): { score: number; explanation: string; contributed: boolean } {
  if (dim.key === "gender_preference") {
    return scoreGenderCompatibility(seeker, candidate);
  }

  if (dim.key === "preferred_locations") {
    return scoreLocationCompatibility(seeker, candidate);
  }

  const seekerValue = seekerValueForDimension(seeker, dim.key);
  const candidateValue = candidate.preferences[dim.key];
  return scoreDimension(dim, seekerValue, candidateValue);
}
function scoreDimension(
  dim: Dimension,
  seekerValue: unknown,
  candidateValue: unknown
): { score: number; explanation: string; contributed: boolean } {
  if (seekerValue == null && candidateValue == null) {
    return {
      score: 0.5,
      explanation: "No data on either side",
      contributed: false,
    };
  }
  if (seekerValue == null || candidateValue == null) {
    return {
      score: 0.5,
      explanation: "One side hasn't answered yet",
      contributed: false,
    };
  }
  if (isWithheldAnswer(seekerValue) || isWithheldAnswer(candidateValue)) {
    return {
      score: 0.5,
      explanation: "Not shared",
      contributed: false,
    };
  }

  const rule: MatchRule = dim.rule ?? defaultRuleForType(dim.type);

  let score = 0.5;
  switch (rule) {
    case "exact":
    case "matrix":
      score = scoreExact(seekerValue, candidateValue, dim);
      break;
    case "scale":
      score = scoreScale(seekerValue, candidateValue, dim);
      break;
    case "boolean":
      score = scoreBoolean(seekerValue, candidateValue);
      break;
    case "overlap":
      score = scoreOverlap(seekerValue, candidateValue);
      break;
    case "range":
      score = scoreRange(seekerValue, candidateValue, dim);
      break;
  }

  return {
    score: clamp01(score),
    explanation: explain(dim, rule, seekerValue, candidateValue, score),
    contributed: true,
  };
}

function explain(
  dim: Dimension,
  rule: MatchRule,
  a: unknown,
  b: unknown,
  score: number
): string {
  const choices = choiceExplanation(a, b);

  if (rule === "overlap" && Array.isArray(a) && Array.isArray(b)) {
    const shared = (a as string[]).filter((x) => (b as string[]).includes(x));
    if (shared.length === 0) return `${choices} — no overlap`;
    return `${choices} · Shared: ${shared.slice(0, 3).join(", ")}${shared.length > 3 ? ` +${shared.length - 3}` : ""}`;
  }
  if (a === b) return `Both: ${formatPreferenceValue(a)}`;
  if (isOpenPreference(a, dim) || isOpenPreference(b, dim)) return choices;
  if (score >= 0.7) return `${choices} — close match`;
  if (score >= 0.4) return `${choices} — partial match`;
  return `${choices} — mismatch`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Hard filters
// ─────────────────────────────────────────────────────────────────────────────

function getSeekerCriteria(seeker: RoommateProfile): Preferences {
  return seeker.lookingFor ?? {};
}

function seekerValueForDimension(seeker: RoommateProfile, key: string): unknown {
  return getSeekerCriteria(seeker)[key];
}

function getDealbreakerKeys(seeker: RoommateProfile): string[] {
  return seeker.dealbreakers ?? [];
}

export interface DealbreakerClash {
  key: string;
  label: string;
  explanation: string;
}

function getDealbreakerClashes(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): DealbreakerClash[] {
  const clashes: DealbreakerClash[] = [];
  for (const key of getDealbreakerKeys(seeker)) {
    const dim = DIMENSIONS.find((d) => d.key === key);
    if (!dim) continue;

    const a = seekerValueForDimension(seeker, key);
    const b = candidate.preferences[key];
    const { score, explanation, contributed } =
      key === "gender_preference"
        ? scoreGenderCompatibility(seeker, candidate)
        : key === "preferred_locations"
          ? scoreLocationCompatibility(seeker, candidate)
          : scoreDimension(dim, a, b);

    if (!contributed) continue;

    if (score < DEALBREAKER_THRESHOLD) {
      clashes.push({
        key,
        label: dim.label,
        explanation,
      });
    }
  }
  return clashes;
}

export function aggregateCategoryScores(
  breakdown: DimensionScore[],
  seeker: RoommateProfile,
  candidate: RoommateProfile
): CategoryAggregateScore[] {
  const byCategory: Partial<Record<Category, DimensionScore[]>> = {};

  for (const d of breakdown) {
    (byCategory[d.category] = byCategory[d.category] ?? []).push(d);
  }

  return (Object.keys(CATEGORIES) as Category[])
    .filter((cat) => byCategory[cat]?.length)
    .map((cat) => {
      const dims = byCategory[cat] ?? [];
      const catDimensions = DIMENSIONS.filter((d) => d.category === cat);
      const openMatch = catDimensions.some((dim) => {
        if (dim.key === "gender_preference") {
          return isOpenGenderPreference(resolveGenderPreference(seeker));
        }
        if (dim.key === "preferred_locations") {
          return (
            isOpenLocationPreference(resolveSearchLocations(seeker)) ||
            isOpenLocationPreference(
              normalizeLocationPreferences(candidate.preferences[dim.key])
            )
          );
        }
        const seekerValue = seekerValueForDimension(seeker, dim.key);
        const candidateValue = candidate.preferences[dim.key];
        return isOpenPreference(seekerValue, dim) || isOpenPreference(candidateValue, dim);
      });

      if (openMatch) {
        return {
          key: cat,
          label: CATEGORIES[cat].label,
          value: 1,
          openMatch: true,
        };
      }

      const contributing = dims.filter((d) => d.contributed);
      const totalWeight = contributing.reduce((sum, d) => sum + d.weight, 0);
      const value =
        totalWeight === 0
          ? 0.5
          : contributing.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight;

      return {
        key: cat,
        label: CATEGORIES[cat].label,
        value: clamp01(value),
        openMatch: false,
      };
    });
}

function computeAggregateScore(breakdown: DimensionScore[]) {
  const contributing = breakdown.filter((d) => d.contributed);
  const totalWeight = contributing.reduce((sum, d) => sum + d.weight, 0) || 1;
  const weighted = contributing.reduce((sum, d) => sum + d.score * d.weight, 0);
  let raw = weighted / totalWeight;

  const strongCount = contributing.filter((d) => d.score >= 0.8).length;
  if (strongCount >= ENGINE_TUNING.consistencyBonus.thresholdCount) {
    raw += Math.min(
      ENGINE_TUNING.consistencyBonus.cap,
      (strongCount - ENGINE_TUNING.consistencyBonus.thresholdCount + 1) *
        ENGINE_TUNING.consistencyBonus.perDimension
    );
  }
  raw = clamp01(raw);

  const highlights = [...contributing]
    .filter((d) => d.score >= 0.75)
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 3);

  const concerns = [...contributing]
    .filter((d) => d.score < 0.5)
    .sort((a, b) => a.score * a.weight - b.score * b.weight)
    .slice(0, 3);

  return {
    score: Math.round(raw * 100),
    raw,
    highlights,
    concerns,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface MatchOptions {
  /** Hide candidates below this final percentage. */
  minScore?: number;
  /** Cap returned candidates. */
  limit?: number;
  /** Include excluded candidates (with `excluded: true`) for debugging. */
  includeExcluded?: boolean;
}

export function scorePair(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): MatchResult {
  const dealbreakerKeys = new Set(getDealbreakerKeys(seeker));

  if (!passesGenderFilter(seeker, candidate)) {
    const reason = genderFilterFailureReason(seeker, candidate) ?? "Gender preference mismatch";
    const genderDim = DIMENSIONS.find((d) => d.key === "gender_preference");
    const genderScore = scoreGenderCompatibility(seeker, candidate);

    return {
      candidate,
      categoryScores: [],
      score: 0,
      raw: 0,
      breakdown: genderDim
        ? [
            {
              key: genderDim.key,
              label: genderDim.label,
              category: genderDim.category,
              score: genderScore.score,
              weight: genderDim.weight,
              explanation: genderScore.explanation,
              contributed: true,
              isDealbreaker: dealbreakerKeys.has(genderDim.key),
              openMatch: false,
            },
          ]
        : [],
      excluded: true,
      excludedReason: reason,
      highlights: [],
      concerns: [],
    };
  }

  if (!passesLocationFilter(seeker, candidate)) {
    const reason =
      locationFilterFailureReason(seeker, candidate) ?? "Location preference mismatch";
    const locationDim = DIMENSIONS.find((d) => d.key === "preferred_locations");
    const locationScore = scoreLocationCompatibility(seeker, candidate);

    return {
      candidate,
      categoryScores: [],
      score: 0,
      raw: 0,
      breakdown: locationDim
        ? [
            {
              key: locationDim.key,
              label: locationDim.label,
              category: locationDim.category,
              score: locationScore.score,
              weight: locationDim.weight,
              explanation: locationScore.explanation,
              contributed: true,
              isDealbreaker: dealbreakerKeys.has(locationDim.key),
              openMatch: false,
            },
          ]
        : [],
      excluded: true,
      excludedReason: reason,
      highlights: [],
      concerns: [],
    };
  }

  const breakdown: DimensionScore[] = DIMENSIONS.map((dim) => {
    const { score, explanation, contributed } = scoreDimensionForPair(dim, seeker, candidate);
    const seekerValue = seekerValueForDimension(seeker, dim.key);
    const candidateValue = candidate.preferences[dim.key];
    const openMatch =
      dim.key === "gender_preference"
        ? contributed && isOpenGenderPreference(resolveGenderPreference(seeker))
        : dim.key === "preferred_locations"
          ? contributed &&
            (isOpenLocationPreference(resolveSearchLocations(seeker)) ||
              isOpenLocationPreference(normalizeLocationPreferences(candidateValue)))
          : contributed &&
            (isOpenPreference(seekerValue, dim) || isOpenPreference(candidateValue, dim));
    return {
      key: dim.key,
      label: dim.label,
      category: dim.category,
      score,
      weight: dim.weight,
      explanation,
      contributed,
      isDealbreaker: dealbreakerKeys.has(dim.key),
      openMatch,
    };
  });

  const categoryScores = aggregateCategoryScores(breakdown, seeker, candidate);
  const { score, raw, highlights, concerns } = computeAggregateScore(breakdown);
  const clashes = getDealbreakerClashes(seeker, candidate);

  if (clashes.length > 0) {
    const warnings = clashes.map((c) => `${c.label}: ${c.explanation}`);
    const overrideMin = ENGINE_TUNING.dealbreakerOverrideMinScore;

    if (score >= overrideMin) {
      return {
        candidate,
        categoryScores,
        score,
        raw,
        breakdown,
        excluded: false,
        dealbreakerClash: true,
        dealbreakerWarnings: warnings,
        highlights,
        concerns: [
          ...clashes.map((c) => ({
            key: c.key,
            label: c.label,
            category:
              DIMENSIONS.find((d) => d.key === c.key)?.category ?? "lifestyle",
            score: 0,
            weight: 1,
            explanation: c.explanation,
            contributed: true,
            isDealbreaker: true,
          })),
          ...concerns,
        ].slice(0, 3),
      };
    }

    return {
      candidate,
      categoryScores,
      score: 0,
      raw: 0,
      breakdown,
      excluded: true,
      excludedReason: `Deal-breaker: ${warnings[0]}`,
      dealbreakerWarnings: warnings,
      highlights: [],
      concerns: [],
    };
  }

  return {
    candidate,
    categoryScores,
    score,
    raw,
    breakdown,
    excluded: false,
    highlights,
    concerns,
  };
}

export function topMatches(
  seeker: RoommateProfile,
  candidates: RoommateProfile[],
  opts: MatchOptions = {}
): MatchResult[] {
  const { minScore = ENGINE_TUNING.minDisplayScore, limit, includeExcluded } = opts;
  let results = candidates
    .filter((c) => c.userId !== seeker.userId)
    .filter((c) => c.isDiscoverable !== false)
    .map((c) => scorePair(seeker, c));

  if (!includeExcluded) results = results.filter((r) => !r.excluded);
  results = results
    .filter((r) => r.score >= minScore || r.excluded)
    .sort((a, b) => b.score - a.score);

  return limit ? results.slice(0, limit) : results;
}

export function badgeForScore(score: number): "great" | "good" | "fair" | "poor" {
  if (score >= ENGINE_TUNING.greatMatchAt) return "great";
  if (score >= ENGINE_TUNING.goodMatchAt) return "good";
  if (score >= ENGINE_TUNING.minDisplayScore) return "fair";
  return "poor";
}
