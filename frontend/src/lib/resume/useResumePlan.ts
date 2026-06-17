import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import { resumeStore } from "@/lib/resume/store";
import { getResumePlan, setResumePlan, type ResumePlan } from "@/lib/resume/plan";

export function useResumePlan() {
  const [plan, setPlan] = useState<ResumePlan>(() => getResumePlan());

  useEffect(() => {
    setPlan(getResumePlan());
  }, []);

  const upgradeToPro = useCallback(async () => {
    const token = getStoredAuthToken();

    if (token) {
      try {
        await api.subscribeResumePro(token);
      } catch {
        // local-only upgrade still works offline
      }
    }

    setResumePlan("pro");
    setPlan("pro");

    for (const r of resumeStore.list()) {
      resumeStore.save(String(r.id), { watermark: false });
    }
  }, []);

  const isPro = plan === "pro";

  return { plan, isPro, upgradeToPro };
}
