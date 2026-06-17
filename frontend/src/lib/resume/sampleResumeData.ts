import type { ResumeData } from "@/types/resume";

/** Realistic sample content for template previews */
export const SAMPLE_RESUME_DATA: ResumeData = {
  personal_info: {
    full_name: "Sarah Al Mansoori",
    email: "sarah.m@email.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    linkedin: "linkedin.com/in/sarahalm",
    website: "",
  },
  summary:
    "Marketing specialist with 5+ years driving brand growth across the GCC. Skilled in digital campaigns, analytics, and cross-functional team leadership.",
  experiences: [
    {
      id: "sample-exp-1",
      job_title: "Senior Marketing Coordinator",
      company: "Emirates Retail Group",
      location: "Dubai",
      start_date: "Jan 2021",
      end_date: "",
      is_current: true,
      bullets: [
        "Led regional campaigns reaching 2M+ customers across UAE and KSA.",
        "Managed AED 1.2M annual budget with 18% ROI improvement.",
      ],
    },
    {
      id: "sample-exp-2",
      job_title: "Marketing Associate",
      company: "Gulf Media Partners",
      location: "Abu Dhabi",
      start_date: "Jun 2018",
      end_date: "Dec 2020",
      is_current: false,
      bullets: ["Supported product launches and social media strategy for 12 brands."],
    },
  ],
  education: [
    {
      id: "sample-edu-1",
      degree: "BBA, Marketing",
      school: "American University of Sharjah",
      location: "Sharjah",
      start_date: "2014",
      end_date: "2018",
      description: "",
    },
  ],
  skills: ["Digital Marketing", "Google Analytics", "SEO", "Campaign Strategy", "Arabic & English"],
  languages: [{ name: "English", level: "Native" }, { name: "Arabic", level: "Fluent" }],
  projects: [],
  certifications: [],
};
