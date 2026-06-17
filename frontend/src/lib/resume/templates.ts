/** ATS-safe resume template registry (40 variants — includes ResumeBuilder.com mappings) */

export const RESUME_TEMPLATE_IDS = [
  "greenhouse",
  "workday",
  "lever",
  "ashby",
  "metro",
  "signal",
  "horizon",
  "nova",
  "pulse",
  "contemporary",
  "current",
  "innovative",
  "polished",
  "dynamic",
  "sleek",
  "elegant",
  "ultramodern",
  "intuitive",
  "sophisticated",
  "modern",
  "classic",
  "minimal",
  "executive",
  "professional",
  "traditional",
  "simple",
  "standard",
  "corporate",
  "neat",
  "clear",
  "structured",
  "refined",
  "balanced",
  "focused",
  "clean",
  "formal",
  "direct",
  "essential",
  "plaintext",
  "universal",
] as const;

export type ResumeTemplate = (typeof RESUME_TEMPLATE_IDS)[number];

export type TemplateVisualPreset =
  | "modern-bar"
  | "classic-center"
  | "minimal-plain"
  | "executive-rule"
  | "formal-serif"
  | "tech-clean"
  | "compact-standard"
  | "modern-band"
  | "modern-stripe"
  | "modern-soft"
  | "modern-underline"
  | "modern-chip";

const TEMPLATE_VISUAL_PRESETS: Record<ResumeTemplate, TemplateVisualPreset> = {
  greenhouse: "modern-bar",
  workday: "minimal-plain",
  lever: "tech-clean",
  ashby: "tech-clean",
  metro: "modern-band",
  signal: "modern-stripe",
  horizon: "modern-soft",
  nova: "modern-underline",
  pulse: "modern-chip",
  contemporary: "modern-band",
  current: "modern-underline",
  innovative: "modern-chip",
  polished: "modern-soft",
  dynamic: "modern-stripe",
  sleek: "tech-clean",
  elegant: "classic-center",
  ultramodern: "modern-underline",
  intuitive: "modern-chip",
  sophisticated: "executive-rule",
  modern: "modern-bar",
  classic: "classic-center",
  minimal: "compact-standard",
  executive: "executive-rule",
  professional: "executive-rule",
  traditional: "formal-serif",
  simple: "minimal-plain",
  standard: "minimal-plain",
  corporate: "modern-bar",
  neat: "classic-center",
  clear: "compact-standard",
  structured: "formal-serif",
  refined: "classic-center",
  balanced: "classic-center",
  focused: "compact-standard",
  clean: "tech-clean",
  formal: "formal-serif",
  direct: "modern-bar",
  essential: "minimal-plain",
  plaintext: "minimal-plain",
  universal: "modern-bar",
};

export const TEMPLATE_PREVIEW_ACCENTS: Record<ResumeTemplate, string> = {
  greenhouse: "#2563eb",
  workday: "#0f766e",
  lever: "#7c3aed",
  ashby: "#0891b2",
  metro: "#6366f1",
  signal: "#0ea5e9",
  horizon: "#64748b",
  nova: "#8b5cf6",
  pulse: "#ec4899",
  contemporary: "#2563eb",
  current: "#0284c7",
  innovative: "#a855f7",
  polished: "#1e40af",
  dynamic: "#16a34a",
  sleek: "#0d9488",
  elegant: "#334155",
  ultramodern: "#06b6d4",
  intuitive: "#7c3aed",
  sophisticated: "#92400e",
  modern: "#00a67e",
  classic: "#1e3a5f",
  minimal: "#475569",
  executive: "#991b1b",
  professional: "#1d4ed8",
  traditional: "#44403c",
  simple: "#64748b",
  standard: "#334155",
  corporate: "#0e7490",
  neat: "#6d28d9",
  clear: "#0284c7",
  structured: "#374151",
  refined: "#9333ea",
  balanced: "#be185d",
  focused: "#059669",
  clean: "#14b8a6",
  formal: "#78350f",
  direct: "#dc2626",
  essential: "#525252",
  plaintext: "#171717",
  universal: "#00a67e",
};

export function getTemplateVisualPreset(id: ResumeTemplate): TemplateVisualPreset {
  return TEMPLATE_VISUAL_PRESETS[id] ?? "modern-bar";
}

export function getTemplatePreviewAccent(id: ResumeTemplate): string {
  return TEMPLATE_PREVIEW_ACCENTS[id] ?? "#00a67e";
}

export type AtsTemplateStyle = {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  headerAlign: "left" | "center";
  nameSize: string;
  contactSize: string;
  headingSize: string;
  headingUppercase: boolean;
  headingAlign: "left" | "center";
  headingBorder: "none" | "bottom" | "both";
  headingLetterSpacing: string;
  itemSpacing: string;
};

import type { AtsPlatformId } from "@/lib/resume/atsPlatforms";
import { scoreAtsTemplate } from "@/lib/resume/atsTemplateScoring";

export type AtsTemplateMeta = {
  averageScore: number;
  platformScores: Record<AtsPlatformId, number>;
  approvedPlatforms: AtsPlatformId[];
  recommendedExport: "docx" | "pdf";
};

export type TemplateMeta = {
  id: ResumeTemplate;
  label: string;
  blurb: string;
  style: AtsTemplateStyle;
  ats: AtsTemplateMeta;
  visualPreset: TemplateVisualPreset;
  previewAccent: string;
  /** Primary ATS this layout was tuned for (platform-optimized templates only). */
  optimizedFor?: AtsPlatformId;
};

const base = (overrides: Partial<AtsTemplateStyle>): AtsTemplateStyle => ({
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "11pt",
  lineHeight: 1.35,
  headerAlign: "left",
  nameSize: "18pt",
  contactSize: "10pt",
  headingSize: "11pt",
  headingUppercase: true,
  headingAlign: "left",
  headingBorder: "bottom",
  headingLetterSpacing: "0.04em",
  itemSpacing: "12px",
  ...overrides,
});

function meta(
  id: ResumeTemplate,
  label: string,
  blurb: string,
  style: AtsTemplateStyle,
  optimizedFor?: AtsPlatformId
): TemplateMeta {
  const scored = scoreAtsTemplate(id, style);
  return {
    id,
    label,
    blurb,
    style,
    optimizedFor,
    visualPreset: TEMPLATE_VISUAL_PRESETS[id],
    previewAccent: TEMPLATE_PREVIEW_ACCENTS[id],
    ats: {
      averageScore: scored.average,
      platformScores: scored.byPlatform,
      approvedPlatforms: scored.approvedPlatforms,
      recommendedExport: scored.recommendedExport,
    },
  };
}

export const RESUME_TEMPLATES: TemplateMeta[] = [
  meta(
    "greenhouse",
    "Greenhouse",
    "Tuned for Greenhouse semantic parsing — standard headings, Calibri, left-aligned",
    base({ fontFamily: "Calibri, Arial, Helvetica, sans-serif", headingBorder: "bottom" }),
    "greenhouse"
  ),
  meta(
    "workday",
    "Workday",
    "Maximum Workday parse safety — plain Arial, minimal rules, DOCX-friendly",
    base({
      fontFamily: "Arial, Helvetica, sans-serif",
      headingBorder: "none",
      headingUppercase: true,
      lineHeight: 1.35,
    }),
    "workday"
  ),
  meta(
    "lever",
    "Lever",
    "Clean Lever layout — Helvetica, simple bullets, forgiving plain text",
    base({
      fontFamily: "Helvetica, Arial, sans-serif",
      headingBorder: "none",
      headingUppercase: false,
      lineHeight: 1.38,
    }),
    "lever"
  ),
  meta(
    "ashby",
    "Ashby",
    "Modern tech hiring — sans-serif, readable spacing for Ashby & startups",
    base({
      fontFamily: "Arial, Helvetica, sans-serif",
      headingUppercase: false,
      headingBorder: "bottom",
      lineHeight: 1.4,
    }),
    "ashby"
  ),
  meta(
    "metro",
    "Metro",
    "Contemporary header band — bold sans-serif, startup-ready & ATS-safe",
    base({
      fontFamily: "Helvetica, Arial, sans-serif",
      nameSize: "20pt",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.42,
      itemSpacing: "14px",
    })
  ),
  meta(
    "signal",
    "Signal",
    "Left accent stripes on sections — clean modern look, single-column parse",
    base({
      fontFamily: "Calibri, Arial, Helvetica, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.4,
    })
  ),
  meta(
    "horizon",
    "Horizon",
    "Airy whitespace & soft headings — minimal, readable, recruiter-friendly",
    base({
      fontFamily: "Arial, Helvetica, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.48,
      itemSpacing: "16px",
      nameSize: "19pt",
    })
  ),
  meta(
    "nova",
    "Nova",
    "Bold name with full-width accent rule — sharp contemporary style",
    base({
      fontFamily: "Helvetica, Arial, sans-serif",
      nameSize: "20pt",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.4,
    })
  ),
  meta(
    "pulse",
    "Pulse",
    "Accent-highlight section labels — modern chip headings, plain text body",
    base({
      fontFamily: "Calibri, Arial, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.38,
      headingSize: "10.5pt",
    })
  ),
  meta(
    "contemporary",
    "Contemporary",
    "ResumeBuilder.com — polished business layout with management-ready structure",
    base({
      fontFamily: "Calibri, Arial, Helvetica, sans-serif",
      headingUppercase: false,
      lineHeight: 1.42,
    })
  ),
  meta(
    "current",
    "Current",
    "ResumeBuilder.com — bold headings and clean lines for tech roles",
    base({
      fontFamily: "Helvetica, Arial, sans-serif",
      nameSize: "20pt",
      headingUppercase: false,
      headingBorder: "none",
    })
  ),
  meta(
    "innovative",
    "Innovative",
    "ResumeBuilder.com — creative single-column layout, ATS-readable",
    base({
      fontFamily: "Arial, Helvetica, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.4,
    })
  ),
  meta(
    "polished",
    "Polished",
    "ResumeBuilder.com — clear entry-level layout with minimal decoration",
    base({
      fontFamily: "Arial, Helvetica, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.45,
      itemSpacing: "14px",
    })
  ),
  meta(
    "dynamic",
    "Dynamic",
    "ResumeBuilder.com — accent stripe sections for skills-focused resumes",
    base({
      fontFamily: "Calibri, Arial, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
    })
  ),
  meta(
    "sleek",
    "Sleek",
    "ResumeBuilder.com — streamlined sans-serif for sales and client-facing roles",
    base({
      fontFamily: "Helvetica, Arial, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
      lineHeight: 1.38,
    })
  ),
  meta(
    "elegant",
    "Elegant",
    "ResumeBuilder.com — refined centered header for graduate and tech profiles",
    base({
      fontFamily: "Georgia, 'Times New Roman', serif",
      headerAlign: "center",
      headingUppercase: false,
      lineHeight: 1.42,
    })
  ),
  meta(
    "ultramodern",
    "Ultramodern",
    "ResumeBuilder.com — sharp contemporary rule and sans-serif body",
    base({
      fontFamily: "Helvetica, Arial, sans-serif",
      nameSize: "19pt",
      headingUppercase: false,
      headingBorder: "none",
    })
  ),
  meta(
    "intuitive",
    "Intuitive",
    "ResumeBuilder.com — bold accent chip headings for tech professionals",
    base({
      fontFamily: "Calibri, Arial, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
      headingSize: "10.5pt",
    })
  ),
  meta(
    "sophisticated",
    "Sophisticated",
    "ResumeBuilder.com — executive rule layout for graduates and analysts",
    base({
      fontFamily: "Arial, Helvetica, sans-serif",
      nameSize: "19pt",
      headingBorder: "both",
      lineHeight: 1.4,
    })
  ),
  meta(
    "modern",
    "Modern",
    "Calibri-style sans, left aligned",
    base({ fontFamily: "Calibri, Arial, Helvetica, sans-serif" })
  ),
  meta(
    "classic",
    "Classic",
    "Centered header, serif",
    base({
      fontFamily: "'Times New Roman', Times, Georgia, serif",
      headerAlign: "center",
      headingAlign: "center",
      headingLetterSpacing: "0.08em",
    })
  ),
  meta(
    "minimal",
    "Compact",
    "Tight Arial layout",
    base({ lineHeight: 1.3, headingSize: "12pt", itemSpacing: "10px" })
  ),
  meta(
    "executive",
    "Executive",
    "Large name, serif body",
    base({
      fontFamily: "'Times New Roman', Times, serif",
      nameSize: "20pt",
      headingBorder: "both",
    })
  ),
  meta(
    "professional",
    "Professional",
    "Wide heading tracking",
    base({ headingLetterSpacing: "0.12em", lineHeight: 1.4 })
  ),
  meta(
    "traditional",
    "Traditional",
    "Georgia serif, formal",
    base({
      fontFamily: "Georgia, 'Times New Roman', serif",
      lineHeight: 1.45,
    })
  ),
  meta(
    "simple",
    "Simple",
    "No section rules, bold headings",
    base({ headingBorder: "none", headingUppercase: false })
  ),
  meta("standard", "Standard", "Uppercase headings, no rules", base({ headingBorder: "none" })),
  meta(
    "corporate",
    "Corporate",
    "Top and bottom section lines",
    base({
      fontFamily: "Calibri, Arial, sans-serif",
      headingBorder: "both",
      headingLetterSpacing: "0.06em",
    })
  ),
  meta(
    "neat",
    "Neat",
    "Cambria, airy spacing",
    base({
      fontFamily: "Cambria, Georgia, serif",
      lineHeight: 1.42,
      itemSpacing: "14px",
    })
  ),
  meta(
    "clear",
    "Clear",
    "Extra line height for readability",
    base({ lineHeight: 1.5, fontSize: "11pt" })
  ),
  meta(
    "structured",
    "Structured",
    "Strong section dividers",
    base({
      fontFamily: "'Times New Roman', Times, serif",
      headingBorder: "both",
      headingLetterSpacing: "0.05em",
    })
  ),
  meta(
    "refined",
    "Refined",
    "Centered name, left sections",
    base({
      fontFamily: "Georgia, serif",
      headerAlign: "center",
      lineHeight: 1.4,
    })
  ),
  meta(
    "balanced",
    "Balanced",
    "Centered header and headings",
    base({
      headerAlign: "center",
      headingAlign: "center",
      headingBorder: "bottom",
    })
  ),
  meta(
    "focused",
    "Focused",
    "Slightly smaller type",
    base({ fontSize: "10.5pt", contactSize: "9.5pt", lineHeight: 1.32 })
  ),
  meta(
    "clean",
    "Clean",
    "Sentence-case section titles",
    base({
      fontFamily: "Helvetica, Arial, sans-serif",
      headingUppercase: false,
      headingBorder: "none",
    })
  ),
  meta(
    "formal",
    "Formal",
    "Times, conservative spacing",
    base({
      fontFamily: "'Times New Roman', Times, serif",
      headingLetterSpacing: "0.1em",
      lineHeight: 1.4,
    })
  ),
  meta(
    "direct",
    "Direct",
    "Bold Arial, minimal styling",
    base({
      headingBorder: "bottom",
      headingLetterSpacing: "0.02em",
      itemSpacing: "10px",
    })
  ),
  meta(
    "essential",
    "Essential",
    "Bare minimum decoration",
    base({
      headingBorder: "none",
      headingUppercase: true,
      lineHeight: 1.33,
    })
  ),
  meta(
    "plaintext",
    "Plain Text",
    "Closest to a .txt export",
    base({
      fontFamily: "Arial, sans-serif",
      fontSize: "11pt",
      nameSize: "16pt",
      headingBorder: "none",
      headingUppercase: true,
      headingSize: "11pt",
      lineHeight: 1.35,
    })
  ),
  meta(
    "universal",
    "Universal",
    "Safe default for any ATS",
    base({
      fontFamily: "Arial, Helvetica, sans-serif",
      headingBorder: "bottom",
    })
  ),
];

const styleMap = Object.fromEntries(
  RESUME_TEMPLATES.map((t) => [t.id, t.style])
) as Record<ResumeTemplate, AtsTemplateStyle>;

export function getTemplateStyle(id: ResumeTemplate): AtsTemplateStyle {
  return styleMap[id] ?? styleMap.modern;
}

export function getTemplateMeta(id: ResumeTemplate) {
  const fallback = RESUME_TEMPLATES.find((t) => t.id === "modern");
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? fallback ?? RESUME_TEMPLATES[0];
}

export function isResumeTemplate(value: string): value is ResumeTemplate {
  return (RESUME_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function getTemplatesForPlatform(platform: AtsPlatformId): TemplateMeta[] {
  return [...RESUME_TEMPLATES]
    .filter((t) => t.ats.approvedPlatforms.includes(platform))
    .sort(
      (a, b) =>
        (b.ats.platformScores[platform] ?? 0) - (a.ats.platformScores[platform] ?? 0)
    );
}

export function getPlatformOptimizedTemplate(platform: AtsPlatformId): TemplateMeta | undefined {
  return RESUME_TEMPLATES.find((t) => t.optimizedFor === platform);
}

/** Contemporary layouts — visually distinct but ATS-safe single-column */
export const MODERN_TEMPLATE_IDS: ResumeTemplate[] = [
  "metro",
  "signal",
  "horizon",
  "nova",
  "pulse",
  "contemporary",
  "current",
  "innovative",
  "dynamic",
  "sleek",
  "ultramodern",
  "intuitive",
  "ashby",
  "modern",
  "clean",
];

export function getModernTemplates(): TemplateMeta[] {
  return RESUME_TEMPLATES.filter((t) => MODERN_TEMPLATE_IDS.includes(t.id));
}

export const DEFAULT_RESUME_TEMPLATE: ResumeTemplate = "modern";
