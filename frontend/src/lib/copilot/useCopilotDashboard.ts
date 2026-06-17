import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import type { CopilotDashboard } from "@/types/copilot";

export function useCopilotDashboard() {
  const [data, setData] = useState<CopilotDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getStoredAuthToken();

    if (!token) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.copilotDashboard(token);
      setData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
