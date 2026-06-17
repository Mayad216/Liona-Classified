import type { LeaseDuration, Preferences, RoommateProfile } from "./types";
import { DEFAULT_DEALBREAKER_KEYS } from "./config";
import { hydrateResidenceFields, syncResidenceToPreferences } from "./residenceHistory";

/** API row shape from Laravel (snake_case). */
export type ApiRoommateProfileRow = {
  user_id?: number | string;
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  bio?: string | null;
  listing_id?: string | null;
  monthly_budget_aed?: number | null;
  move_in_date?: string | null;
  lease_duration?: string | null;
  preferences?: Preferences;
  looking_for?: Preferences | null;
  dealbreakers?: string[] | null;
  is_discoverable?: boolean;
  completion?: number;
  user?: {
    id?: number | string;
    name?: string;
    avatar?: string | null;
    is_verified?: boolean;
  };
};

export function createEmptyRoommateProfile(
  userId: string,
  name: string,
  avatar?: string
): RoommateProfile {
  return {
    userId,
    name,
    avatar,
    preferences: {},
    lookingFor: {},
    dealbreakers: [...DEFAULT_DEALBREAKER_KEYS],
    isDiscoverable: false,
  };
}

export function mapRoommateProfileFromApi(
  row: ApiRoommateProfileRow | null | undefined,
  fallback?: Partial<RoommateProfile>
): RoommateProfile | null {
  if (!row) return fallback ? { ...createEmptyRoommateProfile("", ""), ...fallback } : null;

  const userId = String(row.user_id ?? row.user?.id ?? fallback?.userId ?? "");
  const name = row.user?.name ?? fallback?.name ?? "You";

  return hydrateResidenceFields({
    userId,
    name,
    avatar: row.user?.avatar ?? fallback?.avatar,
    age: row.age ?? fallback?.age,
    gender: (row.gender as RoommateProfile["gender"]) ?? fallback?.gender,
    occupation: row.occupation ?? fallback?.occupation,
    bio: row.bio ?? fallback?.bio,
    monthlyBudgetAed: row.monthly_budget_aed ?? fallback?.monthlyBudgetAed,
    moveInDate: row.move_in_date ?? fallback?.moveInDate,
    leaseDuration: (row.lease_duration as LeaseDuration | undefined) ?? fallback?.leaseDuration,
    listingId: row.listing_id ?? fallback?.listingId,
    preferences: { ...(fallback?.preferences ?? {}), ...(row.preferences ?? {}) },
    lookingFor: { ...(fallback?.lookingFor ?? {}), ...(row.looking_for ?? {}) },
    dealbreakers: row.dealbreakers ?? fallback?.dealbreakers ?? [...DEFAULT_DEALBREAKER_KEYS],
    isDiscoverable: row.is_discoverable ?? fallback?.isDiscoverable ?? false,
  });
}

export function mapRoommateProfileToApi(profile: RoommateProfile): Record<string, unknown> {
  return {
    age: profile.age ?? null,
    gender: profile.gender ?? null,
    occupation: profile.occupation ?? null,
    bio: profile.bio ?? null,
    listing_id: profile.listingId ?? null,
    monthly_budget_aed: profile.monthlyBudgetAed ?? null,
    move_in_date: profile.moveInDate ?? null,
    lease_duration: profile.leaseDuration ?? null,
    preferences: syncResidenceToPreferences(profile),
    looking_for: profile.lookingFor ?? {},
    dealbreakers: profile.dealbreakers ?? [],
    is_discoverable: profile.isDiscoverable ?? false,
  };
}
