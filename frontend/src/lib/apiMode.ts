import { getApiBaseUrl } from "@/lib/apiConfig";

/** True when the SPA talks to a remote API (Railway staging/production), not local Laravel. */
export function isLiveApi(): boolean {
  const base = getApiBaseUrl();
  return !base.includes("localhost") && !base.includes("127.0.0.1");
}

export function isDemoMode(): boolean {
  return !isLiveApi();
}
