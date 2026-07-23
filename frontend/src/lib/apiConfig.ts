let resolvedBaseUrl: string | null = null;

const DEFAULT_API_URL = "http://localhost:8000/api/v1";

export function getApiBaseUrl(): string {
  return (
    resolvedBaseUrl ??
    import.meta.env.VITE_API_URL ??
    DEFAULT_API_URL
  );
}

/** Load /config.json written at deploy time on Railway (see frontend/scripts/railway-start.sh). */
export async function loadApiConfig(): Promise<void> {
  if (import.meta.env.VITE_API_URL) {
    resolvedBaseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
    return;
  }

  try {
    const res = await fetch("/config.json", { cache: "no-store" });
    if (!res.ok) return;
    const cfg = (await res.json()) as { apiUrl?: string };
    if (cfg.apiUrl) {
      resolvedBaseUrl = cfg.apiUrl.replace(/\/$/, "");
    }
  } catch {
    // Offline demo mode keeps localhost fallback.
  }
}
