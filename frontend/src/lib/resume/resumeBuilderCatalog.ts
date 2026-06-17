import { getApiBaseUrl } from "@/lib/api";
import {
  getTemplateMeta,
  type ResumeTemplate,
  type TemplateMeta,
} from "@/lib/resume/templates";

export type ResumeBuilderCatalogEntry = {
  slug: string;
  name: string;
  style: string;
  template_id: ResumeTemplate;
  accent: string;
  description: string;
};

export type ResumeBuilderCatalog = {
  source: string;
  app_url: string;
  live_fetch: boolean;
  live_fetch_message: string;
  fetched_at: string;
  styles: string[];
  categories: string[];
  templates: ResumeBuilderCatalogEntry[];
};

/** Offline fallback — mirrors backend/config/resume_builder_templates.php */
const FALLBACK_CATALOG: ResumeBuilderCatalog = {
  source: "https://www.resumebuilder.com/resume-templates/",
  app_url: "https://app.resumebuilder.com",
  live_fetch: false,
  live_fetch_message: "Using bundled ResumeBuilder.com public catalog.",
  fetched_at: new Date().toISOString(),
  styles: ["Creative", "Simple", "Modern", "ATS Friendly"],
  categories: [
    "Applicant Tracking Systems",
    "Basic",
    "Modern",
    "Professional",
    "Simple",
    "Minimal",
    "Traditional",
    "Executive",
  ],
  templates: [
    {
      slug: "contemporary",
      name: "Contemporary",
      style: "Modern",
      template_id: "contemporary",
      accent: "#2563eb",
      description:
        "Highlights experience, education, and skills for management or business roles needing a polished format.",
    },
    {
      slug: "current",
      name: "Current",
      style: "Modern",
      template_id: "current",
      accent: "#0ea5e9",
      description:
        "Bold headings and clean lines — ideal for fast-paced industries like tech or product management.",
    },
    {
      slug: "innovative",
      name: "Innovative",
      style: "Creative",
      template_id: "innovative",
      accent: "#8b5cf6",
      description: "Unique single-column layout for creatives wanting a visually engaging resume.",
    },
    {
      slug: "polished",
      name: "Polished",
      style: "Professional",
      template_id: "polished",
      accent: "#1d4ed8",
      description: "Straightforward design for entry-level roles where clarity and simplicity are key.",
    },
    {
      slug: "minimalist",
      name: "Minimalist",
      style: "Minimal",
      template_id: "minimal",
      accent: "#475569",
      description: "Highlighting skills and certifications — suits healthcare professionals.",
    },
    {
      slug: "dynamic",
      name: "Dynamic",
      style: "Modern",
      template_id: "dynamic",
      accent: "#059669",
      description: "Emphasizes relevant skills for entry-level job seekers with limited experience.",
    },
    {
      slug: "clean",
      name: "Clean",
      style: "Simple",
      template_id: "clean",
      accent: "#14b8a6",
      description: "Distraction-free layout for quick employer assessment.",
    },
    {
      slug: "elegant",
      name: "Elegant",
      style: "Professional",
      template_id: "elegant",
      accent: "#1e3a5f",
      description: "Great for tech graduates — emphasizes language and technical skills.",
    },
    {
      slug: "ultramodern",
      name: "Ultramodern",
      style: "Modern",
      template_id: "ultramodern",
      accent: "#0891b2",
      description: "Highlights marketing and PR skills in an organized format.",
    },
    {
      slug: "sleek",
      name: "Sleek",
      style: "Modern",
      template_id: "sleek",
      accent: "#0f766e",
      description: "Technical sales roles — highlights core skills like sales and client relations.",
    },
    {
      slug: "sophisticated",
      name: "Sophisticated",
      style: "Professional",
      template_id: "sophisticated",
      accent: "#78350f",
      description: "Emphasizes internships and skills for new graduates.",
    },
    {
      slug: "intuitive",
      name: "Intuitive",
      style: "Creative",
      template_id: "intuitive",
      accent: "#7c3aed",
      description: "Bold accent styling for tech professionals wanting a standout resume.",
    },
    {
      slug: "modern-entry",
      name: "Modern — Entry Level",
      style: "Modern",
      template_id: "horizon",
      accent: "#64748b",
      description: "Airy modern layout for early-career professionals.",
    },
    {
      slug: "modern-mid",
      name: "Modern — Mid-Career",
      style: "Modern",
      template_id: "signal",
      accent: "#0ea5e9",
      description: "Contemporary stripe headings for experienced professionals.",
    },
    {
      slug: "modern-senior",
      name: "Modern — Senior Level",
      style: "Modern",
      template_id: "nova",
      accent: "#8b5cf6",
      description: "Bold accent rule layout for senior-level candidates.",
    },
    {
      slug: "ats-host",
      name: "ATS Host",
      style: "ATS Friendly",
      template_id: "greenhouse",
      accent: "#2563eb",
      description: "Standard headings and left-aligned layout for applicant tracking systems.",
    },
  ],
};

export async function fetchResumeBuilderCatalog(): Promise<ResumeBuilderCatalog> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/resumes/templates/resumebuilder`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { data: ResumeBuilderCatalog };
    return json.data;
  } catch {
    return FALLBACK_CATALOG;
  }
}

export function catalogEntryToTemplateMeta(entry: ResumeBuilderCatalogEntry): TemplateMeta {
  const base = getTemplateMeta(entry.template_id);
  return {
    ...base,
    label: entry.name,
    blurb: entry.description,
    previewAccent: entry.accent || base.previewAccent,
  };
}

export function getResumeBuilderTemplateMetas(catalog: ResumeBuilderCatalog): TemplateMeta[] {
  return catalog.templates.map(catalogEntryToTemplateMeta);
}
