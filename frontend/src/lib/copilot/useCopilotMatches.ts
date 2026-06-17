import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import type { CopilotJobMatch } from "@/types/copilot";

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};

export function useCopilotMatches(
  status: "recommended" | "saved" | "all" = "recommended",
  country?: string
) {
  const [items, setItems] = useState<CopilotJobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.copilotRecommendedJobs(token, status, country);
      const paginated = res as Paginated<CopilotJobMatch>;
      setItems(paginated.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load matches");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status, country]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recalculate = async (sync = true) => {
    const token = getStoredAuthToken();
    if (!token) return;
    setRecalculating(true);
    try {
      await api.recalculateCopilotMatches(token, sync);
      await refresh();
    } finally {
      setRecalculating(false);
    }
  };

  const save = async (matchId: number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    await api.saveCopilotMatch(matchId, token);
    await refresh();
  };

  const dismiss = async (matchId: number) => {
    const token = getStoredAuthToken();
    if (!token) return;
    await api.dismissCopilotMatch(matchId, token);
    setItems((prev) => prev.filter((m) => m.id !== matchId));
  };

  return { items, loading, error, recalculating, refresh, recalculate, save, dismiss };
}
