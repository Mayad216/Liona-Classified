import type {
  Certification,
  Education,
  Experience,
  Language,
  Project,
  ResumeData,
  ResumeRecord,
  ResumeTemplate,
} from "@/types/resume";

export function emptyResumeData(): ResumeData {
  return {
    personal_info: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    builder_screening: {},
  };
}

export function newExperience(): Experience {
  return {
    id: crypto.randomUUID(),
    job_title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    bullets: [""],
  };
}

export function newEducation(): Education {
  return {
    id: crypto.randomUUID(),
    degree: "",
    school: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
  };
}

export function newLanguage(): Language {
  return { name: "", level: "" };
}

export function newProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: "",
    url: "",
    description: "",
    technologies: [],
  };
}

export function newCertification(): Certification {
  return {
    id: crypto.randomUUID(),
    name: "",
    issuer: "",
    date: "",
  };
}

export function createLocalResume(
  title = "Untitled Resume",
  template: ResumeTemplate = "modern"
): ResumeRecord {
  return {
    id: crypto.randomUUID(),
    title,
    template,
    setup_step: "screening",
    data: emptyResumeData(),
    share_token: crypto.randomUUID(),
    watermark: true,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const RESUME_STORAGE_KEY = "khaleej:resumes";
export const GUEST_TOKEN_KEY = "khaleej:resume_guest_token";
