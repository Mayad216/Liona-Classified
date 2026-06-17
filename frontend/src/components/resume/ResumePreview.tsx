import { A4_MIN_HEIGHT, A4_PAGE_PADDING, A4_WIDTH } from "@/lib/resume/pageSize";
import { AtsResumeContent } from "./templates/AtsResumeContent";
import { isResumeTemplate, DEFAULT_RESUME_TEMPLATE } from "@/lib/resume/templates";
import type { ResumeData, ResumeTemplate } from "@/types/resume";
import { cn } from "@/lib/utils";

export function ResumePreview({
  data,
  template,
  watermark,
  accentColor,
  fontFamily,
  pageSize = "a4",
}: {
  data: ResumeData;
  template: ResumeTemplate | string;
  watermark?: boolean;
  accentColor?: string;
  fontFamily?: string;
  /** "a4" = true print dimensions; "fit" = shrink to container (thumbnail grids) */
  pageSize?: "a4" | "fit";
}) {
  const tpl = isResumeTemplate(template) ? template : DEFAULT_RESUME_TEMPLATE;
  const isA4 = pageSize === "a4";

  return (
    <div
      className={cn(
        "relative box-border bg-white text-black shadow-lg print:shadow-none",
        isA4 ? "shrink-0" : "mx-auto w-full max-w-[210mm]"
      )}
      style={
        isA4
          ? {
              width: A4_WIDTH,
              minHeight: A4_MIN_HEIGHT,
              padding: A4_PAGE_PADDING,
            }
          : { padding: "2rem" }
      }
    >
      <AtsResumeContent
        data={data}
        template={tpl}
        accentColor={accentColor}
        fontFamily={fontFamily}
      />
      {watermark && (
        <p className="pointer-events-none absolute bottom-4 right-4 text-[8px] text-slate-400">
          Created with Khaleej
        </p>
      )}
    </div>
  );
}
