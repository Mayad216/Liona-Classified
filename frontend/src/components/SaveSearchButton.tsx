import { useState } from "react";
import { Bell, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocalRecords } from "@/lib/useLocalList";

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, unknown>;
  url: string;
  createdAt: string;
  alertsEnabled: boolean;
  newResults: number;
}

export const SAVED_SEARCHES_KEY = "khaleej:saved-searches";

export function useSavedSearches() {
  return useLocalRecords<SavedSearch>(SAVED_SEARCHES_KEY);
}

interface Props {
  buildSearch: () => Omit<SavedSearch, "id" | "createdAt" | "alertsEnabled" | "newResults">;
  variant?: "button" | "compact";
}

export function SaveSearchButton({ buildSearch, variant = "button" }: Props) {
  const { items, upsert } = useSavedSearches();
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    const base = buildSearch();
    const exists = items.find((s) => s.url === base.url);
    if (exists) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      return;
    }
    upsert({
      ...base,
      id: `ss-${Date.now()}`,
      createdAt: new Date().toISOString(),
      alertsEnabled: true,
      newResults: 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={onSave}
        title="Save search & get alerts"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700"
      >
        {saved ? <Check className="h-4 w-4 text-emerald-600" /> : <Bell className="h-4 w-4" />}
        {saved ? "Saved!" : "Save & alert"}
      </button>
    );
  }

  return (
    <Button variant="outline" size="md" onClick={onSave}>
      {saved ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" />
          Saved!
        </>
      ) : (
        <>
          <BellRing className="h-4 w-4" />
          Save search & alert
        </>
      )}
    </Button>
  );
}
