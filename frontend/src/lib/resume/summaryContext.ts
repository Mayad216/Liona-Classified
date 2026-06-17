import type { ResumeData } from "@/types/resume";

export function buildSummaryContext(data: ResumeData): { jobTitle: string; notes: string } {
  const jobTitle =
    data.experiences.find((e) => e.job_title.trim())?.job_title.trim() ||
    "Professional";

  const lines: string[] = [];
  const pi = data.personal_info;

  if (pi.full_name.trim()) lines.push(`Name: ${pi.full_name.trim()}`);
  if (pi.location.trim()) lines.push(`Location: ${pi.location.trim()}`);

  for (const exp of data.experiences) {
    if (!exp.job_title.trim() && !exp.company.trim()) continue;

    let role = exp.job_title.trim() || "Role";
    if (exp.company.trim()) role += ` at ${exp.company.trim()}`;
    if (exp.location.trim()) role += ` (${exp.location.trim()})`;

    const dates = [exp.start_date, exp.is_current ? "Present" : exp.end_date]
      .filter(Boolean)
      .join(" – ");
    if (dates) role += `, ${dates}`;

    lines.push(role);
    for (const bullet of exp.bullets) {
      if (bullet.trim()) lines.push(`• ${bullet.trim()}`);
    }
  }

  for (const edu of data.education) {
    if (edu.degree.trim() || edu.school.trim()) {
      lines.push(`Education: ${[edu.degree, edu.school].filter((s) => s.trim()).join(", ")}`);
    }
  }

  if (data.skills.length > 0) {
    lines.push(`Skills: ${data.skills.join(", ")}`);
  }

  for (const lang of data.languages) {
    if (lang.name.trim()) {
      lines.push(`Language: ${lang.name}${lang.level ? ` (${lang.level})` : ""}`);
    }
  }

  for (const project of data.projects) {
    if (project.name.trim()) {
      lines.push(
        `Project: ${project.name}${project.description.trim() ? ` — ${project.description.trim()}` : ""}`
      );
    }
  }

  for (const cert of data.certifications) {
    if (cert.name.trim()) {
      lines.push(`Certification: ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}`);
    }
  }

  return { jobTitle, notes: lines.join("\n").slice(0, 4000) };
}

export function hasEnoughForSummary(data: ResumeData): boolean {
  return (
    data.experiences.some(
      (e) => e.job_title.trim() || e.company.trim() || e.bullets.some((b) => b.trim())
    ) ||
    data.education.some((e) => e.degree.trim() || e.school.trim()) ||
    data.skills.length > 0
  );
}

export function fallbackSummaryFromResume(data: ResumeData): string {
  const { jobTitle, notes } = buildSummaryContext(data);
  const snippet = notes.slice(0, 200).trim();

  return `Results-driven ${jobTitle} with experience across the UAE market.${
    snippet ? ` Background includes ${snippet.replace(/\n/g, "; ")}.` : ""
  } Brings strong communication skills and a proven ability to deliver on team and organizational goals. Seeking a role where expertise and dedication create measurable impact.`;
}
