import type { ResumeRecord } from "@/types/resume";

export function needsScreening(resume: ResumeRecord): boolean {
  return resume.setup_step === "screening";
}

export function needsTemplateSelection(resume: ResumeRecord): boolean {
  return resume.setup_step === "template";
}

export function resumeBuilderPath(resume: ResumeRecord): string {
  if (needsScreening(resume)) return `/resume/${resume.id}/screening`;
  if (needsTemplateSelection(resume)) return `/resume/${resume.id}/template`;
  return `/resume/${resume.id}/edit`;
}
