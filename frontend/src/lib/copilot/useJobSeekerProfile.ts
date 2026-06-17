import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import {
  EMPTY_JOB_SEEKER_PROFILE,
  type JobSeekerProfile,
  type ScreeningAnswer,
  type ScreeningQuestion,
} from "@/types/copilot";

const STORAGE_KEY = "khaleej:copilot:profile";

function loadLocal(): JobSeekerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY_JOB_SEEKER_PROFILE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...EMPTY_JOB_SEEKER_PROFILE };
}

export function useJobSeekerProfile() {
  const [profile, setProfile] = useState<JobSeekerProfile>(loadLocal);
  const [screeningAnswers, setScreeningAnswers] = useState<ScreeningAnswer[]>([]);
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setProfile(loadLocal());
      setLoading(false);
      return;
    }

    try {
      const res = await api.copilotProfile(token);
      if (res.data.profile) {
        setProfile({ ...EMPTY_JOB_SEEKER_PROFILE, ...res.data.profile });
      }
      setScreeningAnswers(res.data.screening_answers ?? []);
      setScreeningQuestions(res.data.screening_questions ?? []);
    } catch {
      setProfile(loadLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async (
    next: Partial<JobSeekerProfile>,
    answers?: ScreeningAnswer[]
  ) => {
    const merged = { ...profile, ...next };
    setProfile(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setSaving(true);

    const token = getStoredAuthToken();
    if (!token) {
      setSaving(false);
      return merged;
    }

    try {
      const payload = {
        ...merged,
        target_job_titles: merged.target_job_titles ?? [],
        target_industries: merged.target_industries ?? [],
        preferred_locations: merged.preferred_locations ?? [],
        screening_answers: answers,
      };
      const res = await api.updateCopilotProfile(payload, token);
      if (res.data.profile) {
        setProfile({ ...EMPTY_JOB_SEEKER_PROFILE, ...res.data.profile });
      }
      return res.data.profile ?? merged;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    screeningAnswers,
    screeningQuestions,
    loading,
    saving,
    save,
    refresh,
  };
}
