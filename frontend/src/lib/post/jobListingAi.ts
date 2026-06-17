import { api, getStoredAuthToken } from "@/lib/api";
import type { ExperienceLevel } from "@/types";

export type JobListingSuggestions = {
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  salaryMin?: number;
  salaryMax?: number;
  experience?: ExperienceLevel;
  source: "ai" | "template";
};

type GenerateParams = {
  role: string;
  industry: string;
  employmentType?: string;
  experienceLevel?: string;
  workArrangement?: string;
  company?: string;
};

type RoleFamily =
  | "technology"
  | "data"
  | "product"
  | "design"
  | "marketing"
  | "sales"
  | "finance"
  | "hr"
  | "operations"
  | "healthcare"
  | "hospitality"
  | "construction"
  | "legal"
  | "leadership"
  | "general";

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Entry",
  "Mid",
  "Senior",
  "Lead",
  "Executive",
];

const EXP_PROFILE: Record<
  ExperienceLevel,
  {
    years: string;
    scope: string;
    salaryMultiplier: number;
    tone: string;
  }
> = {
  Entry: {
    years: "0–2 years",
    scope: "foundational delivery with close guidance",
    salaryMultiplier: 0.72,
    tone: "early-career",
  },
  Mid: {
    years: "3–5 years",
    scope: "independent ownership of core deliverables",
    salaryMultiplier: 1,
    tone: "experienced professional",
  },
  Senior: {
    years: "6–8 years",
    scope: "subject-matter expertise and cross-team influence",
    salaryMultiplier: 1.42,
    tone: "senior specialist",
  },
  Lead: {
    years: "8–12 years",
    scope: "team leadership, coaching, and operational accountability",
    salaryMultiplier: 1.78,
    tone: "people leader",
  },
  Executive: {
    years: "12+ years",
    scope: "executive leadership, strategy, and stakeholder governance",
    salaryMultiplier: 2.35,
    tone: "executive leader",
  },
};

const SALARY_BASE_MID: Record<RoleFamily, [number, number]> = {
  technology: [16000, 28000],
  data: [15000, 26000],
  product: [20000, 36000],
  design: [14000, 24000],
  marketing: [9000, 17000],
  sales: [7000, 14000],
  finance: [11000, 22000],
  hr: [10000, 19000],
  operations: [9000, 17000],
  healthcare: [8000, 16000],
  hospitality: [4500, 9000],
  construction: [7500, 15000],
  legal: [16000, 32000],
  leadership: [32000, 65000],
  general: [9000, 17000],
};

const INDUSTRY_SALARY_FACTOR: Record<string, number> = {
  "Technology & Software": 1.12,
  "Fintech & Digital Payments": 1.15,
  "Banking & Financial Services": 1.18,
  Blockchain: 1.1,
  "Investment & Asset Management": 1.2,
  Consulting: 1.14,
  "Oil & Gas": 1.16,
  "Renewable Energy": 1.08,
  "Hospitality & Tourism": 0.88,
  "Hotels & Resorts": 0.9,
  "Food & Beverage": 0.86,
  "Restaurants & Cafés": 0.84,
  Retail: 0.9,
  "Luxury Retail": 0.98,
  Healthcare: 1.02,
  Education: 0.92,
  "Security Services": 0.82,
  Other: 1,
};

function normalizeExperience(level?: string): ExperienceLevel {
  if (level && EXPERIENCE_LEVELS.includes(level as ExperienceLevel)) {
    return level as ExperienceLevel;
  }
  return "Mid";
}

function detectRoleFamily(role: string): RoleFamily {
  const r = role.toLowerCase();
  if (
    /chief|ceo|coo|cto|cmo|cfo|vice president|managing director|general manager|country manager|director|head of/.test(
      r
    )
  ) {
    return "leadership";
  }
  if (/software|developer|engineer|devops|cloud|cyber|network|it |qa |scrum|architect|sre/.test(r)) {
    if (/data |analyst|scientist|machine learning|ai |bi /.test(r)) return "data";
    if (/product manager|product owner/.test(r)) return "product";
    return "technology";
  }
  if (/data |analyst|scientist|machine learning|ai engineer|bi /.test(r)) return "data";
  if (/product manager|product owner/.test(r)) return "product";
  if (/designer|ux|ui|creative|graphic|content designer/.test(r)) return "design";
  if (/marketing|seo|social media|brand|communications|pr |content writer|copywriter/.test(r)) {
    return "marketing";
  }
  if (/sales|business development|account manager|leasing|pre-sales|partnerships/.test(r)) {
    return "sales";
  }
  if (/accountant|finance|audit|tax|treasury|payroll|controller|cfo/.test(r)) return "finance";
  if (/hr |recruit|talent|learning & development/.test(r)) return "hr";
  if (/operations|logistics|warehouse|procurement|supply chain|fleet|storekeeper/.test(r)) {
    return "operations";
  }
  if (/doctor|nurse|pharmacist|medical|healthcare|clinic|dental|physio/.test(r)) {
    return "healthcare";
  }
  if (/hotel|chef|restaurant|hospitality|f&b|barista|waiter|concierge|housekeeping|spa/.test(r)) {
    return "hospitality";
  }
  if (/construction|civil|mep|site engineer|foreman|hse|electrician|plumber|facility/.test(r)) {
    return "construction";
  }
  if (/legal|lawyer|compliance|paralegal|risk manager|governance/.test(r)) return "legal";
  return "general";
}

function industryFactor(industry: string): number {
  const exact = INDUSTRY_SALARY_FACTOR[industry as keyof typeof INDUSTRY_SALARY_FACTOR];
  if (exact) return exact;

  const l = industry.toLowerCase();
  if (l.includes("fintech") || l.includes("bank") || l.includes("investment")) return 1.15;
  if (l.includes("technology") || l.includes("software") || l.includes("telecom")) return 1.1;
  if (l.includes("consult")) return 1.12;
  if (l.includes("oil") || l.includes("energy")) return 1.12;
  if (l.includes("hospitality") || l.includes("hotel") || l.includes("restaurant") || l.includes("food")) {
    return 0.88;
  }
  if (l.includes("retail")) return 0.92;
  if (l.includes("health") || l.includes("pharma")) return 1.02;
  if (l.includes("education")) return 0.92;
  return 1;
}

function roundSalary(value: number): number {
  return Math.round(value / 500) * 500;
}

function estimateSalary(
  role: string,
  industry: string,
  experience: ExperienceLevel
): { min: number; max: number } {
  const family = detectRoleFamily(role);
  const [baseMin, baseMax] = SALARY_BASE_MID[family];
  const mult = EXP_PROFILE[experience].salaryMultiplier * industryFactor(industry);
  return {
    min: roundSalary(baseMin * mult),
    max: roundSalary(baseMax * mult),
  };
}

function buildDescription(
  role: string,
  industry: string,
  experience: ExperienceLevel,
  employmentType?: string,
  workArrangement?: string,
  company?: string
): string {
  const exp = EXP_PROFILE[experience];
  const employer = company?.trim() ? company.trim() : `our ${industry} organisation`;
  const arrangement =
    workArrangement && workArrangement !== "On-site"
      ? ` This is a ${workArrangement.toLowerCase()} ${employmentType?.toLowerCase() ?? "full-time"} opportunity based in the UAE.`
      : ` This is a ${employmentType?.toLowerCase() ?? "full-time"} UAE-based opportunity.`;

  return (
    `${employer} is seeking an accomplished ${role} (${exp.tone}, ${exp.years}) to strengthen our ${industry} team. ` +
    `The successful candidate will operate with ${exp.scope} and contribute to measurable business outcomes while maintaining the quality standards expected in the regional market.` +
    arrangement +
    ` We welcome candidates who combine professional rigour, collaboration, and a commitment to continuous improvement.`
  );
}

function familyResponsibilities(
  family: RoleFamily,
  role: string,
  industry: string,
  experience: ExperienceLevel
): string[] {
  const exp = EXP_PROFILE[experience];
  const base: Record<RoleFamily, string[]> = {
    technology: [
      "Design, build, test, and maintain high-quality software aligned with business requirements",
      "Collaborate with product, design, and QA to deliver reliable releases on schedule",
      "Write clean, documented code and participate in structured code reviews",
      "Monitor system performance, troubleshoot incidents, and implement durable fixes",
      "Contribute to technical standards, tooling, and engineering best practices",
      "Support production stability through observability, alerting, and root-cause analysis",
      "Translate functional requirements into scalable technical solutions",
      "Partner with stakeholders to estimate effort, scope, and delivery milestones",
    ],
    data: [
      "Collect, validate, and analyse datasets to support business decision-making",
      "Build dashboards, reports, and metrics that track KPIs for leadership",
      "Partner with stakeholders to define measurement frameworks and success criteria",
      "Ensure data quality, documentation, and governance across reporting assets",
      "Identify trends, anomalies, and opportunities through structured analysis",
      "Present findings clearly to technical and non-technical audiences",
      "Support experimentation, forecasting, or modelling where applicable",
      "Maintain confidentiality and compliance when handling sensitive information",
    ],
    product: [
      "Own product discovery, prioritisation, and delivery for assigned scope",
      "Define clear problem statements, user stories, and measurable success metrics",
      "Collaborate with engineering, design, and commercial teams on roadmap execution",
      "Conduct user research and synthesise insights into actionable product decisions",
      "Monitor product performance and iterate based on data and customer feedback",
      "Communicate roadmap status, risks, and trade-offs to senior stakeholders",
      "Balance user value, technical feasibility, and business impact in prioritisation",
      "Ensure releases meet quality, compliance, and go-to-market readiness standards",
    ],
    design: [
      "Create user-centred designs, wireframes, and prototypes for key product flows",
      "Partner with product and engineering to validate concepts before build",
      "Maintain design systems, UI standards, and brand consistency across touchpoints",
      "Conduct usability reviews and incorporate feedback into iterative improvements",
      "Present design rationale clearly to stakeholders and incorporate business constraints",
      "Deliver production-ready assets and specifications for development teams",
      "Advocate for accessibility, clarity, and high-quality visual execution",
      "Stay current with design trends relevant to the {industry} sector",
    ],
    marketing: [
      "Plan and execute integrated campaigns that support pipeline and brand objectives",
      "Manage channel performance across paid, owned, and earned media where applicable",
      "Produce or coordinate content aligned with brand voice and campaign goals",
      "Track campaign KPIs and prepare performance reports with actionable insights",
      "Collaborate with sales, product, and creative teams on launches and promotions",
      "Optimise budgets, targeting, and messaging based on market response",
      "Maintain campaign calendars, assets, and approval workflows",
      "Monitor competitor activity and market trends within {industry}",
    ],
    sales: [
      "Prospect, qualify, and advance opportunities through a structured sales process",
      "Build trusted relationships with clients and understand their commercial needs",
      "Prepare proposals, conduct presentations, and negotiate terms professionally",
      "Maintain accurate pipeline data, forecasts, and activity records in CRM",
      "Meet or exceed assigned revenue, activity, and conversion targets",
      "Collaborate with marketing and operations to support smooth client onboarding",
      "Represent the organisation with professionalism across meetings and events",
      "Provide market feedback to leadership on pricing, product, and competition",
    ],
    finance: [
      "Prepare accurate financial records, reconciliations, and management reports",
      "Support budgeting, forecasting, and variance analysis for assigned areas",
      "Ensure compliance with internal controls, policies, and UAE regulatory requirements",
      "Process transactions, invoices, and payments with attention to detail",
      "Assist with VAT, audit, and statutory reporting activities as required",
      "Partner with department heads to provide timely financial insight",
      "Maintain organised documentation and audit-ready working papers",
      "Identify process improvements that strengthen control and efficiency",
    ],
    hr: [
      "Support end-to-end recruitment, onboarding, and employee lifecycle processes",
      "Maintain HR policies and practices aligned with UAE labour law requirements",
      "Partner with managers on performance, probation, and employee relations matters",
      "Coordinate visa, medical, and documentation processes where applicable",
      "Manage HR records, contracts, and confidential employee information securely",
      "Support engagement, learning, and retention initiatives across the organisation",
      "Provide guidance on compensation, benefits, and HR best practices",
      "Prepare HR reports and metrics for leadership review",
    ],
    operations: [
      "Coordinate daily operations to meet service levels, quality, and cost targets",
      "Monitor workflows, inventory, and resource utilisation across assigned areas",
      "Identify bottlenecks and implement practical process improvements",
      "Partner with suppliers, logistics providers, and internal teams to ensure continuity",
      "Prepare operational reports, dashboards, and exception summaries",
      "Ensure compliance with safety, quality, and company operating standards",
      "Support budgeting, planning, and capacity decisions with accurate data",
      "Handle escalations professionally and drive timely resolution",
    ],
    healthcare: [
      "Deliver professional patient or clinical support in line with scope of practice",
      "Maintain accurate records and comply with healthcare regulations and protocols",
      "Collaborate with multidisciplinary teams to ensure safe, effective care",
      "Uphold hygiene, confidentiality, and patient experience standards at all times",
      "Support clinic or ward operations through scheduling and documentation",
      "Participate in quality improvement and safety initiatives",
      "Communicate clearly with patients, families, and colleagues",
      "Stay current with relevant certifications and clinical best practices",
    ],
    hospitality: [
      "Deliver consistent, high-quality guest service across all touchpoints",
      "Maintain operational standards for cleanliness, presentation, and timing",
      "Handle guest requests, complaints, and escalations with professionalism",
      "Coordinate with team members during peak periods and special events",
      "Follow food safety, hygiene, and brand service protocols at all times",
      "Support inventory, setup, and closing procedures as required",
      "Upsell services or experiences where appropriate and aligned with guest needs",
      "Contribute to a positive team culture and smooth shift handovers",
    ],
    construction: [
      "Execute project tasks in accordance with drawings, specifications, and HSE standards",
      "Coordinate with site supervision, subcontractors, and project teams daily",
      "Monitor workmanship, materials, and progress against planned milestones",
      "Report site issues, delays, and safety observations promptly",
      "Maintain accurate site records, permits, and inspection documentation",
      "Ensure tools, equipment, and work areas meet safety requirements",
      "Support quality checks and snag-list closure before handover",
      "Promote a culture of safety, precision, and accountability on site",
    ],
    legal: [
      "Provide legal or compliance support on contracts, policies, and regulatory matters",
      "Review documentation for risk, accuracy, and alignment with company standards",
      "Partner with business units on commercial negotiations and approvals",
      "Monitor regulatory developments relevant to {industry} in the UAE",
      "Maintain organised legal files, registers, and audit trails",
      "Support dispute prevention through clear guidance and documentation",
      "Prepare briefings and summaries for senior leadership when required",
      "Uphold confidentiality and professional ethics in all matters",
    ],
    leadership: [
      "Define strategic priorities and translate them into executable operating plans",
      "Lead cross-functional teams to deliver revenue, service, and quality targets",
      "Build organisational capability through hiring, coaching, and performance management",
      "Manage budgets, forecasts, and resource allocation with commercial discipline",
      "Represent the company with clients, partners, regulators, and senior stakeholders",
      "Establish KPIs, accountability, and reporting rhythms across the function",
      "Drive continuous improvement, risk management, and operational excellence",
      "Champion culture, compliance, and long-term sustainable growth",
    ],
    general: [
      "Execute core {role} responsibilities to a high professional standard",
      "Collaborate with internal teams to meet deadlines, quality, and service expectations",
      "Maintain accurate records, reports, and documentation for stakeholders",
      "Identify opportunities to improve processes, efficiency, and customer outcomes",
      "Communicate progress, risks, and dependencies clearly to management",
      "Support projects, initiatives, and cross-functional priorities as assigned",
      "Uphold company policies, compliance requirements, and brand standards",
      "Contribute to a respectful, accountable, and results-oriented workplace",
    ],
  };

  let items = base[family].map((line) =>
    line.replaceAll("{role}", role).replaceAll("{industry}", industry)
  );

  if (experience === "Entry") {
    items = [
      `Support senior colleagues in day-to-day ${role} activities under structured guidance`,
      "Learn internal tools, workflows, and quality standards through hands-on execution",
      ...items.slice(0, 6),
    ];
  } else if (experience === "Senior" || experience === "Lead") {
    items = [
      ...items.slice(0, 6),
      "Mentor junior team members and review work for quality and consistency",
      "Lead initiatives that improve team efficiency, quality, or customer outcomes",
    ];
  } else if (experience === "Executive") {
    items = [
      `Set the strategic direction for the ${role} function within ${industry}`,
      "Own executive KPIs, organisational design, and performance accountability",
      "Align board, investor, and senior stakeholder expectations with operational delivery",
      "Drive transformation, growth, and risk-aware decision-making at enterprise level",
      ...items.slice(0, 5),
    ];
  }

  return items.slice(0, 10);
}

function buildQualifications(
  role: string,
  industry: string,
  experience: ExperienceLevel,
  family: RoleFamily
): string[] {
  const exp = EXP_PROFILE[experience];
  const degree =
    family === "hospitality" || family === "construction"
      ? "Relevant vocational qualification, certification, or equivalent practical experience"
      : "Bachelor's degree in a relevant discipline or equivalent professional experience";

  const core = [
    `${exp.years} of relevant experience as a ${role} or in a closely related ${family} role`,
    degree,
    `Demonstrated success operating within ${industry} or a comparable sector`,
    "Excellent written and verbal communication skills in English",
    "Strong organisational skills, attention to detail, and professional integrity",
    "Ability to work collaboratively across teams and manage competing priorities",
    "Proficiency with role-relevant tools, systems, and documentation standards",
    "Eligible to work in the UAE; visa sponsorship may be available for the right candidate",
  ];

  const seniorAdd =
    experience === "Senior" || experience === "Lead" || experience === "Executive"
      ? [
          "Proven track record of delivering outcomes with minimal supervision",
          "Experience influencing stakeholders and managing complex priorities",
        ]
      : [];

  const entryAdd =
    experience === "Entry"
      ? ["Motivated to learn, receptive to feedback, and committed to professional development"]
      : [];

  const familyAdd: Partial<Record<RoleFamily, string[]>> = {
    technology: ["Solid problem-solving skills and understanding of software development lifecycle"],
    finance: ["Working knowledge of UAE VAT and financial reporting standards preferred"],
    healthcare: ["Valid professional licence or eligibility to obtain UAE licensing where required"],
    legal: ["Relevant legal qualification and admission to practice preferred"],
    sales: ["Target-driven mindset with proven client relationship skills"],
  };

  return [...core, ...seniorAdd, ...entryAdd, ...(familyAdd[family] ?? [])].slice(0, 10);
}

function buildBenefits(
  industry: string,
  experience: ExperienceLevel,
  workArrangement?: string
): string[] {
  const base = [
    "Competitive tax-free salary aligned with experience and market benchmarks",
    "Comprehensive medical insurance",
    "Annual leave and public holidays as per UAE labour law",
    "End-of-service benefits in accordance with UAE regulations",
    "Visa sponsorship and Emirates ID processing for eligible candidates",
    "Professional, respectful workplace with clear performance expectations",
    "Structured onboarding and role-specific training",
    "Opportunity to grow within a reputable {industry} organisation",
  ];

  const premium =
    experience === "Senior" || experience === "Lead" || experience === "Executive"
      ? [
          "Performance-based annual bonus or incentive scheme",
          "Enhanced medical coverage for dependents (where applicable)",
          "Annual flight allowance or ticket benefit",
          "Learning, certification, or executive development support",
        ]
      : ["Performance incentives where applicable", "Annual flight allowance (where applicable)"];

  const arrangement =
    workArrangement === "Remote" || workArrangement === "Hybrid"
      ? ["Flexible or hybrid working arrangement"]
      : [];

  const industryAdd: Record<string, string[]> = {
    "Technology & Software": ["Exposure to modern tools, platforms, and innovation-led projects"],
    "Fintech & Digital Payments": ["Regulated-environment experience with growth-stage opportunities"],
    "Banking & Financial Services": ["Stable employer with structured career pathways"],
    Hospitality: ["Staff meals, discounts, or service charge participation where applicable"],
    Healthcare: ["Continuing professional development and clinical support"],
  };

  let industryExtras: string[] = [];
  for (const [key, extras] of Object.entries(industryAdd)) {
    if (industry.toLowerCase().includes(key.toLowerCase().split(" ")[0]!)) {
      industryExtras = extras;
      break;
    }
  }

  return [...base, ...premium, ...arrangement, ...industryExtras]
    .map((b) => b.replaceAll("{industry}", industry))
    .slice(0, 10);
}

export function generateLocalJobListingSuggestions(
  params: GenerateParams
): JobListingSuggestions {
  const experience = normalizeExperience(params.experienceLevel);
  const family = detectRoleFamily(params.role);
  const salary = estimateSalary(params.role, params.industry, experience);

  return {
    description: buildDescription(
      params.role,
      params.industry,
      experience,
      params.employmentType,
      params.workArrangement,
      params.company
    ),
    responsibilities: familyResponsibilities(
      family,
      params.role,
      params.industry,
      experience
    ),
    qualifications: buildQualifications(
      params.role,
      params.industry,
      experience,
      family
    ),
    benefits: buildBenefits(params.industry, experience, params.workArrangement),
    salaryMin: salary.min,
    salaryMax: salary.max,
    experience,
    source: "template",
  };
}

export async function fetchJobListingSuggestions(
  params: GenerateParams
): Promise<JobListingSuggestions> {
  const token = getStoredAuthToken();

  if (token) {
    try {
      const res = await api.jobListingSuggestions(
        {
          role: params.role,
          industry: params.industry,
          employment_type: params.employmentType,
          experience_level: params.experienceLevel,
          work_arrangement: params.workArrangement,
          company: params.company,
        },
        token
      );
      return { ...res.data, source: "ai" };
    } catch {
      /* fall through to local templates */
    }
  }

  return generateLocalJobListingSuggestions(params);
}

export function linesToText(lines: string[]): string {
  return lines.map((line) => `• ${line}`).join("\n");
}
