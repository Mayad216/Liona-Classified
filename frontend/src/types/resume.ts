export type { ResumeTemplate } from "@/lib/resume/templates";

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  id: string;
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  personal_info: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  /** One-time intake answers (JobCopilot / ResumeBuilder-style screening) */
  builder_screening?: Record<string, string | string[]>;
}

export type ResumeSetupStep = "screening" | "template" | "complete";

export interface ResumeRecord {
  id: string | number;
  user_id?: number | null;
  guest_token?: string | null;
  title: string;
  template: import("@/lib/resume/templates").ResumeTemplate;
  /** screening → template → complete */
  setup_step?: ResumeSetupStep;
  data: ResumeData;
  share_token?: string;
  is_public?: boolean;
  watermark?: boolean;
  created_at?: string;
  updated_at?: string;
}
