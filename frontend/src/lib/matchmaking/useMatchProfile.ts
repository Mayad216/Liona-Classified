import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoommateProfile, Preferences, SearchPreset } from "./types";
import { DEFAULT_DEALBREAKER_KEYS, REQUIRED_DIMENSIONS, SEARCH_REQUIRED_DIMENSIONS } from "./config";
import { demoSeeker, getGuestSeekerBase, mockCandidates } from "./mockProfiles";
import { isMatchDemoMode } from "./matchDemoMode";
import {
  ensureSearchPresets,
  getActiveSearchPreset,
  isMatchProfileReady,
  patchActivePresetLookingFor,
  patchSearchPreset,
  syncPrimarySearchToProfile,
} from "./searchPresets";
import {
  createEmptyRoommateProfile,
  mapRoommateProfileFromApi,
  mapRoommateProfileToApi,
} from "./profileApi";
import { hydrateResidenceFields } from "./residenceHistory";
import {
  residenceFingerprint,
  syncReviewPromptNotifications,
} from "@/lib/notifications/reviewPrompts";
import { emitNotificationsChanged } from "@/lib/notifications/store";
import { api, getStoredAuthToken } from "@/lib/api";
import { AUTH_USER_KEY, type AuthUser } from "@/lib/auth";

const STORAGE_PREFIX = "khaleej_roommate_profile_v3";
const LEGACY_STORAGE_KEY = "khaleej_roommate_profile_v2";

function storageKey(userId?: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`;
}

function readAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function withDefaults(profile: RoommateProfile): RoommateProfile {
  return hydrateResidenceFields(
    ensureSearchPresets({
      ...profile,
      lookingFor: profile.lookingFor ?? {},
      dealbreakers: profile.dealbreakers ?? [...DEFAULT_DEALBREAKER_KEYS],
      isDiscoverable: profile.isDiscoverable ?? false,
    })
  );
}

function hydrateGuestProfile(stored: Partial<RoommateProfile> | null): RoommateProfile {
  if (isMatchDemoMode()) {
    return withDefaults(getGuestSeekerBase());
  }

  const base = withDefaults(demoSeeker);
  if (!stored) return base;

  return withDefaults({
    ...base,
    ...stored,
    preferences: { ...base.preferences, ...(stored.preferences ?? {}) },
    lookingFor: { ...(base.lookingFor ?? {}), ...(stored.lookingFor ?? {}) },
    dealbreakers: stored.dealbreakers ?? base.dealbreakers,
  });
}

function readLocalProfile(userId?: string | null): RoommateProfile {
  if (typeof window === "undefined") return withDefaults(getGuestSeekerBase());
  try {
    const key = storageKey(userId);
    const raw =
      window.localStorage.getItem(key) ??
      (!userId ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null);
    if (!raw) {
      const user = readAuthUser();
      if (user?.id) {
        return withDefaults(createEmptyRoommateProfile(user.id, user.name, user.avatar));
      }
      return hydrateGuestProfile(null);
    }
    const parsed = JSON.parse(raw) as Partial<RoommateProfile>;
    if (userId) {
      return withDefaults({
        ...createEmptyRoommateProfile(userId, parsed.name ?? "You", parsed.avatar),
        ...parsed,
        userId,
        preferences: parsed.preferences ?? {},
        lookingFor: parsed.lookingFor ?? {},
      });
    }
    return hydrateGuestProfile(parsed);
  } catch {
    return hydrateGuestProfile(null);
  }
}

function persistLocal(profile: RoommateProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(profile.userId), JSON.stringify(profile));
  } catch {
    /* ignore quota */
  }
}

/**
 * Roommate profile store — synced to the API when authenticated,
 * with localStorage fallback for demo/offline use.
 */
export function useMatchProfile() {
  const authUser = readAuthUser();
  const [profile, setProfileState] = useState<RoommateProfile>(() =>
    readLocalProfile(authUser?.id)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    const user = readAuthUser();
    const token = getStoredAuthToken();
    if (isMatchDemoMode()) {
      const demo = withDefaults({
        ...getGuestSeekerBase(),
        userId: user?.id ?? getGuestSeekerBase().userId,
        name: user?.name ?? getGuestSeekerBase().name,
        avatar: user?.avatar,
      });
      setProfileState(demo);
      setLoading(false);
      return;
    }

    if (!token || !user) {
      setProfileState(readLocalProfile(null));
      setLoading(false);
      return;
    }

    try {
      const res = await api.roommateProfile(token);
      const mapped = mapRoommateProfileFromApi(res.data, {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
      });
      if (mapped) {
        const next = withDefaults({
          ...mapped,
          searchPresets: readLocalProfile(user.id).searchPresets,
          activeSearchPresetId: readLocalProfile(user.id).activeSearchPresetId,
        });
        setProfileState(next);
        persistLocal(next);
      } else {
        const empty = withDefaults(createEmptyRoommateProfile(user.id, user.name, user.avatar));
        setProfileState(empty);
      }
    } catch {
      setProfileState(readLocalProfile(user.id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    persistLocal(profile);
  }, [profile]);

  useEffect(() => {
    if (loading) return;
    syncReviewPromptNotifications(profile);
  }, [loading, profile]);

  const saveNow = useCallback(async (next: RoommateProfile) => {
    const token = getStoredAuthToken();
    if (!token) return next;

    setSaving(true);
    try {
      const res = await api.upsertRoommateProfile(mapRoommateProfileToApi(next), token);
      const user = readAuthUser();
      const mapped = mapRoommateProfileFromApi(res.data, {
        userId: user?.id ?? next.userId,
        name: user?.name ?? next.name,
        avatar: user?.avatar ?? next.avatar,
      });
      if (mapped) {
        const saved = withDefaults({ ...next, ...mapped });
        setProfileState(saved);
        persistLocal(saved);
        emitNotificationsChanged();
        return saved;
      }
    } catch {
      /* keep local copy */
    } finally {
      setSaving(false);
    }
    return next;
  }, []);

  const scheduleSave = useCallback(
    (next: RoommateProfile) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveNow(next);
      }, 600);
    },
    [saveNow]
  );

  const applyUpdate = useCallback(
    (updater: (prev: RoommateProfile) => RoommateProfile) => {
      setProfileState((prev) => {
        const next = withDefaults(updater(prev));
        scheduleSave(next);
        if (residenceFingerprint(prev) !== residenceFingerprint(next)) {
          syncReviewPromptNotifications(next);
        }
        return next;
      });
    },
    [scheduleSave]
  );

  const setProfile = useCallback(
    (p: RoommateProfile) => {
      const next = withDefaults(p);
      setProfileState(next);
      scheduleSave(next);
    },
    [scheduleSave]
  );

  const setPreference = useCallback(
    (key: string, value: unknown) => {
      applyUpdate((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value } as Preferences,
      }));
    },
    [applyUpdate]
  );

  const setLookingFor = useCallback(
    (key: string, value: unknown) => {
      applyUpdate((prev) => ({
        ...prev,
        lookingFor: { ...(prev.lookingFor ?? {}), [key]: value } as Preferences,
      }));
    },
    [applyUpdate]
  );

  const toggleDealbreaker = useCallback(
    (key: string) => {
      applyUpdate((prev) => {
        const current = prev.dealbreakers ?? [];
        const next = current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key];
        return { ...prev, dealbreakers: next };
      });
    },
    [applyUpdate]
  );

  const isDealbreaker = useCallback(
    (key: string) => (profile.dealbreakers ?? []).includes(key),
    [profile.dealbreakers]
  );

  const setDealbreakers = useCallback(
    (keys: string[]) => {
      applyUpdate((prev) => ({ ...prev, dealbreakers: keys }));
    },
    [applyUpdate]
  );

  const applySuggestedDealbreakers = useCallback(() => {
    applyUpdate((prev) => {
      const presetId = prev.activeSearchPresetId ?? "my-search";
      const presets = patchSearchPreset(prev.searchPresets ?? [], presetId, {
        dealbreakers: [...DEFAULT_DEALBREAKER_KEYS],
      });
      const updated = presets.find((p) => p.id === presetId)!;
      const primarySync = syncPrimarySearchToProfile(prev, updated);
      return withDefaults({ ...prev, ...primarySync, searchPresets: presets });
    });
  }, [applyUpdate]);

  const clearDealbreakers = useCallback(() => {
    applyUpdate((prev) => {
      const presetId = prev.activeSearchPresetId ?? "my-search";
      const presets = patchSearchPreset(prev.searchPresets ?? [], presetId, {
        dealbreakers: [],
      });
      const updated = presets.find((p) => p.id === presetId)!;
      const primarySync = syncPrimarySearchToProfile(prev, updated);
      return withDefaults({ ...prev, ...primarySync, searchPresets: presets });
    });
  }, [applyUpdate]);

  const reset = useCallback(() => {
    const user = readAuthUser();
    const next = user
      ? withDefaults(createEmptyRoommateProfile(user.id, user.name, user.avatar))
      : withDefaults(demoSeeker);
    setProfileState(next);
    scheduleSave(next);
  }, [scheduleSave]);

  const updateProfile = useCallback(
    (patch: Partial<RoommateProfile>) => {
      applyUpdate((prev) => withDefaults({ ...prev, ...patch }));
    },
    [applyUpdate]
  );

  const setDiscoverable = useCallback(
    (visible: boolean) => {
      updateProfile({ isDiscoverable: visible });
    },
    [updateProfile]
  );

  const activeSearchPreset = useMemo(() => getActiveSearchPreset(profile), [profile]);

  const setActiveSearchPreset = useCallback(
    (id: string) => {
      applyUpdate((prev) => ({ ...prev, activeSearchPresetId: id }));
    },
    [applyUpdate]
  );

  const updateActiveSearchPreset = useCallback(
    (patch: Partial<SearchPreset>) => {
      applyUpdate((prev) => {
        const presetId = prev.activeSearchPresetId ?? "my-search";
        const presets = patchSearchPreset(prev.searchPresets ?? [], presetId, patch);
        const active = presets.find((p) => p.id === presetId);
        const primarySync = active ? syncPrimarySearchToProfile(prev, active) : {};
        return withDefaults({ ...prev, ...primarySync, searchPresets: presets });
      });
    },
    [applyUpdate]
  );

  const setActivePresetLookingFor = useCallback(
    (key: string, value: unknown) => {
      applyUpdate((prev) => {
        const presetId = prev.activeSearchPresetId ?? "my-search";
        let presets = patchActivePresetLookingFor(
          prev.searchPresets ?? [],
          presetId,
          key,
          value
        );

        // Keep gender preference aligned across presets when edited on "My search".
        if (key === "gender_preference" && presetId === "my-search") {
          presets = presets.map((p) =>
            p.id === "strict"
              ? { ...p, lookingFor: { ...p.lookingFor, gender_preference: value } as Preferences }
              : p
          );
        }

        const active = presets.find((p) => p.id === presetId);
        const primarySync = active ? syncPrimarySearchToProfile(prev, active) : {};
        return withDefaults({ ...prev, ...primarySync, searchPresets: presets });
      });
    },
    [applyUpdate]
  );

  const toggleActivePresetDealbreaker = useCallback(
    (key: string) => {
      applyUpdate((prev) => {
        const presetId = prev.activeSearchPresetId ?? "my-search";
        const active = getActiveSearchPreset(prev);
        const current = active.dealbreakers ?? [];
        const nextBreakers = current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key];
        const presets = patchSearchPreset(prev.searchPresets ?? [], presetId, {
          dealbreakers: nextBreakers,
        });
        const updated = presets.find((p) => p.id === presetId)!;
        const primarySync = syncPrimarySearchToProfile(prev, updated);
        return withDefaults({ ...prev, ...primarySync, searchPresets: presets });
      });
    },
    [applyUpdate]
  );

  const isActivePresetDealbreaker = useCallback(
    (key: string) => (getActiveSearchPreset(profile).dealbreakers ?? []).includes(key),
    [profile]
  );

  const PROFILE_BASICS_REQUIRED = 2;

  /** Profile completeness — lifestyle answers only (not search criteria). */
  const profileCompleteness = useCallback(() => {
    const requiredKeys = new Set(REQUIRED_DIMENSIONS.map((d) => d.key));
    const answered = Object.entries(profile.preferences).filter(
      ([key, v]) =>
        requiredKeys.has(key) &&
        v !== undefined &&
        v !== null &&
        (Array.isArray(v) ? v.length > 0 : true)
    ).length;
    return REQUIRED_DIMENSIONS.length === 0
      ? 0
      : Math.min(1, answered / REQUIRED_DIMENSIONS.length);
  }, [profile.preferences]);

  /** Search criteria completeness — budget, move-in, and looking-for dimensions. */
  const searchCompleteness = useCallback(() => {
    const basicsAnswered =
      (profile.monthlyBudgetAed != null && profile.monthlyBudgetAed > 0 ? 1 : 0) +
      (profile.moveInDate ? 1 : 0);
    const requiredKeys = new Set(SEARCH_REQUIRED_DIMENSIONS.map((d) => d.key));
    const criteria = profile.lookingFor ?? {};
    const answered = Object.entries(criteria).filter(
      ([key, v]) =>
        requiredKeys.has(key) &&
        v !== undefined &&
        v !== null &&
        (Array.isArray(v) ? v.length > 0 : true)
    ).length;
    const total = PROFILE_BASICS_REQUIRED + SEARCH_REQUIRED_DIMENSIONS.length;
    return total === 0 ? 0 : Math.min(1, (basicsAnswered + answered) / total);
  }, [profile.monthlyBudgetAed, profile.moveInDate, profile.lookingFor]);

  /** Combined completeness for legacy UI. */
  const completeness = useCallback(() => {
    const profilePart = profileCompleteness();
    const searchPart = searchCompleteness();
    return Math.min(1, (profilePart + searchPart) / 2);
  }, [profileCompleteness, searchCompleteness]);

  const basicsComplete = useCallback(() => {
    return (
      profile.monthlyBudgetAed != null &&
      profile.monthlyBudgetAed > 0 &&
      Boolean(profile.moveInDate)
    );
  }, [profile.monthlyBudgetAed, profile.moveInDate]);

  const profileBasicsComplete = useCallback(() => {
    const requiredKeys = new Set(REQUIRED_DIMENSIONS.map((d) => d.key));
    return Object.entries(profile.preferences).some(
      ([key, v]) =>
        requiredKeys.has(key) &&
        v !== undefined &&
        v !== null &&
        (Array.isArray(v) ? v.length > 0 : true)
    );
  }, [profile.preferences]);

  return {
    profile,
    loading,
    saving,
    refresh,
    saveNow,
    setProfile,
    updateProfile,
    setPreference,
    setLookingFor,
    toggleDealbreaker,
    isDealbreaker,
    setDealbreakers,
    applySuggestedDealbreakers,
    clearDealbreakers,
    setDiscoverable,
    reset,
    completeness,
    profileCompleteness,
    searchCompleteness,
    basicsComplete,
    profileBasicsComplete,
    isMatchProfileReady: () => isMatchProfileReady(profile),
    activeSearchPreset,
    setActiveSearchPreset,
    updateActiveSearchPreset,
    setActivePresetLookingFor,
    toggleActivePresetDealbreaker,
    isActivePresetDealbreaker,
    mockCandidates,
  };
}
