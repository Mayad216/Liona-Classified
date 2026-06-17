import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import type { CopilotApplication, CopilotAutoApplyConsent } from "@/types/copilot";

export function useCopilotAutoApply() {
  const [consent, setConsent] = useState<CopilotAutoApplyConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [queueingId, setQueueingId] = useState<number | null>(null);

  const refreshConsent = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setConsent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.copilotAutoApplyConsent(token);
      setConsent(res.data);
    } catch {
      setConsent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConsent();
  }, [refreshConsent]);

  const grantConsent = async () => {
    const token = getStoredAuthToken();
    if (!token) throw new Error("Sign in required");
    setSubmitting(true);
    try {
      await api.copilotGrantAutoApplyConsent(token);
      await refreshConsent();
    } finally {
      setSubmitting(false);
    }
  };

  const revokeConsent = async () => {
    const token = getStoredAuthToken();
    if (!token) return;
    setSubmitting(true);
    try {
      await api.copilotRevokeAutoApplyConsent(token);
      await refreshConsent();
    } finally {
      setSubmitting(false);
    }
  };

  const queueAutoApply = async (matchId: number): Promise<CopilotApplication> => {
    const token = getStoredAuthToken();
    if (!token) throw new Error("Sign in required");
    setQueueingId(matchId);
    try {
      const res = await api.copilotQueueAutoApply(matchId, token);
      return res.data;
    } finally {
      setQueueingId(null);
    }
  };

  return {
    consent,
    loading,
    submitting,
    queueingId,
    refreshConsent,
    grantConsent,
    revokeConsent,
    queueAutoApply,
  };
}
