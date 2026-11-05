import { isLiveApi } from "@/lib/apiMode";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { sanitizeErrorMessage } from "@/lib/apiErrors";

export function CatalogStatus({
  loading,
  error,
  live,
  emptyLabel = "No listings yet.",
}: {
  loading?: boolean;
  error?: string | null;
  live?: boolean;
  emptyLabel?: string;
}) {
  if (!live && !isLiveApi()) return null;

  if (loading) {
    return (
      <p className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">
        Loading live data from the API…
      </p>
    );
  }

  if (error) {
    const message = sanitizeErrorMessage(error);
    return (
      <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
        {message}
        {import.meta.env.DEV && (
          <span className="mt-1 block text-xs text-red-700/80">
            Dev: API at {getApiBaseUrl()}. If this persists, check backend MySQL on Railway.
          </span>
        )}
      </p>
    );
  }

  return null;
}

export function LiveApiBadge() {
  if (!isLiveApi()) return null;
  return (
    <span
      className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:inline"
      title={`API: ${getApiBaseUrl()}`}
    >
      Live API
    </span>
  );
}
