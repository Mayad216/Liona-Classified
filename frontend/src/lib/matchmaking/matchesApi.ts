/**
 * Maps the Laravel matchmaking response onto the same `MatchResult` shape the
 * client-side engine produces, so the UI can't tell which one scored it.
 *
 * The server engine adds one dimension the browser can't compute — semantic
 * bio affinity, which needs an embedding model and therefore an API key that
 * must never reach the client.
 */

import type {
  Category,
  CategoryAggregateScore,
  DimensionScore,
  LeaseDuration,
  MatchResult,
  Preferences,
  RoommateProfile,
} from "./types";

export type ApiMatchCandidate = {
  user_id?: number | string;
  name?: string;
  avatar?: string | null;
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  bio?: string | null;
  preferences?: Preferences | null;
  looking_for?: Preferences | null;
  monthly_budget_aed?: number | null;
  move_in_date?: string | null;
  lease_duration?: string | null;
  is_discoverable?: boolean;
  listing_id?: string | null;
};

export type ApiDimensionScore = {
  key?: string;
  label?: string;
  category?: string;
  score?: number;
  weight?: number;
  explanation?: string;
  contributed?: boolean;
  is_dealbreaker?: boolean;
  open_match?: boolean;
};

export type ApiCategoryScore = {
  key?: string;
  label?: string;
  value?: number;
  open_match?: boolean;
};

export type ApiMatchRow = {
  candidate?: ApiMatchCandidate;
  score?: number;
  raw?: number;
  category_scores?: ApiCategoryScore[] | null;
  breakdown?: ApiDimensionScore[] | null;
  excluded?: boolean;
  excluded_reason?: string | null;
  dealbreaker_clash?: boolean;
  dealbreaker_warnings?: string[] | null;
  highlights?: ApiDimensionScore[] | null;
  concerns?: ApiDimensionScore[] | null;
};

function mapCandidate(c: ApiMatchCandidate | undefined): RoommateProfile {
  return {
    userId: String(c?.user_id ?? ""),
    name: c?.name ?? "User",
    avatar: c?.avatar ?? undefined,
    age: c?.age ?? undefined,
    gender: (c?.gender as RoommateProfile["gender"]) ?? undefined,
    occupation: c?.occupation ?? undefined,
    bio: c?.bio ?? undefined,
    monthlyBudgetAed: c?.monthly_budget_aed ?? undefined,
    moveInDate: c?.move_in_date ?? undefined,
    leaseDuration: (c?.lease_duration as LeaseDuration | undefined) ?? undefined,
    listingId: c?.listing_id ?? undefined,
    preferences: c?.preferences ?? {},
    lookingFor: c?.looking_for ?? {},
    isDiscoverable: c?.is_discoverable ?? true,
  };
}

function mapDimension(d: ApiDimensionScore): DimensionScore {
  return {
    key: d.key ?? "",
    label: d.label ?? d.key ?? "",
    category: (d.category ?? "lifestyle") as Category,
    score: d.score ?? 0,
    weight: d.weight ?? 0,
    explanation: d.explanation ?? "",
    contributed: d.contributed ?? false,
    isDealbreaker: d.is_dealbreaker ?? false,
    openMatch: d.open_match ?? false,
  };
}

function mapCategoryScore(c: ApiCategoryScore): CategoryAggregateScore {
  return {
    key: (c.key ?? "lifestyle") as Category,
    label: c.label ?? c.key ?? "",
    value: c.value ?? 0,
    openMatch: c.open_match ?? false,
  };
}

export function mapMatchResultFromApi(row: ApiMatchRow): MatchResult {
  return {
    candidate: mapCandidate(row.candidate),
    categoryScores: (row.category_scores ?? []).map(mapCategoryScore),
    score: row.score ?? 0,
    raw: row.raw ?? 0,
    breakdown: (row.breakdown ?? []).map(mapDimension),
    excluded: row.excluded ?? false,
    excludedReason: row.excluded_reason ?? undefined,
    dealbreakerClash: row.dealbreaker_clash ?? undefined,
    dealbreakerWarnings: row.dealbreaker_warnings ?? undefined,
    highlights: (row.highlights ?? []).map(mapDimension),
    concerns: (row.concerns ?? []).map(mapDimension),
  };
}

export function mapMatchResultsFromApi(rows: unknown): MatchResult[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => mapMatchResultFromApi(row as ApiMatchRow));
}
