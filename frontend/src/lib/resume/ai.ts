import { api, getStoredAuthToken } from "@/lib/api";
import {
  getLocalJobDescriptionSuggestions,
  type JobDescriptionSuggestion,
} from "@/lib/resume/jobDescriptionSuggestions";
import {
  buildSummaryContext,
  fallbackSummaryFromResume,
  hasEnoughForSummary,
} from "@/lib/resume/summaryContext";
import type { ResumeData } from "@/types/resume";

function fallbackSummary(jobTitle: string, notes: string): string {
  const snippet = notes.slice(0, 120).trim();
  return `Experienced ${jobTitle} with a track record of delivering results in the UAE market.${
    snippet ? ` Background includes ${snippet}.` : ""
  } Seeking to contribute strong communication skills and hands-on experience to a growth-focused team.`;
}

function fallbackBullet(bullet: string): string {
  const clean = bullet.trim();
  if (!clean) return clean;
  return `Managed ${clean.charAt(0).toLowerCase()}${clean.slice(1).replace(/\.$/, "")}, contributing to team objectives and client satisfaction.`;
}

export async function aiGenerateSummary(jobTitle: string, experienceNotes: string): Promise<string> {
  const token = getStoredAuthToken();
  if (!token) return fallbackSummary(jobTitle, experienceNotes);

  try {
    const res = await api.resumeAiSummary({ job_title: jobTitle, experience_notes: experienceNotes }, token);
    return res.data.summary;
  } catch {
    return fallbackSummary(jobTitle, experienceNotes);
  }
}

export async function aiGenerateSummaryFromResume(data: ResumeData): Promise<string> {
  if (!hasEnoughForSummary(data)) {
    return data.summary;
  }

  const token = getStoredAuthToken();
  if (!token) {
    return fallbackSummaryFromResume(data);
  }

  const { jobTitle, notes } = buildSummaryContext(data);

  try {
    const res = await api.resumeAiSummary(
      { resume_data: data, job_title: jobTitle, experience_notes: notes },
      token
    );
    return res.data.summary?.trim() || fallbackSummaryFromResume(data);
  } catch {
    return fallbackSummaryFromResume(data);
  }
}

export async function aiImproveBullet(bullet: string, jobTitle?: string): Promise<string> {
  const token = getStoredAuthToken();
  if (!token) return fallbackBullet(bullet);

  try {
    const res = await api.resumeAiBullet({ bullet, job_title: jobTitle }, token);
    return res.data.bullet;
  } catch {
    return fallbackBullet(bullet);
  }
}

export type TailorResult = {
  summary_suggestion: string;
  skills_to_emphasize: string[];
  experience_edits: { experience_index: number; bullet_index: number; suggested_text: string }[];
  missing_keywords: string[];
};

export async function aiTailorResume(
  resumeData: ResumeData,
  jobDescription: string
): Promise<TailorResult> {
  const token = getStoredAuthToken();
  if (!token) {
    return {
      summary_suggestion: resumeData.summary,
      skills_to_emphasize: [],
      experience_edits: [],
      missing_keywords: [],
    };
  }

  try {
    const res = await api.resumeAiTailor({ resume_data: resumeData, job_description: jobDescription }, token);
    return res.data;
  } catch {
    return {
      summary_suggestion: resumeData.summary,
      skills_to_emphasize: [],
      experience_edits: [],
      missing_keywords: [],
    };
  }
}

export async function aiSuggestKeywords(
  resumeData: ResumeData,
  jobDescription: string
): Promise<{ missing_keywords: string[]; already_present: string[] }> {
  const token = getStoredAuthToken();
  if (!token) {
    return { missing_keywords: [], already_present: resumeData.skills };
  }

  try {
    const res = await api.resumeAiKeywords({ resume_data: resumeData, job_description: jobDescription }, token);
    return res.data;
  } catch {
    return { missing_keywords: [], already_present: resumeData.skills };
  }
}

export const enhanceBullet = aiImproveBullet;

export async function aiAutocompleteSuggestions(
  field: import("@/lib/resume/suggestions").ResumeAutocompleteField,
  query: string
): Promise<string[]> {
  const token = getStoredAuthToken();
  if (!token || query.trim().length < 2) return [];

  try {
    const res = await api.resumeAiAutocomplete({ field, query: query.trim() }, token);
    return res.data.suggestions ?? [];
  } catch {
    return [];
  }
}

export async function aiSuggestJobDescriptions(
  jobTitle: string,
  company?: string
): Promise<{ suggestions: JobDescriptionSuggestion[]; fromAi: boolean }> {
  const token = getStoredAuthToken();
  const fallback = getLocalJobDescriptionSuggestions(jobTitle);

  if (!token || !jobTitle.trim()) {
    return { suggestions: fallback, fromAi: false };
  }

  try {
    const res = await api.resumeAiJobDescriptions(
      { job_title: jobTitle.trim(), company: company?.trim() || undefined },
      token
    );
    const items = res.data.suggestions ?? [];
    if (items.length > 0) {
      return { suggestions: items, fromAi: true };
    }
    return { suggestions: fallback, fromAi: false };
  } catch {
    return { suggestions: fallback, fromAi: false };
  }
}

export type AiSkillSuggestion = {
  skill: string;
  recommended: boolean;
};

function fallbackAiSkillsForRole(jobTitle: string): AiSkillSuggestion[] {
  const title = jobTitle.toLowerCase();
  if (/(engineer|developer|software|data|analyst)/.test(title)) {
    return [
      { skill: "Problem solving", recommended: true },
      { skill: "Communication", recommended: true },
      { skill: "Project management", recommended: true },
      { skill: "Data analysis", recommended: true },
      { skill: "Documentation", recommended: false },
      { skill: "Stakeholder management", recommended: false },
    ];
  }
  if (/(manager|lead|director|supervisor)/.test(title)) {
    return [
      { skill: "Leadership", recommended: true },
      { skill: "Team management", recommended: true },
      { skill: "Strategic planning", recommended: true },
      { skill: "Budgeting", recommended: true },
      { skill: "Performance management", recommended: false },
    ];
  }
  return [
    { skill: "Communication", recommended: true },
    { skill: "Problem solving", recommended: true },
    { skill: "Time management", recommended: true },
    { skill: "Teamwork", recommended: true },
    { skill: "Customer service", recommended: false },
  ];
}

export async function aiSuggestSkillsForRole(
  jobTitle: string,
  company?: string,
  experienceNotes?: string
): Promise<{ suggestions: AiSkillSuggestion[]; fromAi: boolean }> {
  const token = getStoredAuthToken();
  const fallback = fallbackAiSkillsForRole(jobTitle);

  if (!token || !jobTitle.trim()) {
    return { suggestions: fallback, fromAi: false };
  }

  try {
    const res = await api.resumeAiSkills(
      {
        job_title: jobTitle.trim(),
        company: company?.trim() || undefined,
        experience_notes: experienceNotes?.trim() || undefined,
      },
      token
    );
    const items = res.data.suggestions ?? [];
    if (items.length > 0) {
      return { suggestions: items, fromAi: true };
    }
    return { suggestions: fallback, fromAi: false };
  } catch {
    return { suggestions: fallback, fromAi: false };
  }
}
