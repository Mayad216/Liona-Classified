import { CheckCircle2 } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { cn } from "@/lib/utils";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sampleResumeData";
import type { ResumeTemplate, TemplateMeta } from "@/lib/resume/templates";

type Props = {
  template: TemplateMeta;
  selected: boolean;
  onSelect: (id: ResumeTemplate) => void;
  variant?: "grid" | "compact";
};

export function ResumeTemplatePreviewCard({
  template,
  selected,
  onSelect,
  variant = "grid",
}: Props) {
  const isCompact = variant === "compact";

  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-white text-left transition",
        selected
          ? "border-[#00a67e] ring-2 ring-[#00a67e]/30"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[#e8ecf0]",
          isCompact ? "h-36" : "h-52 sm:h-56"
        )}
      >
        <div
          className={cn(
            "pointer-events-none origin-top-left",
            isCompact ? "scale-[0.22] p-8" : "scale-[0.28] p-8 sm:scale-[0.32]"
          )}
          style={{ width: "210mm" }}
        >
          <ResumePreview
            data={SAMPLE_RESUME_DATA}
            template={template.id}
            accentColor={template.previewAccent}
            pageSize="fit"
          />
        </div>
        {selected && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#00a67e] px-2 py-0.5 text-[10px] font-bold text-white">
            <CheckCircle2 className="h-3 w-3" />
            Selected
          </span>
        )}
      </div>

      <div className={cn("border-t border-slate-100", isCompact ? "p-2.5" : "p-3")}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-900">{template.label}</span>
          <span
            className="h-3 w-3 shrink-0 rounded-full ring-1 ring-slate-200"
            style={{ backgroundColor: template.previewAccent }}
            title="Accent color"
          />
        </div>
        {!isCompact && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500">
            {template.blurb}
          </p>
        )}
      </div>
    </button>
  );
}
