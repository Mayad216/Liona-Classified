import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeTemplatePreviewCard } from "@/components/resume/ResumeTemplatePreviewCard";
import {
  ATS_APPROVAL_THRESHOLD,
  ATS_PLATFORMS,
  getAtsPlatform,
  type AtsPlatformId,
} from "@/lib/resume/atsPlatforms";
import {
  getPlatformOptimizedTemplate,
  getTemplatesForPlatform,
  RESUME_TEMPLATES,
  type ResumeTemplate,
  type TemplateMeta,
} from "@/lib/resume/templates";

type Props = {
  value: ResumeTemplate;
  onChange: (template: ResumeTemplate) => void;
  /** Compact mode hides platform tips and uses a smaller grid */
  compact?: boolean;
  className?: string;
};

function platformScore(template: TemplateMeta, platform: AtsPlatformId | "all"): number | null {
  if (platform === "all") return template.ats.averageScore;
  return template.ats.platformScores[platform] ?? null;
}

function isApproved(template: TemplateMeta, platform: AtsPlatformId | "all"): boolean {
  if (platform === "all") return template.ats.averageScore >= ATS_APPROVAL_THRESHOLD;
  return template.ats.approvedPlatforms.includes(platform);
}

export function ResumeTemplateCatalog({ value, onChange, compact = false, className }: Props) {
  const [platformFilter, setPlatformFilter] = useState<AtsPlatformId | "all">("all");

  const visibleTemplates = useMemo(() => {
    if (platformFilter === "all") return RESUME_TEMPLATES;
    return getTemplatesForPlatform(platformFilter);
  }, [platformFilter]);

  const selectedMeta = RESUME_TEMPLATES.find((t) => t.id === value);
  const activePlatform = platformFilter === "all" ? null : getAtsPlatform(platformFilter);
  const optimizedPick =
    platformFilter !== "all" ? getPlatformOptimizedTemplate(platformFilter) : undefined;

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Target ATS platform
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setPlatformFilter("all")}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
              platformFilter === "all"
                ? "border-[#00a67e] bg-[#00a67e]/10 text-[#006b52]"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            All platforms
          </button>
          {ATS_PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatformFilter(p.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                platformFilter === p.id
                  ? "border-[#00a67e] bg-[#00a67e]/10 text-[#006b52]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {!compact && activePlatform && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">
            {activePlatform.name} · {activePlatform.segment}
          </p>
          <p className="mt-1">
            Preferred export:{" "}
            <span className="font-medium text-slate-800">
              {activePlatform.preferredExport === "docx"
                ? ".docx"
                : activePlatform.preferredExport === "pdf"
                  ? ".pdf"
                  : ".docx or .pdf"}
            </span>
          </p>
          {optimizedPick && (
            <button
              type="button"
              onClick={() => onChange(optimizedPick.id)}
              className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#006b52] ring-1 ring-[#00a67e]/30 hover:bg-[#00a67e]/5"
            >
              <ShieldCheck className="h-3 w-3" />
              Use {optimizedPick.label} (platform-optimized)
            </button>
          )}
        </div>
      )}

      <div>
        <label htmlFor="resume-template-select" className="sr-only">
          Resume template
        </label>
        <select
          id="resume-template-select"
          value={value}
          onChange={(e) => onChange(e.target.value as ResumeTemplate)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
        >
          {visibleTemplates.map((t) => {
            const score = platformScore(t, platformFilter);
            const approved = isApproved(t, platformFilter);
            return (
              <option key={t.id} value={t.id}>
                {t.label}
                {score != null ? ` · ${score}%` : ""}
                {approved ? " · ATS approved" : ""}
              </option>
            );
          })}
        </select>
      </div>

      <div
        className={cn(
          "grid gap-2",
          compact ? "max-h-48 grid-cols-2 overflow-y-auto sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {visibleTemplates.map((t) => {
          const score = platformScore(t, platformFilter);
          const approved = isApproved(t, platformFilter);

          if (compact) {
            return (
              <ResumeTemplatePreviewCard
                key={t.id}
                template={t}
                selected={value === t.id}
                onSelect={onChange}
                variant="compact"
              />
            );
          }

          return (
            <div key={t.id} className="space-y-1">
              <ResumeTemplatePreviewCard
                template={t}
                selected={value === t.id}
                onSelect={onChange}
              />
              <div className="flex flex-wrap items-center gap-1 px-1">
                {score != null && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold",
                      approved ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {score}% match
                  </span>
                )}
                {t.optimizedFor === platformFilter && platformFilter !== "all" && (
                  <span className="rounded bg-[#00a67e]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#006b52]">
                    Optimized
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!compact && selectedMeta && (
        <p className="text-[11px] text-slate-500">
          {selectedMeta.ats.approvedPlatforms.length} of {ATS_PLATFORMS.length} ATS platforms
          approve this layout (≥{ATS_APPROVAL_THRESHOLD}%). Recommended export:{" "}
          <span className="font-semibold text-slate-700">
            .{selectedMeta.ats.recommendedExport}
          </span>
        </p>
      )}
    </div>
  );
}
