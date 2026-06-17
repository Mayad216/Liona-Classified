import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, Star } from "lucide-react";
import { aiSuggestJobDescriptions } from "@/lib/resume/ai";
import { descriptionIncludesSuggestion } from "@/lib/resume/experienceDescription";
import {
  getLocalJobDescriptionSuggestions,
  sortSuggestions,
  type JobDescriptionSuggestion,
} from "@/lib/resume/jobDescriptionSuggestions";
import { cn } from "@/lib/utils";

type Props = {
  jobTitle: string;
  company?: string;
  descriptionText: string;
  onAppend: (text: string) => void;
};

export function ExperienceDescriptionSuggestions({
  jobTitle,
  company,
  descriptionText,
  onAppend,
}: Props) {
  const [suggestions, setSuggestions] = useState<JobDescriptionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"local" | "ai">("local");

  useEffect(() => {
    if (!jobTitle.trim()) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const local = getLocalJobDescriptionSuggestions(jobTitle);
    setSuggestions(local);
    setSource("local");
    setLoading(true);

    void aiSuggestJobDescriptions(jobTitle, company)
      .then(({ suggestions: items, fromAi }) => {
        if (cancelled || items.length === 0) return;
        setSuggestions(items);
        setSource(fromAi ? "ai" : "local");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobTitle, company]);

  const visible = useMemo(
    () =>
      sortSuggestions(suggestions).filter(
        (s) => !descriptionIncludesSuggestion(descriptionText, s.text)
      ),
    [suggestions, descriptionText]
  );

  if (!jobTitle.trim()) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Add a job title first to see AI description suggestions.
      </p>
    );
  }

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-xl border border-[#00a67e]/20 bg-gradient-to-b from-[#00a67e]/5 to-white p-4">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Suggested descriptions</p>
          <p className="text-xs text-slate-500">
            Based on <span className="font-medium text-slate-700">{jobTitle}</span>
            {company ? ` at ${company}` : ""}. Click to add — then edit on the right.
          </p>
        </div>
        {loading && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#00a67e]" aria-hidden />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.length === 0 && !loading ? (
          <p className="text-sm text-slate-500">
            Suggestions added or hidden. Keep editing your description on the right.
          </p>
        ) : (
          <ul className="space-y-2 pr-1">
            {visible.map((item) => (
              <li key={item.text}>
                <button
                  type="button"
                  onClick={() => onAppend(item.text)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition hover:border-[#00a67e]/40 hover:bg-[#00a67e]/5",
                    item.recommended
                      ? "border-amber-200 bg-amber-50/60"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <span className="min-w-0 flex-1 text-slate-700">{item.text}</span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    {item.recommended && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Highly recommended
                      </span>
                    )}
                    {source === "ai" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#00a67e]">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
