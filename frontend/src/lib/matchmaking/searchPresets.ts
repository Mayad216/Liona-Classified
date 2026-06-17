import type { LeaseDuration, Preferences, RoommateProfile, SearchPreset } from "./types";
import { DEFAULT_DEALBREAKER_KEYS, ENGINE_TUNING, REQUIRED_DIMENSIONS } from "./config";

export function createDefaultSearchPresets(profile: RoommateProfile): SearchPreset[] {
  const base = profile.lookingFor ?? {};

  return [
    {
      id: "my-search",
      name: "My search",
      lookingFor: { ...base },
      monthlyBudgetAed: profile.monthlyBudgetAed,
      moveInDate: profile.moveInDate,
      leaseDuration: profile.leaseDuration,
      dealbreakers: profile.dealbreakers ?? [...DEFAULT_DEALBREAKER_KEYS],
      minScore: ENGINE_TUNING.minDisplayScore,
    },
    {
      id: "flexible",
      name: "Flexible",
      lookingFor: {
        ...base,
        guests: "Any",
        pets: "Any pets",
      },
      monthlyBudgetAed: profile.monthlyBudgetAed,
      moveInDate: profile.moveInDate,
      leaseDuration: profile.leaseDuration,
      dealbreakers: [],
      minScore: 45,
    },
    {
      id: "strict",
      name: "Strict",
      lookingFor: { ...base },
      monthlyBudgetAed: profile.monthlyBudgetAed,
      moveInDate: profile.moveInDate,
      leaseDuration: profile.leaseDuration,
      dealbreakers: [
        ...DEFAULT_DEALBREAKER_KEYS,
        "sleep_schedule",
        "cleanliness",
        "guests",
      ],
      minScore: 70,
    },
  ];
}

export function ensureSearchPresets(profile: RoommateProfile): RoommateProfile {
  if (profile.searchPresets?.length) {
    return {
      ...profile,
      activeSearchPresetId: profile.activeSearchPresetId ?? profile.searchPresets[0].id,
    };
  }

  const presets = createDefaultSearchPresets(profile);
  return {
    ...profile,
    searchPresets: presets,
    activeSearchPresetId: "my-search",
  };
}

export function getActiveSearchPreset(profile: RoommateProfile): SearchPreset {
  const presets = profile.searchPresets ?? createDefaultSearchPresets(profile);
  return (
    presets.find((p) => p.id === profile.activeSearchPresetId) ??
    presets[0] ??
    createDefaultSearchPresets(profile)[0]
  );
}

/** Merge active preset into a profile shape the scoring engine understands. */
export function buildScoringProfile(
  profile: RoommateProfile,
  preset: SearchPreset
): RoommateProfile {
  return {
    ...profile,
    lookingFor: preset.lookingFor,
    monthlyBudgetAed: preset.monthlyBudgetAed ?? profile.monthlyBudgetAed,
    moveInDate: preset.moveInDate ?? profile.moveInDate,
    leaseDuration: preset.leaseDuration ?? profile.leaseDuration,
    dealbreakers: preset.dealbreakers ?? profile.dealbreakers,
  };
}

export function isMatchProfileReady(profile: RoommateProfile): boolean {
  const keys = REQUIRED_DIMENSIONS.filter((d) => !d.optional).map((d) => d.key);
  if (keys.length === 0) return true;

  const answered = keys.filter((key) => {
    const v = profile.preferences[key];
    return v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true);
  }).length;

  return answered >= Math.ceil(keys.length * 0.35);
}

export function syncPrimarySearchToProfile(
  _profile: RoommateProfile,
  preset: SearchPreset
): Partial<RoommateProfile> {
  if (preset.id !== "my-search") return {};

  return {
    lookingFor: preset.lookingFor,
    monthlyBudgetAed: preset.monthlyBudgetAed,
    moveInDate: preset.moveInDate,
    leaseDuration: preset.leaseDuration as LeaseDuration | undefined,
    dealbreakers: preset.dealbreakers,
  };
}

export function patchSearchPreset(
  presets: SearchPreset[],
  presetId: string,
  patch: Partial<SearchPreset>
): SearchPreset[] {
  return presets.map((p) => (p.id === presetId ? { ...p, ...patch } : p));
}

export function patchActivePresetLookingFor(
  presets: SearchPreset[],
  presetId: string,
  key: string,
  value: unknown
): SearchPreset[] {
  return presets.map((p) =>
    p.id === presetId
      ? { ...p, lookingFor: { ...p.lookingFor, [key]: value } as Preferences }
      : p
  );
}
