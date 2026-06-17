import type { BusinessProfile, BusinessProfileInput } from "@/types/businessProfile";
import { isBusinessProfileComplete } from "@/types/businessProfile";

const STORAGE_KEY = "khaleej_business_profiles_v1";

type Store = Record<string, BusinessProfile>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("khaleej:business-profile"));
}

export function getStoredBusinessProfile(userId: string): BusinessProfile | null {
  return readStore()[userId] ?? null;
}

export function saveStoredBusinessProfile(
  userId: string,
  input: BusinessProfileInput
): BusinessProfile {
  const profile: BusinessProfile = {
    ...input,
    is_complete: isBusinessProfileComplete(input as BusinessProfile),
    updated_at: new Date().toISOString(),
  };

  const store = readStore();
  store[userId] = profile;
  writeStore(store);
  return profile;
}
