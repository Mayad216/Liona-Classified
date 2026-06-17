import type { AtsPlatformId } from "@/lib/resume/atsPlatforms";
import { ATS_APPROVAL_THRESHOLD } from "@/lib/resume/atsPlatforms";
import type { AtsTemplateStyle, ResumeTemplate } from "@/lib/resume/templates";

export type AtsTemplateScores = {
  average: number;
  byPlatform: Record<AtsPlatformId, number>;
  approvedPlatforms: AtsPlatformId[];
  recommendedExport: "docx" | "pdf";
};

const PLATFORM_IDS: AtsPlatformId[] = [
  "greenhouse",
  "lever",
  "workday",
  "ashby",
  "icims",
  "taleo",
  "smartrecruiters",
];

const PLATFORM_OPTIMIZED: Partial<Record<ResumeTemplate, Partial<Record<AtsPlatformId, number>>>> = {
  greenhouse: { greenhouse: 98, lever: 94, workday: 93, ashby: 96, icims: 92, taleo: 91, smartrecruiters: 94 },
  workday: { workday: 99, greenhouse: 94, lever: 93, ashby: 92, icims: 95, taleo: 96, smartrecruiters: 93 },
  lever: { lever: 97, greenhouse: 95, workday: 94, ashby: 96, icims: 93, taleo: 92, smartrecruiters: 95 },
  ashby: { ashby: 98, greenhouse: 96, lever: 97, workday: 93, icims: 92, taleo: 90, smartrecruiters: 95 },
  metro: { ashby: 96, greenhouse: 95, lever: 96, workday: 92, icims: 91, smartrecruiters: 94, taleo: 89 },
  signal: { greenhouse: 95, ashby: 95, lever: 94, workday: 93, smartrecruiters: 94, icims: 91, taleo: 90 },
  horizon: { ashby: 94, lever: 95, greenhouse: 93, workday: 94, smartrecruiters: 93, icims: 91, taleo: 90 },
  nova: { ashby: 96, greenhouse: 94, lever: 95, workday: 92, smartrecruiters: 94, icims: 90, taleo: 89 },
  pulse: { ashby: 95, greenhouse: 94, lever: 95, workday: 92, smartrecruiters: 93, icims: 90, taleo: 89 },
  contemporary: { greenhouse: 95, ashby: 94, lever: 94, workday: 92, smartrecruiters: 93, icims: 91, taleo: 90 },
  current: { ashby: 95, greenhouse: 94, lever: 95, workday: 91, smartrecruiters: 94, icims: 90, taleo: 89 },
  innovative: { ashby: 94, lever: 94, greenhouse: 93, workday: 91, smartrecruiters: 92, icims: 89, taleo: 88 },
  polished: { workday: 94, greenhouse: 93, lever: 93, ashby: 92, smartrecruiters: 92, icims: 91, taleo: 90 },
  dynamic: { greenhouse: 94, ashby: 94, lever: 93, workday: 92, smartrecruiters: 93, icims: 90, taleo: 89 },
  sleek: { ashby: 95, lever: 94, greenhouse: 93, workday: 92, smartrecruiters: 93, icims: 90, taleo: 89 },
  elegant: { greenhouse: 91, lever: 92, ashby: 91, workday: 90, smartrecruiters: 91, icims: 89, taleo: 88 },
  ultramodern: { ashby: 95, greenhouse: 94, lever: 95, workday: 91, smartrecruiters: 94, icims: 90, taleo: 89 },
  intuitive: { ashby: 94, lever: 94, greenhouse: 92, workday: 90, smartrecruiters: 92, icims: 88, taleo: 87 },
  sophisticated: { greenhouse: 93, workday: 92, lever: 92, ashby: 91, smartrecruiters: 92, icims: 90, taleo: 89 },
  universal: { greenhouse: 96, lever: 95, workday: 95, ashby: 94, icims: 93, taleo: 92, smartrecruiters: 94 },
  plaintext: { workday: 98, taleo: 97, icims: 96, greenhouse: 93, lever: 92, ashby: 91, smartrecruiters: 93 },
  modern: { greenhouse: 95, ashby: 94, lever: 93, workday: 92, icims: 91, smartrecruiters: 93, taleo: 90 },
  direct: { greenhouse: 94, lever: 94, workday: 93, ashby: 93, icims: 92, taleo: 91, smartrecruiters: 93 },
  simple: { lever: 94, ashby: 93, greenhouse: 92, workday: 94, icims: 91, smartrecruiters: 92, taleo: 90 },
  clean: { ashby: 95, lever: 94, greenhouse: 91, workday: 92, icims: 90, smartrecruiters: 92, taleo: 89 },
};

function isSansSerif(fontFamily: string): boolean {
  const lower = fontFamily.toLowerCase();
  return (
    lower.includes("arial") ||
    lower.includes("calibri") ||
    lower.includes("helvetica") ||
    lower.includes("sans")
  );
}

function isSerif(fontFamily: string): boolean {
  const lower = fontFamily.toLowerCase();
  return lower.includes("times") || lower.includes("georgia") || lower.includes("serif");
}

function scoreForPlatform(templateId: ResumeTemplate, style: AtsTemplateStyle, platform: AtsPlatformId): number {
  const preset = PLATFORM_OPTIMIZED[templateId]?.[platform];
  if (preset != null) return preset;

  let score = 88;

  if (style.headerAlign === "left" && style.headingAlign === "left") score += 4;
  if (style.headerAlign === "center" || style.headingAlign === "center") {
    if (platform === "workday" || platform === "taleo") score -= 10;
    else if (platform === "greenhouse" || platform === "icims") score -= 7;
    else score -= 4;
  }

  if (isSansSerif(style.fontFamily)) score += 4;
  if (isSerif(style.fontFamily) && (platform === "ashby" || platform === "lever")) score -= 2;

  if (style.headingUppercase) {
    if (platform === "greenhouse" || platform === "workday" || platform === "icims") score += 3;
  } else if (platform === "greenhouse") {
    score -= 4;
  }

  if (style.headingBorder === "none") {
    if (platform === "workday" || platform === "taleo") score += 4;
  } else if (style.headingBorder === "both") {
    if (platform === "workday") score -= 4;
  } else if (style.headingBorder === "bottom") {
    score += 2;
  }

  if (parseFloat(style.fontSize) <= 11.5 && parseFloat(style.fontSize) >= 10) score += 2;
  if (style.lineHeight > 1.48 && platform === "workday") score -= 2;

  return Math.max(75, Math.min(97, Math.round(score)));
}

export function scoreAtsTemplate(templateId: ResumeTemplate, style: AtsTemplateStyle): AtsTemplateScores {
  const byPlatform = {} as Record<AtsPlatformId, number>;

  for (const platform of PLATFORM_IDS) {
    byPlatform[platform] = scoreForPlatform(templateId, style, platform);
  }

  const values = Object.values(byPlatform);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const approvedPlatforms = PLATFORM_IDS.filter((p) => byPlatform[p] >= ATS_APPROVAL_THRESHOLD);
  const recommendedExport =
    byPlatform.workday >= ATS_APPROVAL_THRESHOLD || byPlatform.taleo >= ATS_APPROVAL_THRESHOLD
      ? "docx"
      : "pdf";

  return { average, byPlatform, approvedPlatforms, recommendedExport };
}

export function topPlatformPick(platform: AtsPlatformId, templates: ScoredTemplate[]): ResumeTemplate | null {
  const sorted = [...templates].sort(
    (a, b) => (b.ats.byPlatform[platform] ?? 0) - (a.ats.byPlatform[platform] ?? 0)
  );
  return sorted[0]?.templateId ?? null;
}

export type ScoredTemplate = {
  templateId: ResumeTemplate;
  ats: AtsTemplateScores;
};
