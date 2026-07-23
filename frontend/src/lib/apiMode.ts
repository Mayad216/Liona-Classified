import { getApiBaseUrl, isLocalHost, isRailwayHost } from "@/lib/apiConfig";

/** True when the SPA should use the remote Laravel API (not local mock/demo mode). */
export function isLiveApi(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (isRailwayHost(host)) return true;
    if (!isLocalHost(host)) {
      const base = getApiBaseUrl();
      return !base.includes("localhost") && !base.includes("127.0.0.1");
    }
  }

  const base = getApiBaseUrl();
  return !base.includes("localhost") && !base.includes("127.0.0.1");
}

export function isDemoMode(): boolean {
  return !isLiveApi();
}
