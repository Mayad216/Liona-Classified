import { RESUME_JOB_TITLE_CATALOG } from "@/lib/resume/jobTitleCatalog";

export type ResumeAutocompleteField =
  | "job_title"
  | "degree"
  | "school"
  | "language"
  | "language_level";

export const JOB_TITLE_SUGGESTIONS = [...RESUME_JOB_TITLE_CATALOG];

export const DEGREE_SUGGESTIONS = [
  "High School Diploma",
  "Secondary School Certificate",
  "Associate Degree",
  "Foundation Year",
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BSc)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Engineering (BEng)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Computer Science (BCS)",
  "Bachelor of Architecture (BArch)",
  "Bachelor of Laws (LLB)",
  "Bachelor of Education (BEd)",
  "Bachelor of Fine Arts (BFA)",
  "Master of Arts (MA)",
  "Master of Science (MSc)",
  "Master of Business Administration (MBA)",
  "Master of Engineering (MEng)",
  "Master of Laws (LLM)",
  "Master of Public Health (MPH)",
  "Master of Education (MEd)",
  "Master of Computer Science (MCS)",
  "Doctor of Philosophy (PhD)",
  "Doctor of Medicine (MD)",
  "Doctor of Business Administration (DBA)",
  "Diploma in Nursing",
  "Diploma in Hospitality Management",
  "Diploma in Information Technology",
  "Professional Certificate",
  "Postgraduate Diploma",
  "Higher National Diploma (HND)",
  "International Baccalaureate (IB)",
  "A-Levels",
  "GCSE",
  "Currently pursuing degree",
];

export const SCHOOL_SUGGESTIONS = [
  "American University of Sharjah",
  "American University in Dubai",
  "United Arab Emirates University",
  "Zayed University",
  "Higher Colleges of Technology",
  "University of Dubai",
  "Heriot-Watt University Dubai",
  "Middlesex University Dubai",
  "University of Wollongong in Dubai",
  "Manipal Academy of Higher Education Dubai",
  "BITS Pilani Dubai",
  "Amity University Dubai",
  "Canadian University Dubai",
  "Murdoch University Dubai",
  "University of Birmingham Dubai",
  "University of Manchester Dubai",
  "Rochester Institute of Technology Dubai",
  "Emirates Aviation University",
  "Mohammed Bin Rashid University",
  "Khalifa University",
  "New York University Abu Dhabi",
  "Sorbonne University Abu Dhabi",
  "Paris-Sorbonne University Abu Dhabi",
  "Abu Dhabi University",
  "Al Ain University",
  "Ajman University",
  "University of Sharjah",
  "Sharjah Women's College",
  "Dubai College",
  "GEMS Wellington Academy",
  "Indian High School Dubai",
  "Delhi Private School Dubai",
  "The British School Al Khubairat",
  "Repton School Dubai",
  "London Business School",
  "Imperial College London",
  "University of Oxford",
  "University of Cambridge",
  "Harvard University",
  "Stanford University",
  "MIT",
  "National University of Singapore",
  "University of Toronto",
  "University of Melbourne",
  "University of Sydney",
  "Indian Institute of Technology",
  "University of Mumbai",
  "University of Delhi",
  "Cairo University",
  "American University of Beirut",
  "King Saud University",
  "Online / Distance Learning",
];

export const LANGUAGE_SUGGESTIONS = [
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Malayalam",
  "Tamil",
  "Telugu",
  "Bengali",
  "Tagalog",
  "Filipino",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Mandarin)",
  "Cantonese",
  "Japanese",
  "Korean",
  "Turkish",
  "Persian (Farsi)",
  "Pashto",
  "Punjabi",
  "Gujarati",
  "Marathi",
  "Nepali",
  "Sinhala",
  "Indonesian",
  "Malay",
  "Thai",
  "Vietnamese",
  "Swahili",
  "Amharic",
  "Greek",
  "Dutch",
  "Polish",
  "Romanian",
  "Ukrainian",
  "Serbian",
  "Hebrew",
  "Sign Language",
];

export const LANGUAGE_LEVEL_SUGGESTIONS = [
  "Native",
  "Fluent",
  "Professional working proficiency",
  "Full professional proficiency",
  "Conversational",
  "Intermediate",
  "Basic",
  "Elementary",
  "Limited working proficiency",
  "Bilingual",
  "Mother tongue",
];

const CATALOGS: Record<ResumeAutocompleteField, readonly string[]> = {
  job_title: JOB_TITLE_SUGGESTIONS,
  degree: DEGREE_SUGGESTIONS,
  school: SCHOOL_SUGGESTIONS,
  language: LANGUAGE_SUGGESTIONS,
  language_level: LANGUAGE_LEVEL_SUGGESTIONS,
};

export function getSuggestionCatalog(field: ResumeAutocompleteField): readonly string[] {
  return CATALOGS[field];
}

export function filterSuggestions(
  catalog: readonly string[],
  query: string,
  limit = 8
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...catalog].slice(0, limit);

  const starts: string[] = [];
  const includes: string[] = [];

  for (const item of catalog) {
    const lower = item.toLowerCase();
    if (lower.startsWith(q)) starts.push(item);
    else if (lower.includes(q)) includes.push(item);
  }

  return [...starts, ...includes].slice(0, limit);
}

export function mergeSuggestions(
  local: string[],
  ai: string[],
  limit = 10
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const item of [...local, ...ai]) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
    if (out.length >= limit) break;
  }

  return out;
}
