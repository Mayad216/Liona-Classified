import { useEffect, useMemo, useState } from "react";
import { aiAutocompleteSuggestions } from "@/lib/resume/ai";
import {
  filterSuggestions,
  getSuggestionCatalog,
  mergeSuggestions,
  type ResumeAutocompleteField,
} from "@/lib/resume/suggestions";

export function useFieldSuggestions(
  fieldType: ResumeAutocompleteField,
  query: string,
  enabled: boolean
) {
  const catalog = getSuggestionCatalog(fieldType);
  const local = useMemo(
    () => filterSuggestions(catalog, query, 8),
    [catalog, query]
  );

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setAiSuggestions([]);
      setLoading(false);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setAiSuggestions([]);
      setLoading(false);
      return;
    }

    if (trimmed.length < 2 || local.length >= 6) {
      setAiSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      void aiAutocompleteSuggestions(fieldType, trimmed)
        .then((items) => {
          if (cancelled) return;
          const localKeys = new Set(local.map((s) => s.toLowerCase()));
          setAiSuggestions(items.filter((item) => !localKeys.has(item.toLowerCase())));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, fieldType, query, local.length]);

  const suggestions = useMemo(
    () => mergeSuggestions(local, aiSuggestions, 10),
    [local, aiSuggestions]
  );

  return { suggestions, aiSuggestions, loading };
}
