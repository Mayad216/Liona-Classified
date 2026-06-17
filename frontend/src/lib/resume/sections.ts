export type ResumeSectionId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "certifications";

export interface ResumeSectionDef {
  id: ResumeSectionId;
  label: string;
  icon: string;
  tips: string[];
}

export const RESUME_SECTIONS: ResumeSectionDef[] = [
  {
    id: "personal",
    label: "Personal Details",
    icon: "👤",
    tips: [
      "Use a professional email address — avoid nicknames or outdated providers.",
      "Include city and country so recruiters know you're locally available.",
      "Add LinkedIn or portfolio links only if they're up to date.",
    ],
  },
  {
    id: "experience",
    label: "Work History",
    icon: "💼",
    tips: [
      "Start bullets with strong action verbs: Led, Built, Increased, Delivered.",
      "Quantify impact where possible — percentages, revenue, team size, time saved.",
      "List your most recent role first and keep the last 10–15 years visible.",
    ],
  },
  {
    id: "education",
    label: "Education",
    icon: "🎓",
    tips: [
      "Include degree, school name, and graduation year or expected date.",
      "Add honors, GPA (if strong), or relevant coursework for early-career roles.",
      "Place education above experience if you're a recent graduate.",
    ],
  },
  {
    id: "skills",
    label: "Skills",
    icon: "⚡",
    tips: [
      "Match skills to keywords from the job description when possible.",
      "Group technical and soft skills — avoid long unbroken lists.",
      "Only list skills you can discuss confidently in an interview.",
    ],
  },
  {
    id: "languages",
    label: "Languages",
    icon: "🌐",
    tips: [
      "Use standard levels: Native, Fluent, Professional, Conversational, Basic.",
      "In the UAE, Arabic and English are often valued — list both if applicable.",
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: "🛠️",
    tips: [
      "Highlight projects that demonstrate skills relevant to your target role.",
      "Include links when the work is public and professional.",
    ],
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: "📜",
    tips: [
      "List industry certifications with issuer and year earned.",
      "Prioritize credentials that are current and recognized in your field.",
    ],
  },
  {
    id: "summary",
    label: "Professional Summary",
    icon: "📝",
    tips: [
      "This is the final step — your summary is generated from everything you entered.",
      "Review the AI draft, then edit until it sounds like you.",
      "Lead with your value — what you bring, not what you want from the job.",
    ],
  },
];

export function getSectionDef(id: ResumeSectionId): ResumeSectionDef {
  return RESUME_SECTIONS.find((s) => s.id === id) ?? RESUME_SECTIONS[0];
}

export const RESUME_ACCENT_COLORS = [
  { id: "green", label: "Green", value: "#00a67e" },
  { id: "blue", label: "Blue", value: "#2563eb" },
  { id: "navy", label: "Navy", value: "#1e3a5f" },
  { id: "teal", label: "Teal", value: "#0d9488" },
  { id: "purple", label: "Purple", value: "#7c3aed" },
  { id: "charcoal", label: "Charcoal", value: "#374151" },
  { id: "burgundy", label: "Burgundy", value: "#9f1239" },
  { id: "orange", label: "Orange", value: "#ea580c" },
] as const;

export const RESUME_FONT_OPTIONS = [
  { id: "arial", label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { id: "calibri", label: "Calibri", value: "Calibri, Arial, sans-serif" },
  { id: "georgia", label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { id: "times", label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { id: "helvetica", label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
] as const;

export type ResumeDesignSettings = {
  accentColor: string;
  fontFamily: string;
};

const DESIGN_KEY = "khaleej:resume-design";

export function loadResumeDesign(resumeId: string): ResumeDesignSettings {
  try {
    const raw = localStorage.getItem(`${DESIGN_KEY}:${resumeId}`);
    if (raw) return JSON.parse(raw) as ResumeDesignSettings;
  } catch {
    /* ignore */
  }
  return { accentColor: "#00a67e", fontFamily: "Arial, Helvetica, sans-serif" };
}

export function saveResumeDesign(resumeId: string, design: ResumeDesignSettings): void {
  localStorage.setItem(`${DESIGN_KEY}:${resumeId}`, JSON.stringify(design));
}
