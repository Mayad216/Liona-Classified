import { ResumePreview } from "@/components/resume/ResumePreview";
import { ScaledA4Frame } from "@/components/resume/builder/ScaledA4Frame";
import { ResumeTipsPanel } from "@/components/resume/builder/ResumeTipsPanel";
import { BUILDER_PREVIEW_SCALE } from "@/lib/resume/pageSize";
import type { ResumeDesignSettings, ResumeSectionDef } from "@/lib/resume/sections";
import type { ResumeData, ResumeTemplate } from "@/types/resume";

interface Props {
  data: ResumeData;
  template: ResumeTemplate;
  design: ResumeDesignSettings;
  watermark?: boolean;
  section: ResumeSectionDef;
  /** When true, tips panel is hidden (e.g. mobile inline preview) */
  compact?: boolean;
}

export function ResumePreviewPanel({
  data,
  template,
  design,
  watermark,
  section,
  compact = false,
}: Props) {
  const scalePct = Math.round(BUILDER_PREVIEW_SCALE * 100);

  return (
    <div className={compact ? "space-y-3" : "flex h-full flex-col border-l border-slate-200 bg-[#e8ecf0]"}>
      {!compact && (
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preview</p>
          <p className="text-[10px] text-slate-400">
            A4 · 210 × 297 mm · shown at {scalePct}% (print size unchanged)
          </p>
        </div>
      )}
      <div className={compact ? "overflow-x-auto pb-2" : "min-h-0 flex-1 overflow-auto p-4"}>
        <ScaledA4Frame
          className="mx-auto rounded-sm border border-slate-300 bg-white shadow-md"
        >
          <ResumePreview
            data={data}
            template={template}
            watermark={watermark}
            accentColor={design.accentColor}
            fontFamily={design.fontFamily}
            pageSize="a4"
          />
        </ScaledA4Frame>
      </div>
      {!compact && <ResumeTipsPanel section={section} />}
    </div>
  );
}
