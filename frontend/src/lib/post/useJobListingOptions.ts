import { useCallback, useEffect, useMemo, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import {
  JOB_INDUSTRIES,
  JOB_ROLES,
  mergeJobListingOptions,
} from "@/lib/post/jobListingCatalog";

const LOCAL_STORAGE_KEY = "khaleej_job_listing_custom_options_v1";

type CustomOptions = {
  roles: string[];
  industries: string[];
};

function readLocalCustomOptions(): CustomOptions {
  if (typeof window === "undefined") return { roles: [], industries: [] };
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { roles: [], industries: [] };
    const parsed = JSON.parse(raw) as Partial<CustomOptions>;
    return {
      roles: Array.isArray(parsed.roles) ? parsed.roles : [],
      industries: Array.isArray(parsed.industries) ? parsed.industries : [],
    };
  } catch {
    return { roles: [], industries: [] };
  }
}

function writeLocalCustomOptions(next: CustomOptions): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
}

function appendUnique(list: string[], name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return list;
  const key = trimmed.toLowerCase();
  if (list.some((item) => item.toLowerCase() === key)) return list;
  return [...list, trimmed];
}

export function useJobListingOptions() {
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [customIndustries, setCustomIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const local = readLocalCustomOptions();

    try {
      const res = await api.jobListingOptions();
      setCustomRoles(mergeUniqueLists(local.roles, res.data.roles));
      setCustomIndustries(mergeUniqueLists(local.industries, res.data.industries));
      writeLocalCustomOptions({
        roles: mergeUniqueLists(local.roles, res.data.roles),
        industries: mergeUniqueLists(local.industries, res.data.industries),
      });
    } catch {
      setCustomRoles(local.roles);
      setCustomIndustries(local.industries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const roleSelectOptions = useMemo(
    () => mergeJobListingOptions(JOB_ROLES, customRoles, true, "Select a role…"),
    [customRoles]
  );

  const industrySelectOptions = useMemo(
    () => mergeJobListingOptions(JOB_INDUSTRIES, customIndustries, true, "Select an industry…"),
    [customIndustries]
  );

  const saveCustomOption = useCallback(
    async (kind: "role" | "industry", name: string): Promise<string> => {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        throw new Error("Name too short");
      }

      let savedName = trimmed;
      const token = getStoredAuthToken();

      try {
        const res = await api.createJobListingOption({ kind, name: trimmed }, token ?? undefined);
        savedName = res.data.name;
      } catch {
        /* keep trimmed name locally when API is offline */
      }

      if (kind === "role") {
        setCustomRoles((prev) => {
          const next = appendUnique(prev, savedName);
          writeLocalCustomOptions({
            roles: next,
            industries: customIndustries,
          });
          return next;
        });
      } else {
        setCustomIndustries((prev) => {
          const next = appendUnique(prev, savedName);
          writeLocalCustomOptions({
            roles: customRoles,
            industries: next,
          });
          return next;
        });
      }

      return savedName;
    },
    [customIndustries, customRoles]
  );

  return {
    loading,
    roleSelectOptions,
    industrySelectOptions,
    saveCustomOption,
    refresh,
  };
}

function mergeUniqueLists(a: string[], b: string[]): string[] {
  let out = [...a];
  for (const item of b) {
    out = appendUnique(out, item);
  }
  return out;
}
