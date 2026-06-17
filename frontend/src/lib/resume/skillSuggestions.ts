import type { Experience } from "@/types/resume";
import { JOB_ROLES } from "@/lib/post/jobListingCatalog";

export type SkillSuggestion = {
  skill: string;
  source: "general" | "experience";
  /** Job title when source is experience */
  jobTitle?: string;
  recommended?: boolean;
  fromAi?: boolean;
};

type RoleSkillSet = {
  keywords: string[];
  skills: string[];
};

const GENERAL_SKILLS = [
  "Communication",
  "Teamwork",
  "Problem solving",
  "Time management",
  "Leadership",
  "Critical thinking",
  "Adaptability",
  "Attention to detail",
  "Customer service",
  "Project management",
  "Microsoft Excel",
  "Microsoft PowerPoint",
  "Microsoft Word",
  "Google Workspace",
  "Data analysis",
  "Reporting",
  "Stakeholder management",
  "Presentation skills",
  "Negotiation",
  "Conflict resolution",
  "Organizational skills",
  "Multitasking",
  "Decision making",
  "Analytical thinking",
  "Cross-functional collaboration",
  "Process improvement",
  "Documentation",
  "Budgeting",
  "Vendor management",
  "Quality assurance",
] as const;

const ROLE_SKILL_SETS: RoleSkillSet[] = [
  {
    keywords: ["software", "developer", "engineer", "devops", "frontend", "backend", "full stack", "mobile", "qa", "test"],
    skills: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "SQL",
      "Git",
      "REST APIs",
      "Agile / Scrum",
      "Code review",
      "Unit testing",
      "CI/CD",
      "Cloud (AWS / Azure)",
      "System design",
    ],
  },
  {
    keywords: ["data analyst", "data scientist", "bi analyst", "machine learning", "ai engineer", "analytics"],
    skills: [
      "SQL",
      "Python",
      "Excel",
      "Power BI",
      "Tableau",
      "Data visualization",
      "Statistical analysis",
      "ETL",
      "Dashboards",
      "A/B testing",
      "Machine learning",
      "Data cleaning",
      "Business intelligence",
    ],
  },
  {
    keywords: ["product manager", "product owner", "product designer", "ux", "ui designer"],
    skills: [
      "Product roadmap",
      "User research",
      "Wireframing",
      "Figma",
      "Agile / Scrum",
      "Stakeholder management",
      "A/B testing",
      "Market analysis",
      "Requirements gathering",
      "Go-to-market",
      "UX design",
      "Prototyping",
    ],
  },
  {
    keywords: ["marketing", "digital marketing", "seo", "social media", "content", "brand", "communications"],
    skills: [
      "Digital marketing",
      "SEO",
      "Google Ads",
      "Meta Ads",
      "Content strategy",
      "Social media management",
      "Email marketing",
      "Campaign management",
      "Marketing analytics",
      "Copywriting",
      "Brand management",
      "CRM tools",
    ],
  },
  {
    keywords: ["sales", "business development", "account manager", "real estate", "leasing"],
    skills: [
      "Lead generation",
      "Pipeline management",
      "CRM (Salesforce / HubSpot)",
      "Client relationship management",
      "Negotiation",
      "Prospecting",
      "Sales forecasting",
      "Contract negotiation",
      "B2B sales",
      "B2C sales",
      "Cold calling",
      "Closing deals",
    ],
  },
  {
    keywords: ["accountant", "finance", "financial analyst", "auditor", "payroll", "controller"],
    skills: [
      "Financial reporting",
      "Budgeting & forecasting",
      "Accounts payable / receivable",
      "General ledger",
      "VAT compliance (UAE)",
      "Excel (advanced)",
      "ERP systems",
      "Internal audit",
      "Reconciliation",
      "Cost analysis",
      "IFRS",
      "QuickBooks",
    ],
  },
  {
    keywords: ["hr", "recruiter", "talent", "people operations"],
    skills: [
      "Recruitment",
      "Interviewing",
      "Onboarding",
      "HRIS",
      "Employee relations",
      "Performance management",
      "Compensation & benefits",
      "HR policies",
      "Visa & labour law (UAE)",
      "Talent acquisition",
      "Workforce planning",
    ],
  },
  {
    keywords: ["project manager", "program manager", "scrum master", "operations manager"],
    skills: [
      "Project planning",
      "Risk management",
      "Agile / Scrum",
      "MS Project",
      "Jira",
      "Budget tracking",
      "Resource allocation",
      "Stakeholder reporting",
      "Scope management",
      "Change management",
      "PMO",
    ],
  },
  {
    keywords: ["civil engineer", "mechanical", "electrical", "mep", "architect", "quantity surveyor", "site engineer"],
    skills: [
      "AutoCAD",
      "Revit",
      "BIM",
      "Site supervision",
      "Technical drawings",
      "Cost estimation",
      "Health & safety (HSE)",
      "Contract administration",
      "Quality control",
      "Project coordination",
      "Building codes",
    ],
  },
  {
    keywords: ["nurse", "doctor", "medical", "pharmacist", "healthcare", "clinical"],
    skills: [
      "Patient care",
      "Clinical documentation",
      "Electronic medical records",
      "Infection control",
      "Triage",
      "Medication administration",
      "DHA / DOH licensing (UAE)",
      "BLS / ACLS",
      "Multidisciplinary collaboration",
      "Patient education",
    ],
  },
  {
    keywords: ["teacher", "tutor", "education", "trainer", "instructor"],
    skills: [
      "Lesson planning",
      "Curriculum development",
      "Classroom management",
      "Student assessment",
      "Online teaching",
      "Differentiated instruction",
      "Parent communication",
      "Educational technology",
      "Exam preparation",
    ],
  },
  {
    keywords: ["chef", "cook", "restaurant", "hotel", "hospitality", "front office", "f&b"],
    skills: [
      "Food preparation",
      "Menu planning",
      "Kitchen management",
      "HACCP / food safety",
      "Inventory control",
      "Guest relations",
      "POS systems",
      "Banquet operations",
      "Cost control",
      "Team supervision",
    ],
  },
  {
    keywords: ["driver", "logistics", "warehouse", "supply chain", "procurement", "mover"],
    skills: [
      "Route planning",
      "Inventory management",
      "Forklift operation",
      "Last-mile delivery",
      "Fleet management",
      "Import / export documentation",
      "WMS systems",
      "Loading & unloading",
      "UAE driving licence",
    ],
  },
  {
    keywords: ["electrician", "plumber", "technician", "maintenance", "handyman", "ac ", "hvac", "pest"],
    skills: [
      "Preventive maintenance",
      "Troubleshooting",
      "Electrical wiring",
      "Plumbing repairs",
      "HVAC servicing",
      "Safety compliance",
      "Equipment installation",
      "Customer site visits",
      "Work orders",
    ],
  },
  {
    keywords: ["legal", "lawyer", "paralegal", "compliance", "counsel"],
    skills: [
      "Legal research",
      "Contract drafting",
      "Compliance monitoring",
      "Due diligence",
      "Regulatory reporting",
      "Corporate law",
      "Case management",
      "Legal documentation",
    ],
  },
  {
    keywords: ["administrative", "executive assistant", "office manager", "receptionist"],
    skills: [
      "Calendar management",
      "Travel coordination",
      "Office administration",
      "Meeting scheduling",
      "Document management",
      "Executive support",
      "Office supplies",
      "Visitor management",
    ],
  },
  {
    keywords: ["customer service", "call center", "support specialist", "success manager"],
    skills: [
      "Customer support",
      "Ticketing systems (Zendesk / Freshdesk)",
      "Complaint handling",
      "Live chat support",
      "SLA management",
      "Customer retention",
      "Product knowledge",
      "De-escalation",
    ],
  },
  {
    keywords: ["designer", "graphic", "creative", "photographer", "videographer"],
    skills: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe InDesign",
      "Canva",
      "Brand guidelines",
      "Visual design",
      "Photo editing",
      "Video editing",
      "Creative direction",
    ],
  },
];

const BULLET_SKILL_KEYWORDS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "React",
  "Node.js",
  "SQL",
  "Excel",
  "Power BI",
  "Tableau",
  "Salesforce",
  "HubSpot",
  "SAP",
  "Oracle",
  "AutoCAD",
  "Figma",
  "Agile",
  "Scrum",
  "SEO",
  "CRM",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
  "Arabic",
  "English",
  "Hindi",
  "Urdu",
  "Stakeholder management",
  "Project management",
  "Budgeting",
  "Reporting",
  "Customer service",
  "Team leadership",
  "Data analysis",
];

function normalizeSkill(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function skillKey(value: string): string {
  return normalizeSkill(value).toLowerCase();
}

function dedupeSkills(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const normalized = normalizeSkill(item);
    const key = skillKey(normalized);
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function matchRoleSkillSet(jobTitle: string): string[] {
  const lower = jobTitle.toLowerCase();
  for (const set of ROLE_SKILL_SETS) {
    if (set.keywords.some((keyword) => lower.includes(keyword))) {
      return [...set.skills];
    }
  }
  return [];
}

export function getSkillsForJobTitle(jobTitle: string): string[] {
  if (!jobTitle.trim()) return [];
  return dedupeSkills(matchRoleSkillSet(jobTitle));
}

export function isCatalogJobTitle(jobTitle: string): boolean {
  const key = jobTitle.trim().toLowerCase();
  return JOB_ROLES.some((role) => role.toLowerCase() === key);
}

/** Whether AI should supplement or replace weak local skill matches. */
export function shouldFetchAiSkillSuggestions(
  jobTitle: string,
  localRoleSkills: string[]
): boolean {
  if (!jobTitle.trim()) return false;
  if (!isCatalogJobTitle(jobTitle)) return true;
  return localRoleSkills.length < 4;
}

function extractSkillsFromBullets(bullets: string[]): string[] {
  const text = bullets.join(" ").toLowerCase();
  const found: string[] = [];
  for (const keyword of BULLET_SKILL_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) found.push(keyword);
  }
  return found;
}

export function getExperienceSkillSuggestions(experiences: Experience[]): SkillSuggestion[] {
  const suggestions: SkillSuggestion[] = [];

  for (const exp of experiences) {
    if (!exp.job_title.trim()) continue;

    const roleSkills = getSkillsForJobTitle(exp.job_title);
    const bulletSkills = extractSkillsFromBullets(exp.bullets);
    const combined = dedupeSkills([...roleSkills, ...bulletSkills]);

    combined.forEach((skill, index) => {
      suggestions.push({
        skill,
        source: "experience",
        jobTitle: exp.job_title,
        recommended: index < 6,
      });
    });
  }

  return dedupeSkillSuggestions(suggestions);
}

export function getGeneralSkillSuggestions(selected: string[]): SkillSuggestion[] {
  const selectedKeys = new Set(selected.map(skillKey));
  return GENERAL_SKILLS.filter((skill) => !selectedKeys.has(skillKey(skill))).map((skill) => ({
    skill,
    source: "general" as const,
    recommended: [
      "Communication",
      "Teamwork",
      "Problem solving",
      "Microsoft Excel",
      "Project management",
      "Customer service",
    ].includes(skill),
  }));
}

export function dedupeSkillSuggestions(items: SkillSuggestion[]): SkillSuggestion[] {
  const seen = new Set<string>();
  const out: SkillSuggestion[] = [];

  for (const item of items) {
    const key = skillKey(item.skill);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

export function mergeSkills(current: string[], toAdd: string[]): string[] {
  return dedupeSkills([...current, ...toAdd]);
}

export function removeSkill(current: string[], skill: string): string[] {
  const key = skillKey(skill);
  return current.filter((item) => skillKey(item) !== key);
}

export function hasSkill(current: string[], skill: string): boolean {
  return current.some((item) => skillKey(item) === skillKey(skill));
}

export function groupExperienceSuggestions(
  suggestions: SkillSuggestion[]
): { jobTitle: string; skills: SkillSuggestion[] }[] {
  const map = new Map<string, SkillSuggestion[]>();

  for (const item of suggestions) {
    if (item.source !== "experience" || !item.jobTitle) continue;
    const list = map.get(item.jobTitle) ?? [];
    list.push(item);
    map.set(item.jobTitle, list);
  }

  return [...map.entries()].map(([jobTitle, skills]) => ({ jobTitle, skills }));
}
