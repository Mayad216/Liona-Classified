import { useCallback, useEffect, useState } from "react";
import { copilotAiUsage } from "@/lib/copilot/ai";
import type { CopilotAiUsage } from "@/types/copilot";

export function useCopilotAiUsage() {
  const [usage, setUsage] = useState<CopilotAiUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await copilotAiUsage();
      setUsage(data);
    } catch {
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, loading, refresh, setUsage };
}
