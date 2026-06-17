/**
 * Core type contracts for the AI roommate matchmaking agent.
 *
 * All dimensions, options, weights and labels live in `./config.ts`.
 * Replace that single file with your real parameter spec and the rest
 * of the engine + UI will adapt without further edits.
 */

// ─────────────────────────────────────────────────────────────────────────────
//  Dimension definition (the "schema" of the matching engine)
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "lifestyle"
  | "habits"
  | "schedule"
  | "social"
  | "background"
  | "logistics";

/** How a single dimension's compatibility is computed. */
export type MatchRule =
  /** Both sides must select the same value (or one side has no preference). */
  | "exact"
  /** Linear distance on a 1..N scale, normalised to 0..1. */
  | "scale"
  /** Jaccard similarity of two multi-select sets. */
  | "overlap"
  /** Boolean equality. */
  | "boolean"
  /** Numeric ranges overlap (within tolerance). */
  | "range"
  /** Custom compatibility matrix defined per-dimension. */
  | "matrix";

export type DimensionType =
  | {
      kind: "enum";
      options: readonly string[];
    }
  | {
      kind: "multi-select";
      options: readonly string[];
      maxSelectable?: number;
    }
  | {
      kind: "language-multi-select";
      maxSelectable?: number;
    }
  | { kind: "location-select" }
  | {
      kind: "scale";
      min: number;
      max: number;
      labelLow: string;
      labelHigh: string;
    }
  | { kind: "boolean"; labelTrue?: string; labelFalse?: string }
  | { kind: "range"; min: number; max: number; unit?: string; step?: number };

export interface Dimension {
  /** Stable identifier — used as the key in profile payloads. */
  key: string;
  /** Human-readable label shown in the form / result breakdown. */
  label: string;
  /** Optional helper copy for the form field. */
  description?: string;
  /** Grouping for the form UI and the result breakdown. */
  category: Category;
  /** Field type definition. */
  type: DimensionType;
  /** Weight 0..1 — share of the soft-score this dimension contributes. */
  weight: number;
  /**
   * Suggested default when the user first sets up their profile.
   * Users choose their own deal-breakers via `RoommateProfile.dealbreakers`.
   */
  suggestedDealbreaker?: boolean;
  /**
   * Compatibility rule. Defaults are picked from `type.kind` automatically
   * via `defaultRuleForType` in `engine.ts`, but you can override.
   */
  rule?: MatchRule;
  /** Optional compatibility matrix when `rule === 'matrix'`. */
  matrix?: Record<string, Record<string, number>>;
  /** Optional emoji/icon hint for the form. */
  icon?: string;
  /** When true, the field is not required for profile completion. */
  optional?: boolean;
  /** When true, only shown in search filters — not on the lifestyle profile. */
  searchOnly?: boolean;
}

import type { LocationPreference } from "./uaeLocations";

export type Gender = "Male" | "Female" | "Prefer not to say";

// ─────────────────────────────────────────────────────────────────────────────
//  User-side data model
// ─────────────────────────────────────────────────────────────────────────────

/** Free-form preferences keyed by dimension.key. Values are any of the types above. */
export type Preferences = Record<string, unknown>;

export interface SearchPreset {
  id: string;
  name: string;
  lookingFor: Preferences;
  monthlyBudgetAed?: number;
  moveInDate?: string;
  leaseDuration?: LeaseDuration;
  dealbreakers?: string[];
  /** Min compatibility % for this preset. */
  minScore?: number;
}

export type LeaseDuration =
  | "1 month (rolling)"
  | "3 months"
  | "6 months"
  | "12 months"
  | "Flexible";

export interface RoommateProfile {
  userId: string;
  /** Once-off profile metadata (shown on the match card). */
  name: string;
  avatar?: string;
  age?: number;
  occupation?: string;
  bio?: string;
  /** The user's own gender — used for mutual gender-preference matching. */
  gender?: Gender;
  /** Maximum monthly rent the seeker can afford (AED). */
  monthlyBudgetAed?: number;
  /** Preferred move-in date (ISO `YYYY-MM-DD`). */
  moveInDate?: string;
  /** Preferred lease length — optional. */
  leaseDuration?: LeaseDuration;
  /** Neighborhood the user currently lives in — optional. */
  currentNeighborhood?: LocationPreference;
  /** Neighborhoods the user has lived in before. */
  previousNeighborhoods?: LocationPreference[];
  /** Current building or tower name — optional free text. */
  currentBuilding?: string;
  /** Building or tower names the user has lived in before. */
  previousBuildings?: string[];
  /** The actual answers — keyed by `Dimension.key`. */
  preferences: Preferences;
  /**
   * Dimension keys where any poor fit excludes the candidate entirely.
   * Chosen by the user in the profile builder.
   */
  dealbreakers?: string[];
  /** What this seeker is looking for in a roommate (mirror of preferences). */
  lookingFor?: Preferences;
  /** Optional listing they have/own. */
  listingId?: string;
  /** When false, profile is hidden from roommate search results. */
  isDiscoverable?: boolean;
  /** Saved search filter presets the user can switch between. */
  searchPresets?: SearchPreset[];
  activeSearchPresetId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Scoring output (returned by the engine)
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionScore {
  key: string;
  label: string;
  category: Category;
  /** 0..1 — how compatible this single dimension is. */
  score: number;
  /** 0..1 — the dimension's weight (normalised). */
  weight: number;
  /** Human-readable explanation, used in the result breakdown. */
  explanation: string;
  /** Whether this contributed (passes filters and both sides answered). */
  contributed: boolean;
  /** True when this dimension is a user-defined deal-breaker. */
  isDealbreaker?: boolean;
  /** True when either side picked an open / "Any" (or diet: No restrictions) answer. */
  openMatch?: boolean;
}

export interface CategoryAggregateScore {
  key: Category;
  label: string;
  /** 0..1 aggregated compatibility for this category. */
  value: number;
  /** Either user picked an open / "Any" preference in this category. */
  openMatch: boolean;
}

export interface MatchResult {
  /** Candidate profile. */
  candidate: RoommateProfile;
  /** Per-category scores for radar / grouped breakdown. */
  categoryScores: CategoryAggregateScore[];
  /** 0..100 overall compatibility score (after weights, before any boost). */
  score: number;
  /** 0..1 raw value before x100. */
  raw: number;
  /** Per-dimension contributions. */
  breakdown: DimensionScore[];
  /** True if a hard filter excluded the candidate. */
  excluded: boolean;
  /** Reason for exclusion if `excluded` is true. */
  excludedReason?: string;
  /**
   * True when the candidate clashes on a deal-breaker but still appears
   * because overall score meets the high-match override (85%+).
   */
  dealbreakerClash?: boolean;
  /** Human-readable deal-breaker clash(es) when `dealbreakerClash` is true. */
  dealbreakerWarnings?: string[];
  /** Top 3 dimensions where they match strongly — used on cards. */
  highlights: DimensionScore[];
  /** Top 3 dimensions where they clash — for transparency / coaching. */
  concerns: DimensionScore[];
  /** Optional LLM-generated natural language summary. */
  aiSummary?: string;
}
