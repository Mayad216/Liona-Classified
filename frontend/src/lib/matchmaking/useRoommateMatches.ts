/**
 * Prefers the server engine (which adds semantic bio affinity via embeddings)
 * and falls back to the in-browser engine whenever the server can't answer.
 *
 * Every fallback path is deliberate: an unverified Emirates ID, an unsaved
 * profile, a cold database or a network blip should degrade the ranking, never
 * blank the page. `source` tells the UI which engine produced what it's
 * showing so it can label demo data honestly.
 */

import { useEffect, useMemo, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import { AUTH_USER_KEY, type AuthUser } from "@/lib/auth";
import { isMatchDemoMode } from "./matchDemoMode";
import { mapMatchResultFromApi, mapMatchResultsFromApi, type ApiMatchRow } from "./matchesApi";
import { scorePair, topMatches } from "./engine";
import type { MatchResult, RoommateProfile } from "./types";

export type MatchSource = "api" | "local";

function readAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/** The server can only score for a signed-in, non-demo user. */
function liveToken(): string | null {
  if (isMatchDemoMode()) return null;
  const token = getStoredAuthToken();
  return token && readAuthUser() ? token : null;
}

export interface UseRoommateMatchesResult {
  results: MatchResult[];
  source: MatchSource;
  loading: boolean;
}

export function useRoommateMatches(
  seeker: RoommateProfile,
  localCandidates: RoommateProfile[],
  opts: { minScore?: number; limit?: number } = {}
): UseRoommateMatchesResult {
  const { minScore, limit } = opts;

  const localResults = useMemo(
    () => topMatches(seeker, localCandidates, { minScore, limit }),
    [seeker, localCandidates, minScore, limit]
  );

  const [apiResults, setApiResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Search criteria are sent to the server because presets are client-side
  // only. Serialised so a re-render with an equal preset doesn't refetch —
  // each fetch can cost embedding calls.
  const criteria = useMemo(
    () =>
      JSON.stringify({
        looking_for: seeker.lookingFor ?? {},
        dealbreakers: seeker.dealbreakers ?? [],
        min_score: minScore,
        limit,
      }),
    [seeker.lookingFor, seeker.dealbreakers, minScore, limit]
  );

  useEffect(() => {
    const token = liveToken();
    if (!token) {
      setApiResults(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const res = await api.roommateMatchSearch(JSON.parse(criteria), token);
        if (cancelled) return;
        const mapped = mapMatchResultsFromApi(res.data);
        // An empty server response is ambiguous — "nobody is compatible" and
        // "no profiles exist yet" look identical. Keep the local ranking
        // rather than showing an empty state we can't explain.
        setApiResults(mapped.length > 0 ? mapped : null);
      } catch {
        if (!cancelled) setApiResults(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [criteria]);

  return {
    results: apiResults ?? localResults,
    source: apiResults ? "api" : "local",
    loading,
  };
}

export function useRoommateMatchPair(
  seeker: RoommateProfile,
  candidate: RoommateProfile | undefined
): { result: MatchResult | null; source: MatchSource; loading: boolean } {
  const localResult = useMemo(
    () => (candidate ? scorePair(seeker, candidate) : null),
    [seeker, candidate]
  );

  const [apiResult, setApiResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const candidateId = candidate?.userId;

  useEffect(() => {
    const token = liveToken();
    if (!token || !candidateId) {
      setApiResult(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const res = await api.roommateMatchPair(candidateId, token);
        if (cancelled) return;
        setApiResult(res.data ? mapMatchResultFromApi(res.data as ApiMatchRow) : null);
      } catch {
        if (!cancelled) setApiResult(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  return {
    result: apiResult ?? localResult,
    source: apiResult ? "api" : "local",
    loading,
  };
}
