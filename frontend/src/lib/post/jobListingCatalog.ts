/** Comprehensive job roles for UAE employers — grouped in source, exported as a sorted flat list. */

const TECHNOLOGY_IT = [
  "Software Engineer",
  "Senior Software Engineer",
  "Lead Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Developer",
  "Mobile App Developer (iOS)",
  "Mobile App Developer (Android)",
  "DevOps Engineer",
  "Cloud Engineer",
  "Site Reliability Engineer",
  "Solutions Architect",
  "Cybersecurity Analyst",
  "Information Security Manager",
  "Network Engineer",
  "Systems Administrator",
  "IT Support Specialist",
  "IT Manager",
  "Database Administrator",
  "QA Engineer",
  "Automation Test Engineer",
  "Technical Support Engineer",
  "Scrum Master",
  "Agile Coach",
] as const;

const DATA_AI = [
  "Data Analyst",
  "Senior Data Analyst",
  "Business Intelligence Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Data Engineer",
  "Analytics Manager",
] as const;

const PRODUCT_DESIGN = [
  "Product Manager",
  "Senior Product Manager",
  "Product Owner",
  "Product Designer",
  "Senior Product Designer",
  "UX Designer",
  "UI Designer",
  "UX Researcher",
  "Graphic Designer",
  "Creative Director",
  "Content Designer",
] as const;

const ENGINEERING = [
  "Civil Engineer",
  "Structural Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "MEP Engineer",
  "Project Engineer",
  "Site Engineer",
  "Quantity Surveyor",
  "Architect",
  "Interior Designer",
  "Landscape Architect",
  "BIM Coordinator",
  "HVAC Engineer",
  "Maintenance Engineer",
] as const;

const MARKETING_CREATIVE = [
  "Marketing Executive",
  "Marketing Manager",
  "Senior Marketing Manager",
  "Digital Marketing Manager",
  "Performance Marketing Specialist",
  "SEO Specialist",
  "Social Media Manager",
  "Content Writer",
  "Copywriter",
  "Brand Manager",
  "Public Relations Manager",
  "Communications Manager",
  "Events Manager",
  "Videographer",
  "Photographer",
] as const;

const SALES_BD = [
  "Sales Executive",
  "Senior Sales Executive",
  "Sales Manager",
  "Business Development Manager",
  "Business Development Executive",
  "Account Manager",
  "Key Account Manager",
  "Inside Sales Representative",
  "Telesales Executive",
  "Retail Sales Associate",
  "Real Estate Agent",
  "Real Estate Broker",
  "Leasing Consultant",
  "Pre-Sales Consultant",
  "Partnerships Manager",
] as const;

const FINANCE_ACCOUNTING = [
  "Accountant",
  "Senior Accountant",
  "Finance Manager",
  "Financial Controller",
  "Financial Analyst",
  "Management Accountant",
  "Accounts Payable Specialist",
  "Accounts Receivable Specialist",
  "Payroll Specialist",
  "Tax Consultant",
  "Auditor",
  "Internal Auditor",
  "Treasury Analyst",
  "Chief Financial Officer (CFO)",
] as const;

const HR_ADMIN = [
  "HR Coordinator",
  "HR Executive",
  "HR Manager",
  "HR Business Partner",
  "Talent Acquisition Specialist",
  "Recruiter",
  "Learning & Development Manager",
  "Office Manager",
  "Administrative Assistant",
  "Executive Assistant",
  "Personal Assistant",
  "Receptionist",
  "Office Administrator",
] as const;

const OPERATIONS_LOGISTICS = [
  "Operations Manager",
  "Operations Executive",
  "Supply Chain Manager",
  "Logistics Coordinator",
  "Warehouse Supervisor",
  "Inventory Controller",
  "Procurement Officer",
  "Purchasing Manager",
  "Fleet Manager",
  "Import / Export Coordinator",
  "Customs Clearance Officer",
  "Dispatcher",
  "Storekeeper",
] as const;

const CUSTOMER_SERVICE = [
  "Customer Service Representative",
  "Customer Success Manager",
  "Call Center Agent",
  "Client Relations Executive",
  "Guest Relations Executive",
  "Community Manager",
  "Technical Account Manager",
] as const;

const HEALTHCARE = [
  "General Practitioner",
  "Specialist Doctor",
  "Registered Nurse",
  "Staff Nurse",
  "Pharmacist",
  "Physiotherapist",
  "Dental Assistant",
  "Medical Laboratory Technician",
  "Radiographer",
  "Healthcare Administrator",
  "Clinic Manager",
] as const;

const EDUCATION = [
  "Teacher",
  "Subject Teacher",
  "Early Years Teacher",
  "Teaching Assistant",
  "School Administrator",
  "Academic Coordinator",
  "Curriculum Developer",
  "Training Manager",
  "Corporate Trainer",
  "Language Instructor",
] as const;

const HOSPITALITY_FNB = [
  "Hotel Manager",
  "Front Office Manager",
  "Guest Service Agent",
  "Concierge",
  "Housekeeping Supervisor",
  "Restaurant Manager",
  "F&B Manager",
  "Head Chef",
  "Sous Chef",
  "Commis Chef",
  "Barista",
  "Waiter / Waitress",
  "Banquet Manager",
  "Spa Therapist",
  "Travel Consultant",
  "Tour Guide",
] as const;

const RETAIL = [
  "Retail Store Manager",
  "Assistant Store Manager",
  "Visual Merchandiser",
  "Cashier",
  "Stock Controller",
  "E-commerce Manager",
  "Merchandising Manager",
  "Category Manager",
] as const;

const LEGAL_COMPLIANCE = [
  "Legal Counsel",
  "Corporate Lawyer",
  "Paralegal",
  "Compliance Officer",
  "Compliance Manager",
  "Risk Manager",
  "Governance Manager",
  "Company Secretary",
] as const;

const CONSTRUCTION_TRADES = [
  "Construction Manager",
  "Project Manager (Construction)",
  "Foreman",
  "Safety Officer",
  "HSE Manager",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mason",
  "Welder",
  "Painter",
  "HVAC Technician",
  "Facility Manager",
  "Handyman",
] as const;

const AVIATION_MARITIME = [
  "Aircraft Engineer",
  "Ground Handling Agent",
  "Cabin Crew",
  "Pilot",
  "Airport Operations Officer",
  "Marine Engineer",
  "Port Operations Coordinator",
  "Shipping Coordinator",
] as const;

const SECURITY_FACILITIES = [
  "Security Guard",
  "Security Supervisor",
  "CCTV Operator",
  "Lifeguard",
  "Cleaner",
  "Housekeeper",
  "Driver",
  "Delivery Driver",
  "Courier",
  "Valet Driver",
] as const;

const LEADERSHIP = [
  "General Manager",
  "Managing Director",
  "Chief Executive Officer (CEO)",
  "Chief Operating Officer (COO)",
  "Chief Technology Officer (CTO)",
  "Chief Marketing Officer (CMO)",
  "Country Manager",
  "Regional Manager",
  "Department Head",
  "Director",
  "Vice President",
] as const;

const OTHER_ROLES = [
  "Consultant",
  "Management Consultant",
  "Strategy Consultant",
  "Research Analyst",
  "Policy Analyst",
  "Environmental Specialist",
  "Sustainability Manager",
  "Quality Assurance Manager",
  "Production Supervisor",
  "Manufacturing Engineer",
  "Laboratory Technician",
  "Insurance Advisor",
  "Relationship Manager (Banking)",
  "Teller (Banking)",
  "Investment Analyst",
  "Wealth Manager",
  "Other",
] as const;

export const JOB_ROLES = [
  ...TECHNOLOGY_IT,
  ...DATA_AI,
  ...PRODUCT_DESIGN,
  ...ENGINEERING,
  ...MARKETING_CREATIVE,
  ...SALES_BD,
  ...FINANCE_ACCOUNTING,
  ...HR_ADMIN,
  ...OPERATIONS_LOGISTICS,
  ...CUSTOMER_SERVICE,
  ...HEALTHCARE,
  ...EDUCATION,
  ...HOSPITALITY_FNB,
  ...RETAIL,
  ...LEGAL_COMPLIANCE,
  ...CONSTRUCTION_TRADES,
  ...AVIATION_MARITIME,
  ...SECURITY_FACILITIES,
  ...LEADERSHIP,
  ...OTHER_ROLES,
].sort((a, b) => a.localeCompare(b)) as readonly string[];

export type JobRole = (typeof JOB_ROLES)[number];

export const JOB_INDUSTRIES = [
  "Technology & Software",
  "Fintech & Digital Payments",
  "Banking & Financial Services",
  "Insurance",
  "Investment & Asset Management",
  "Real Estate & Property",
  "Construction & Engineering",
  "Architecture & Design",
  "Hospitality & Tourism",
  "Hotels & Resorts",
  "Food & Beverage",
  "Restaurants & Cafés",
  "Retail & E-commerce",
  "Luxury Retail",
  "Healthcare & Hospitals",
  "Pharmaceuticals & Life Sciences",
  "Medical Devices",
  "Education & Training",
  "Higher Education",
  "Logistics & Supply Chain",
  "Transportation & Mobility",
  "Aviation & Aerospace",
  "Maritime & Ports",
  "Energy & Utilities",
  "Oil & Gas",
  "Renewable Energy",
  "Manufacturing & Industrial",
  "Automotive",
  "Media & Entertainment",
  "Advertising & Marketing",
  "Telecommunications",
  "Legal & Professional Services",
  "Consulting",
  "Accounting & Audit",
  "Human Resources & Staffing",
  "Government & Public Sector",
  "Non-profit & NGOs",
  "Agriculture & AgriTech",
  "Beauty & Wellness",
  "Sports & Fitness",
  "Events & Exhibitions",
  "Security Services",
  "Facility Management",
  "Cleaning & Hygiene Services",
  "Fashion & Apparel",
  "Consumer Goods & FMCG",
  "Import / Export & Trading",
  "Blockchain & Web3",
  "Gaming & Esports",
  "Other",
] as const;

export type JobIndustry = (typeof JOB_INDUSTRIES)[number];

export function jobRoleOptions(includePlaceholder = true) {
  const options = JOB_ROLES.map((role) => ({ value: role, label: role }));
  return includePlaceholder
    ? [{ value: "", label: "Select a role…" }, ...options]
    : options;
}

export function jobIndustryOptions(includePlaceholder = true) {
  const options = JOB_INDUSTRIES.map((industry) => ({ value: industry, label: industry }));
  return includePlaceholder
    ? [{ value: "", label: "Select an industry…" }, ...options]
    : options;
}

export function mergeJobListingOptions(
  builtIn: readonly string[],
  custom: string[],
  includePlaceholder = false,
  placeholderLabel = "Select…"
): { value: string; label: string }[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const item of builtIn) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  for (const item of custom) {
    const trimmed = item.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    merged.push(trimmed);
  }

  merged.sort((a, b) => a.localeCompare(b));
  const options = merged.map((value) => ({ value, label: value }));

  return includePlaceholder
    ? [{ value: "", label: placeholderLabel }, ...options]
    : options;
}
