import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import {
  getStoredBusinessProfile,
  saveStoredBusinessProfile,
} from "@/lib/businessProfile/store";
import type { BusinessProfile, BusinessProfileInput } from "@/types/businessProfile";
import { isBusinessProfileComplete } from "@/types/businessProfile";

export function useBusinessProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const token = getStoredAuthToken();
    if (token) {
      try {
        const res = await api.businessProfile(token);
        setProfile((res.data as BusinessProfile | null) ?? null);
        setLoading(false);
        return;
      } catch {
        /* fall back to local store when API unavailable */
      }
    }

    setProfile(getStoredBusinessProfile(userId));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => {
      void refresh();
    };
    window.addEventListener("khaleej:business-profile", onChange);
    return () => window.removeEventListener("khaleej:business-profile", onChange);
  }, [refresh]);

  const save = useCallback(
    async (input: BusinessProfileInput) => {
      if (!userId) throw new Error("Sign in to create a Business Profile.");

      setSaving(true);
      setError(null);

      try {
        const token = getStoredAuthToken();
        if (token) {
          const res = await api.upsertBusinessProfile(input, token);
          setProfile(res.data as BusinessProfile);
          return res.data as BusinessProfile;
        }

        const local = saveStoredBusinessProfile(userId, input);
        setProfile(local);
        return local;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not save Business Profile.";
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  return {
    profile,
    loading,
    saving,
    error,
    isComplete: isBusinessProfileComplete(profile),
    refresh,
    save,
  };
}
