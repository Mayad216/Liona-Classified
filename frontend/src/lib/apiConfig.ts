let resolvedBaseUrl: string | null = null;

const DEFAULT_API_URL = "http://localhost:8000/api/v1";

declare global {
  interface Window {
    __KHaleej_API__?: string;
  }
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function setApiBaseUrl(url: string): void {
  resolvedBaseUrl = normalizeUrl(url);
}

export function getApiBaseUrl(): string {
  if (resolvedBaseUrl) return resolvedBaseUrl;
  if (typeof window !== "undefined" && window.__KHaleej_API__) {
    return normalizeUrl(window.__KHaleej_API__);
  }
  const builtIn = import.meta.env.VITE_API_URL;
  if (builtIn) return normalizeUrl(builtIn);
  return DEFAULT_API_URL;
}

/** Load runtime API config before the app renders. */
export async function loadApiConfig(): Promise<void> {
  if (typeof window !== "undefined" && window.__KHaleej_API__) {
    setApiBaseUrl(window.__KHaleej_API__);
    return;
  }

  if (import.meta.env.VITE_API_URL) {
    setApiBaseUrl(import.meta.env.VITE_API_URL);
    return;
  }

  try {
    const res = await fetch("/config.json", { cache: "no-store" });
    if (res.ok) {
      const cfg = (await res.json()) as { apiUrl?: string };
      if (cfg.apiUrl) {
        setApiBaseUrl(cfg.apiUrl);
        return;
      }
    }
  } catch {
    /* fall through */
  }

  if (typeof window !== "undefined" && isRailwayHost(window.location.hostname)) {
    console.warn(
      "[Khaleej] On Railway but API URL missing. Set VITE_API_URL or BACKEND_PUBLIC_DOMAIN on the frontend service."
    );
  }
}

export function isRailwayHost(hostname: string): boolean {
  return hostname.endsWith(".up.railway.app") || hostname.endsWith(".railway.app");
}

export function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}
