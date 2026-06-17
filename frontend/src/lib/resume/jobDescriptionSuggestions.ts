export type JobDescriptionSuggestion = {
  text: string;
  recommended: boolean;
};

type SuggestionSet = {
  keywords: string[];
  suggestions: JobDescriptionSuggestion[];
};

const SUGGESTION_SETS: SuggestionSet[] = [
  {
    keywords: ["engineer", "developer", "devops", "software", "frontend", "backend", "full stack"],
    suggestions: [
      {
        text: "Designed, developed, and maintained scalable applications aligned with business requirements",
        recommended: true,
      },
      {
        text: "Collaborated with product and design teams to deliver features on schedule and within scope",
        recommended: true,
      },
      {
        text: "Improved system performance and reliability through code reviews, testing, and refactoring",
        recommended: true,
      },
      { text: "Documented technical solutions and shared knowledge with cross-functional stakeholders", recommended: false },
      { text: "Participated in agile ceremonies and contributed to sprint planning and retrospectives", recommended: false },
      { text: "Mentored junior team members and supported onboarding of new developers", recommended: false },
      { text: "Integrated third-party APIs and services to extend product capabilities", recommended: false },
      { text: "Troubleshot production issues and implemented fixes to minimize downtime", recommended: false },
    ],
  },
  {
    keywords: ["manager", "lead", "director", "head of", "supervisor"],
    suggestions: [
      {
        text: "Led team planning and execution to deliver projects on time and within budget",
        recommended: true,
      },
      {
        text: "Defined goals, KPIs, and workflows to improve team productivity and accountability",
        recommended: true,
      },
      {
        text: "Coached and developed team members through regular feedback and performance reviews",
        recommended: true,
      },
      { text: "Partnered with senior leadership to align department priorities with company strategy", recommended: false },
      { text: "Managed stakeholder expectations and communicated progress to internal and external partners", recommended: false },
      { text: "Optimized processes to reduce costs and improve service quality", recommended: false },
      { text: "Handled resource allocation and hiring to support business growth", recommended: false },
      { text: "Resolved escalations and maintained high standards of customer or client satisfaction", recommended: false },
    ],
  },
  {
    keywords: ["sales", "account", "business development", "marketing"],
    suggestions: [
      {
        text: "Built and maintained client relationships to achieve revenue and retention targets",
        recommended: true,
      },
      {
        text: "Identified new business opportunities and converted leads into long-term accounts",
        recommended: true,
      },
      {
        text: "Prepared proposals, presentations, and negotiations aligned with customer needs",
        recommended: true,
      },
      { text: "Tracked pipeline activity and reported forecasts to management on a regular basis", recommended: false },
      { text: "Collaborated with marketing to launch campaigns and support brand visibility", recommended: false },
      { text: "Represented the company at industry events and networking opportunities", recommended: false },
      { text: "Analyzed market trends to refine outreach strategies and pricing approaches", recommended: false },
      { text: "Exceeded quarterly targets through proactive follow-up and relationship management", recommended: false },
    ],
  },
  {
    keywords: ["accountant", "finance", "analyst", "auditor"],
    suggestions: [
      {
        text: "Prepared financial statements, reports, and reconciliations in compliance with standards",
        recommended: true,
      },
      {
        text: "Supported budgeting, forecasting, and variance analysis for management decision-making",
        recommended: true,
      },
      {
        text: "Maintained accurate records and internal controls to ensure audit readiness",
        recommended: true,
      },
      { text: "Processed invoices, payments, and expense claims with attention to detail", recommended: false },
      { text: "Coordinated with external auditors and addressed findings promptly", recommended: false },
      { text: "Identified cost-saving opportunities through data review and process improvements", recommended: false },
      { text: "Managed tax filings and regulatory submissions within required deadlines", recommended: false },
      { text: "Partnered with operations teams to track project profitability and cash flow", recommended: false },
    ],
  },
  {
    keywords: ["nurse", "doctor", "medical", "pharmacist", "healthcare"],
    suggestions: [
      {
        text: "Delivered patient care in accordance with clinical protocols and safety standards",
        recommended: true,
      },
      {
        text: "Collaborated with multidisciplinary teams to assess, treat, and monitor patients",
        recommended: true,
      },
      {
        text: "Maintained accurate medical records and documentation for continuity of care",
        recommended: true,
      },
      { text: "Educated patients and families on treatment plans, medications, and follow-up care", recommended: false },
      { text: "Responded effectively to emergencies and high-priority cases", recommended: false },
      { text: "Supported infection control and quality improvement initiatives", recommended: false },
      { text: "Ensured compliance with healthcare regulations and hospital policies", recommended: false },
      { text: "Participated in training programs to stay current with best practices", recommended: false },
    ],
  },
  {
    keywords: ["teacher", "instructor", "trainer", "education"],
    suggestions: [
      {
        text: "Planned and delivered engaging lessons aligned with curriculum standards and learning outcomes",
        recommended: true,
      },
      {
        text: "Assessed student progress and provided constructive feedback to support improvement",
        recommended: true,
      },
      {
        text: "Created inclusive classroom environments that encouraged participation and collaboration",
        recommended: true,
      },
      { text: "Communicated regularly with parents and guardians on student development", recommended: false },
      { text: "Integrated technology and varied teaching methods to accommodate different learning styles", recommended: false },
      { text: "Organized extracurricular activities and school events to enrich student experience", recommended: false },
      { text: "Collaborated with colleagues on curriculum development and departmental initiatives", recommended: false },
      { text: "Maintained accurate attendance and academic records", recommended: false },
    ],
  },
];

const GENERIC_SUGGESTIONS: JobDescriptionSuggestion[] = [
  {
    text: "Managed day-to-day responsibilities while maintaining high standards of quality and accuracy",
    recommended: true,
  },
  {
    text: "Collaborated with colleagues and stakeholders to achieve team and organizational goals",
    recommended: true,
  },
  {
    text: "Identified opportunities to improve workflows and contributed to process enhancements",
    recommended: true,
  },
  { text: "Handled multiple priorities in a fast-paced environment with strong attention to detail", recommended: false },
  { text: "Communicated clearly with internal and external partners to resolve issues efficiently", recommended: false },
  { text: "Supported special projects and ad-hoc tasks as assigned by management", recommended: false },
  { text: "Maintained accurate documentation and reporting in line with company policies", recommended: false },
  { text: "Demonstrated reliability, professionalism, and a proactive approach to problem-solving", recommended: false },
];

export function getLocalJobDescriptionSuggestions(jobTitle: string): JobDescriptionSuggestion[] {
  const q = jobTitle.trim().toLowerCase();
  if (!q) return GENERIC_SUGGESTIONS;

  for (const set of SUGGESTION_SETS) {
    if (set.keywords.some((kw) => q.includes(kw))) {
      return set.suggestions;
    }
  }

  return GENERIC_SUGGESTIONS;
}

export function sortSuggestions(suggestions: JobDescriptionSuggestion[]): JobDescriptionSuggestion[] {
  return [...suggestions].sort((a, b) => Number(b.recommended) - Number(a.recommended));
}
